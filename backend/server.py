"""
YUGOLEARN — Backend Application Server
FastAPI + Uvicorn server providing REST APIs for:
- SQLite Persistent Memory Sync
- Spaced Repetition Logistics Engine (SM-2 / FSRS)
- Local AI Serbian Tutor (Ollama + Native Linguistic NLP)
- Mistake Journal & Weakness Logistics
- LingQ-style Vocabulary Bank
- Static Web Application Serving
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import (
    init_db, seed_initial_content, get_user_state, update_user_state,
    add_xp, log_mistake, resolve_mistake, get_mistakes, log_session,
    get_connection
)
from logistics import SRSLogistics
from intelligence import LocalIntelligence, SCENARIOS, to_latin, to_cyrillic

# Initialize database schema
init_db()

# Load initial data from data.js if srs_items is empty
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_JS_PATH = BASE_DIR / "js" / "data.js"

app = FastAPI(
    title="YUGOLEARN Backend",
    description="Local intelligence and persistent memory logistics backend for Serbian language learning",
    version="2.0.0"
)

# Enable CORS for local client development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Pydantic Request Models
# -------------------------------------------------------------
class StateUpdateReq(BaseModel):
    xp: Optional[int] = None
    streak: Optional[int] = None
    lastActiveDate: Optional[str] = None
    dailyXpGoal: Optional[int] = None
    todayXp: Optional[int] = None
    settings: Optional[Dict[str, Any]] = None

class XPReq(BaseModel):
    amount: int
    reason: Optional[str] = "study_reward"

class SRSReviewReq(BaseModel):
    card_id: str
    grade: int # 1 = Again, 2 = Hard, 3 = Good, 4 = Easy

class MistakeLogReq(BaseModel):
    mode: str
    item_id: Optional[str] = ""
    prompt: str
    user_answer: str
    correct_answer: str
    explanation: Optional[str] = ""
    category: Optional[str] = ""

class VocabAddReq(BaseModel):
    cyr: Optional[str] = ""
    lat: Optional[str] = ""
    en: str
    category: Optional[str] = "custom"
    notes: Optional[str] = ""

class AIChatReq(BaseModel):
    scenario: str
    message: str
    model: Optional[str] = None

class SentenceEvalReq(BaseModel):
    sentence: str

class SessionLogReq(BaseModel):
    mode: str
    duration_seconds: int
    total_items: int
    correct_items: int
    xp_earned: int

# -------------------------------------------------------------
# 1. System Health & Diagnostics
# -------------------------------------------------------------
@app.get("/api/health")
def get_health():
    ai_status = LocalIntelligence.get_status()
    db_conn = get_connection()
    cur = db_conn.cursor()
    cur.execute("SELECT COUNT(*) as c FROM srs_items")
    srs_count = cur.fetchone()["c"]
    cur.execute("SELECT COUNT(*) as c FROM mistake_logs WHERE resolved = 0")
    mistakes_count = cur.fetchone()["c"]
    db_conn.close()

    return {
        "status": "healthy",
        "app": "YUGOLEARN",
        "version": "2.0.0",
        "persistent_db": "SQLite WAL Mode Online",
        "srs_total_cards": srs_count,
        "active_mistakes": mistakes_count,
        "ai": ai_status
    }

# -------------------------------------------------------------
# 2. State & Persistence Endpoints
# -------------------------------------------------------------
@app.get("/api/state")
def api_get_state():
    state = get_user_state()
    # Also fetch letter mastery dictionary from srs_items
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT front_cyr, mastery_level FROM srs_items WHERE item_type = 'letter'")
    mastery = {r["front_cyr"]: r["mastery_level"] for r in cur.fetchall()}
    conn.close()

    state["letterMastery"] = mastery
    return state

@app.post("/api/state")
def api_update_state(req: StateUpdateReq):
    current = get_user_state()
    updated = {
        "xp": req.xp if req.xp is not None else current.get("xp", 0),
        "streak": req.streak if req.streak is not None else current.get("streak", 1),
        "lastActiveDate": req.lastActiveDate or current.get("lastActiveDate"),
        "dailyXpGoal": req.dailyXpGoal or current.get("dailyXpGoal", 50),
        "todayXp": req.todayXp if req.todayXp is not None else current.get("todayXp", 0),
        "settings": req.settings if req.settings is not None else current.get("settings", {})
    }
    update_user_state(updated)
    return {"status": "ok", "synced_state": updated}

@app.post("/api/xp")
def api_add_xp(req: XPReq):
    add_xp(req.amount)
    return {"status": "ok", "added": req.amount}

# -------------------------------------------------------------
# 3. Spaced Repetition Logistics Endpoints
# -------------------------------------------------------------
@app.get("/api/srs/queue")
def api_get_srs_queue(limit: int = 25):
    cards = SRSLogistics.get_due_queue(limit=limit)
    return {"queue": cards, "count": len(cards)}

@app.post("/api/srs/review")
def api_submit_srs_review(req: SRSReviewReq):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM srs_items WHERE id = ?", (req.card_id,))
    item = cur.fetchone()
    if not item:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Card '{req.card_id}' not found.")

    res = SRSLogistics.calculate_review(
        current_interval=item["interval_days"],
        repetitions=item["repetitions"],
        ease_factor=item["ease_factor"],
        lapses=item["lapses"],
        grade=req.grade
    )

    cur.execute("""
    UPDATE srs_items SET
        interval_days = ?,
        repetitions = ?,
        ease_factor = ?,
        lapses = ?,
        mastery_level = ?,
        next_due = ?,
        last_reviewed = ?
    WHERE id = ?
    """, (
        res["interval_days"],
        res["repetitions"],
        res["ease_factor"],
        res["lapses"],
        res["mastery_level"],
        res["next_due"],
        res["last_reviewed"],
        req.card_id
    ))
    conn.commit()
    conn.close()

    # Reward XP for review: 5 XP for Again, 10 XP for Hard, 15 XP for Good, 20 XP for Easy
    xp_rewards = {1: 5, 2: 10, 3: 15, 4: 20}
    reward = xp_rewards.get(req.grade, 10)
    add_xp(reward)

    return {
        "status": "ok",
        "card_id": req.card_id,
        "calculation": res,
        "xp_awarded": reward
    }

@app.get("/api/srs/forecast")
def api_get_srs_forecast():
    return SRSLogistics.get_forecast_7_days()

# -------------------------------------------------------------
# 4. Learning Logistics & Daily Plan
# -------------------------------------------------------------
@app.get("/api/logistics/plan")
def api_get_logistics_plan():
    return SRSLogistics.get_daily_logistics_plan()

@app.get("/api/analytics")
def api_get_analytics():
    return SRSLogistics.get_analytics_summary()

@app.post("/api/session/log")
def api_log_session(req: SessionLogReq):
    log_session(req.mode, req.duration_seconds, req.total_items, req.correct_items, req.xp_earned)
    return {"status": "ok"}

# -------------------------------------------------------------
# 5. Mistake Journal & Weakness Logistics
# -------------------------------------------------------------
@app.get("/api/mistakes")
def api_get_mistakes(only_unresolved: bool = True):
    mistakes = get_mistakes(only_unresolved=only_unresolved)
    return {"mistakes": mistakes, "count": len(mistakes)}

@app.post("/api/mistakes/log")
def api_log_mistake(req: MistakeLogReq):
    log_mistake(
        mode=req.mode,
        item_id=req.item_id or "",
        prompt=req.prompt,
        user_ans=req.user_answer,
        correct_ans=req.correct_answer,
        explanation=req.explanation or "",
        category=req.category or ""
    )
    return {"status": "ok"}

@app.post("/api/mistakes/resolve")
def api_resolve_mistake(mistake_id: int = Body(..., embed=True)):
    resolve_mistake(mistake_id)
    return {"status": "ok", "resolved_id": mistake_id}

# -------------------------------------------------------------
# 6. LingQ-Style Vocabulary Bank
# -------------------------------------------------------------
@app.get("/api/vocab")
def api_get_vocab(q: Optional[str] = None, category: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM vocab_bank WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if q:
        query += " AND (cyr LIKE ? OR lat LIKE ? OR en LIKE ?)"
        like_q = f"%{q}%"
        params.extend([like_q, like_q, like_q])

    query += " ORDER BY id DESC LIMIT 150"
    cur.execute(query, params)
    items = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"vocab": items, "count": len(items)}

@app.post("/api/vocab")
def api_add_vocab(req: VocabAddReq):
    cyr = req.cyr.strip() if req.cyr else to_cyrillic(req.lat or "")
    lat = req.lat.strip() if req.lat else to_latin(cyr)

    if not cyr or not req.en:
        raise HTTPException(status_code=400, detail="Serbian word and English translation required.")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO vocab_bank (cyr, lat, en, category, notes, is_custom)
    VALUES (?, ?, ?, ?, ?, 1)
    """, (cyr, lat, req.en.strip(), req.category or "custom", req.notes or ""))
    new_id = cur.lastrowid

    # Also register into srs_items for flashcard review!
    now_iso = SRSLogistics.get_daily_logistics_plan() # test
    from datetime import datetime
    cur.execute("""
    INSERT OR IGNORE INTO srs_items 
    (id, item_type, deck_id, front_cyr, front_lat, back_en, hint, sound_guide, next_due)
    VALUES (?, 'custom', 'custom', ?, ?, ?, ?, 'Custom Vocabulary', ?)
    """, (f"custom_{new_id}", cyr, lat, req.en.strip(), req.notes or "", datetime.now().isoformat()))

    conn.commit()
    conn.close()

    add_xp(15) # XP reward for expanding vocabulary
    return {"status": "ok", "id": new_id, "cyr": cyr, "lat": lat}

@app.delete("/api/vocab/{vocab_id}")
def api_delete_vocab(vocab_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM vocab_bank WHERE id = ?", (vocab_id,))
    cur.execute("DELETE FROM srs_items WHERE id = ?", (f"custom_{vocab_id}",))
    conn.commit()
    conn.close()
    return {"status": "ok"}

# -------------------------------------------------------------
# 7. Local AI & Conversational Tutor Endpoints
# -------------------------------------------------------------
@app.get("/api/ai/scenarios")
def api_get_scenarios():
    return SCENARIOS

@app.post("/api/ai/chat")
def api_ai_chat(req: AIChatReq):
    res = LocalIntelligence.chat_turn(
        scenario=req.scenario,
        user_message=req.message,
        model_name=req.model
    )
    add_xp(5) # XP reward for chatting in Serbian
    return res

@app.post("/api/ai/evaluate")
def api_evaluate_sentence(req: SentenceEvalReq):
    return LocalIntelligence.evaluate_sentence(req.sentence)

# -------------------------------------------------------------
# 8. Static Web App Serving
# -------------------------------------------------------------
# Serve frontend assets from workspace root so http://localhost:8000 loads the full app!
app.mount("/css", StaticFiles(directory=str(BASE_DIR / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(BASE_DIR / "js")), name="js")

@app.get("/")
def serve_index():
    from fastapi.responses import FileResponse
    return FileResponse(str(BASE_DIR / "index.html"))
