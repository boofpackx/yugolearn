"""
YUGOLEARN — Smart Learning Logistics Engine
Spaced Repetition Scheduling (SM-2 / FSRS logistics),
Daily Study Queue Optimization, Weakness Targeting, and Retention Analytics.
"""

from datetime import datetime, timedelta
import math
from typing import Dict, List, Any, Optional
from database import get_connection

class SRSLogistics:
    @staticmethod
    def calculate_review(
        current_interval: int,
        repetitions: int,
        ease_factor: float,
        lapses: int,
        grade: int # 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    ) -> Dict[str, Any]:
        """
        Computes new interval, ease factor, repetition count, and next due timestamp.
        Implements an enhanced SM-2 algorithm tuned for phonetic Cyrillic learning.
        """
        now = datetime.now()
        new_ef = ease_factor

        if grade == 1: # AGAIN / FAILED
            new_reps = 0
            new_lapses = lapses + 1
            new_ef = max(1.3, ease_factor - 0.20)
            new_interval = 0
            # Due in 15 minutes
            next_due = (now + timedelta(minutes=15)).isoformat()
            mastery = 1
        elif grade == 2: # HARD
            new_reps = repetitions + 1
            new_lapses = lapses
            new_ef = max(1.3, ease_factor - 0.15)
            new_interval = max(1, int(current_interval * 1.2)) if current_interval > 0 else 1
            next_due = (now + timedelta(days=new_interval)).isoformat()
            mastery = min(4, max(1, new_reps))
        elif grade == 3: # GOOD
            new_reps = repetitions + 1
            new_lapses = lapses
            if new_reps == 1:
                new_interval = 1
            elif new_reps == 2:
                new_interval = 3
            else:
                new_interval = max(4, int(current_interval * ease_factor))
            next_due = (now + timedelta(days=new_interval)).isoformat()
            mastery = min(5, 2 + new_reps)
        elif grade == 4: # EASY
            new_reps = repetitions + 1
            new_lapses = lapses
            new_ef = min(3.0, ease_factor + 0.15)
            if new_reps == 1:
                new_interval = 3
            elif new_reps == 2:
                new_interval = 6
            else:
                new_interval = max(7, int(current_interval * ease_factor * 1.3))
            next_due = (now + timedelta(days=new_interval)).isoformat()
            mastery = min(5, 3 + new_reps)
        else:
            raise ValueError(f"Invalid grade: {grade}. Must be 1, 2, 3, or 4.")

        return {
            "interval_days": new_interval,
            "repetitions": new_reps,
            "ease_factor": round(new_ef, 2),
            "lapses": new_lapses,
            "mastery_level": mastery,
            "next_due": next_due,
            "last_reviewed": now.isoformat()
        }

    @staticmethod
    def get_due_queue(limit: int = 25) -> List[Dict[str, Any]]:
        """
        Logistics Optimizer: Fetches due and high-priority cards for today's session.
        Prioritizes:
        1. Overdue cards with past review lapses (urgent weak spots)
        2. Regular due cards
        3. New unreviewed items (limited to 5 per session to avoid overload)
        """
        conn = get_connection()
        cur = conn.cursor()
        now_iso = datetime.now().isoformat()

        # 1. Fetch overdue cards
        cur.execute("""
        SELECT * FROM srs_items 
        WHERE next_due <= ? AND repetitions > 0
        ORDER BY lapses DESC, next_due ASC
        LIMIT ?
        """, (now_iso, limit))
        due_cards = [dict(r) for r in cur.fetchall()]

        # 2. If queue is small, fetch brand new cards
        remaining = limit - len(due_cards)
        if remaining > 0:
            cur.execute("""
            SELECT * FROM srs_items 
            WHERE repetitions = 0
            ORDER BY deck_id ASC, id ASC
            LIMIT ?
            """, (min(remaining, 10),))
            new_cards = [dict(r) for r in cur.fetchall()]
            due_cards.extend(new_cards)

        conn.close()
        return due_cards

    @staticmethod
    def get_daily_logistics_plan() -> Dict[str, Any]:
        """
        Generates the daily study plan & cognitive logistics forecast.
        """
        conn = get_connection()
        cur = conn.cursor()
        now_iso = datetime.now().isoformat()

        # Count cards due now
        cur.execute("SELECT COUNT(*) as count FROM srs_items WHERE next_due <= ?", (now_iso,))
        due_count = cur.fetchone()["count"]

        # Count total items
        cur.execute("SELECT COUNT(*) as count FROM srs_items")
        total_items = cur.fetchone()["count"]

        # Count mastered items (mastery_level >= 4)
        cur.execute("SELECT COUNT(*) as count FROM srs_items WHERE mastery_level >= 4")
        mastered_count = cur.fetchone()["count"]

        # Count learning items (0 < mastery_level < 4)
        cur.execute("SELECT COUNT(*) as count FROM srs_items WHERE mastery_level > 0 AND mastery_level < 4")
        learning_count = cur.fetchone()["count"]

        # Unseen items
        unseen_count = total_items - (mastered_count + learning_count)

        # Unresolved mistakes count
        cur.execute("SELECT COUNT(*) as count FROM mistake_logs WHERE resolved = 0")
        unresolved_mistakes = cur.fetchone()["count"]

        # Estimated session time (approx 12 seconds per due card + 30s per mistake)
        est_minutes = max(3, int(math.ceil((due_count * 12 + unresolved_mistakes * 30) / 60)))

        conn.close()

        return {
            "due_count": due_count,
            "mastered_count": mastered_count,
            "learning_count": learning_count,
            "unseen_count": max(0, unseen_count),
            "unresolved_mistakes": unresolved_mistakes,
            "est_session_minutes": est_minutes,
            "retention_index": round((mastered_count / total_items * 100), 1) if total_items > 0 else 0,
            "recommended_focus": (
                "Conquer your unresolved mistakes in the Mistakes Journal!" if unresolved_mistakes > 4
                else "Clear your Spaced Repetition queue to lock down memory retention!" if due_count > 0
                else "Explore new vocabulary or run a quick letter drill!"
            )
        }

    @staticmethod
    def get_forecast_7_days() -> List[Dict[str, Any]]:
        """
        Calculates card review distribution over the next 7 days for the logistics forecast.
        """
        conn = get_connection()
        cur = conn.cursor()
        now = datetime.now()
        forecast = []

        for day in range(7):
            day_start = (now + timedelta(days=day)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            day_end = (now + timedelta(days=day)).replace(hour=23, minute=59, second=59, microsecond=999).isoformat()
            
            cur.execute("""
            SELECT COUNT(*) as count FROM srs_items 
            WHERE next_due BETWEEN ? AND ?
            """, (day_start, day_end))
            count = cur.fetchone()["count"]

            day_name = "Today" if day == 0 else "Tomorrow" if day == 1 else (now + timedelta(days=day)).strftime("%a")
            forecast.append({
                "day_index": day,
                "day_label": day_name,
                "date": (now + timedelta(days=day)).strftime("%b %d"),
                "due_count": count
            })

        conn.close()
        return forecast

    @staticmethod
    def get_analytics_summary() -> Dict[str, Any]:
        """Returns comprehensive analytics for the logistics dashboard."""
        conn = get_connection()
        cur = conn.cursor()

        # Session history
        cur.execute("SELECT * FROM study_sessions ORDER BY timestamp DESC LIMIT 30")
        sessions = [dict(r) for r in cur.fetchall()]

        # Letter mastery distribution
        cur.execute("""
        SELECT front_cyr, front_lat, mastery_level, lapses, repetitions 
        FROM srs_items WHERE item_type = 'letter'
        ORDER BY mastery_level ASC, lapses DESC
        """)
        letter_status = [dict(r) for r in cur.fetchall()]

        # Top mistake categories
        cur.execute("""
        SELECT prompt, user_answer, correct_answer, review_count, error_category
        FROM mistake_logs WHERE resolved = 0
        ORDER BY review_count DESC LIMIT 8
        """)
        top_weaknesses = [dict(r) for r in cur.fetchall()]

        conn.close()

        total_sessions = len(sessions)
        avg_acc = sum(s["accuracy_pct"] for s in sessions) / total_sessions if total_sessions > 0 else 0
        total_time_mins = sum(s["duration_seconds"] for s in sessions) // 60

        return {
            "total_sessions": total_sessions,
            "avg_accuracy_pct": round(avg_acc, 1),
            "total_study_minutes": total_time_mins,
            "letter_status": letter_status,
            "top_weaknesses": top_weaknesses,
            "recent_sessions": sessions[:10]
        }
