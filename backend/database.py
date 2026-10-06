"""
YUGOLEARN — Persistent Memory & SQLite Database Engine
Stores user profiles, SRS flashcard states, mistake journals,
vocabulary bank, study sessions, and AI conversational memories.
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "yugolearn.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # 1. User Profile & Global Preferences
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 1,
        last_active_date TEXT,
        daily_xp_goal INTEGER DEFAULT 50,
        today_xp INTEGER DEFAULT 0,
        settings_json TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Spaced Repetition Memory (SM-2 / Leitner logistics)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS srs_items (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL,          -- 'letter', 'word', 'phrase', 'custom'
        deck_id TEXT NOT NULL,
        front_cyr TEXT NOT NULL,
        front_lat TEXT NOT NULL,
        back_en TEXT NOT NULL,
        hint TEXT,
        sound_guide TEXT,
        ease_factor REAL DEFAULT 2.5,     -- SM-2 ease factor
        interval_days INTEGER DEFAULT 0,  -- Current interval in days
        repetitions INTEGER DEFAULT 0,     -- Consecutive successful recalls
        lapses INTEGER DEFAULT 0,          -- Count of memory failures
        mastery_level INTEGER DEFAULT 0,  -- 0 to 5
        last_reviewed TEXT,
        next_due TEXT NOT NULL,           -- ISO timestamp for logistics scheduling
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Mistake Log & Weakness Journal
    cur.execute("""
    CREATE TABLE IF NOT EXISTS mistake_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,               -- 'drill', 'quiz', 'srs', 'match', 'cloze'
        item_id TEXT,
        prompt TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        error_category TEXT,              -- 'false_friend', 'sound_confusion', 'spelling', etc.
        resolved INTEGER DEFAULT 0,       -- 0 = active weakness, 1 = conquered
        review_count INTEGER DEFAULT 1,
        last_failed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Study Sessions Analytics Log
    cur.execute("""
    CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        total_items INTEGER DEFAULT 0,
        correct_items INTEGER DEFAULT 0,
        accuracy_pct REAL DEFAULT 0.0,
        xp_earned INTEGER DEFAULT 0,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Vocabulary Bank (LingQ-style interactive bank)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vocab_bank (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cyr TEXT NOT NULL,
        lat TEXT NOT NULL,
        en TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        notes TEXT,
        srs_level INTEGER DEFAULT 0,
        is_custom INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. AI Conversation History
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ai_chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        scenario TEXT NOT NULL,
        role TEXT NOT NULL,               -- 'user', 'assistant', 'system'
        content TEXT NOT NULL,
        corrections_json TEXT,
        grammar_notes_json TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. AI Tutor Persistent Memory (Facts the AI tutor remembers about the student)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tutor_memory (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure profile row exists
    cur.execute("SELECT id FROM user_profile WHERE id = 1")
    if not cur.fetchone():
        today = datetime.now().strftime("%Y-%m-%d")
        cur.execute("""
        INSERT INTO user_profile (id, xp, streak, last_active_date, daily_xp_goal, today_xp, settings_json)
        VALUES (1, 0, 1, ?, 50, 0, ?)
        """, (today, json.dumps({
            "soundFx": True,
            "speechRate": 0.9,
            "preferredVoice": "",
            "activeAiModel": "qwen3:4b"
        })))

    conn.commit()
    conn.close()

def seed_initial_content(alphabet: List[Dict[str, Any]], decks: List[Dict[str, Any]]):
    """Seed base alphabet and decks into persistent memory if empty."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) as count FROM srs_items")
    count = cur.fetchone()["count"]

    now_iso = datetime.now().isoformat()

    if count == 0:
        # Seed alphabet letters
        for item in alphabet:
            item_id = f"letter_{item['cyr']}"
            cur.execute("""
            INSERT OR IGNORE INTO srs_items 
            (id, item_type, deck_id, front_cyr, front_lat, back_en, hint, sound_guide, next_due)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item_id,
                "letter",
                "alphabet",
                item["cyr"],
                item["lat"],
                f"Sound: {item.get('name', '')} ({item.get('ipa', '')})",
                item.get("groupLabel", ""),
                item.get("soundGuide", ""),
                now_iso
            ))

        # Seed deck items (essentials, greetings, numbers, etc.)
        for deck in decks:
            deck_id = deck["id"]
            if deck_id == "alphabet":
                continue
            for item in deck.get("items", []):
                item_id = f"word_{item['cyr']}"
                cur.execute("""
                INSERT OR IGNORE INTO srs_items 
                (id, item_type, deck_id, front_cyr, front_lat, back_en, hint, sound_guide, next_due)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    item_id,
                    "word",
                    deck_id,
                    item["cyr"],
                    item["lat"],
                    item["en"],
                    item.get("hint", ""),
                    deck.get("name", ""),
                    now_iso
                ))

                # Also insert into vocab_bank
                cur.execute("""
                INSERT OR IGNORE INTO vocab_bank (cyr, lat, en, category, notes, is_custom)
                VALUES (?, ?, ?, ?, ?, 0)
                """, (
                    item["cyr"],
                    item["lat"],
                    item["en"],
                    deck_id,
                    item.get("hint", "")
                ))

        conn.commit()
    conn.close()

def get_user_state() -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM user_profile WHERE id = 1")
    row = cur.fetchone()
    conn.close()
    if not row:
        return {}
    
    settings = {}
    try:
        settings = json.loads(row["settings_json"]) if row["settings_json"] else {}
    except Exception:
        pass

    return {
        "xp": row["xp"],
        "streak": row["streak"],
        "lastActiveDate": row["last_active_date"],
        "dailyXpGoal": row["daily_xp_goal"],
        "todayXp": row["today_xp"],
        "settings": settings
    }

def update_user_state(data: Dict[str, Any]):
    conn = get_connection()
    cur = conn.cursor()
    settings_str = json.dumps(data.get("settings", {}))
    cur.execute("""
    UPDATE user_profile SET
        xp = ?,
        streak = ?,
        last_active_date = ?,
        daily_xp_goal = ?,
        today_xp = ?,
        settings_json = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    """, (
        data.get("xp", 0),
        data.get("streak", 1),
        data.get("lastActiveDate"),
        data.get("dailyXpGoal", 50),
        data.get("todayXp", 0),
        settings_str
    ))
    conn.commit()
    conn.close()

def add_xp(amount: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    UPDATE user_profile SET
        xp = xp + ?,
        today_xp = today_xp + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    """, (amount, amount))
    conn.commit()
    conn.close()

def log_mistake(mode: str, item_id: str, prompt: str, user_ans: str, correct_ans: str, explanation: str = "", category: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    
    # Check if duplicate mistake exists
    cur.execute("""
    SELECT id, review_count FROM mistake_logs 
    WHERE prompt = ? AND correct_answer = ? AND resolved = 0
    """, (prompt, correct_ans))
    row = cur.fetchone()

    if row:
        cur.execute("""
        UPDATE mistake_logs SET 
            review_count = review_count + 1,
            user_answer = ?,
            last_failed_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (user_ans, row["id"]))
    else:
        cur.execute("""
        INSERT INTO mistake_logs (mode, item_id, prompt, user_answer, correct_answer, explanation, error_category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (mode, item_id, prompt, user_ans, correct_ans, explanation, category))

    conn.commit()
    conn.close()

def resolve_mistake(mistake_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE mistake_logs SET resolved = 1 WHERE id = ?", (mistake_id,))
    conn.commit()
    conn.close()

def get_mistakes(only_unresolved: bool = True) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    if only_unresolved:
        cur.execute("SELECT * FROM mistake_logs WHERE resolved = 0 ORDER BY review_count DESC, last_failed_at DESC LIMIT 100")
    else:
        cur.execute("SELECT * FROM mistake_logs ORDER BY last_failed_at DESC LIMIT 100")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def log_session(mode: str, duration: int, total: int, correct: int, xp: int):
    accuracy = (correct / total * 100.0) if total > 0 else 0.0
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO study_sessions (mode, duration_seconds, total_items, correct_items, accuracy_pct, xp_earned)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (mode, duration, total, correct, round(accuracy, 1), xp))
    conn.commit()
    conn.close()
