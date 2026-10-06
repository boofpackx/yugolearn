# YUGOLEARN

A no-fluff web app for learning the Serbian Cyrillic alphabet and the Serbian language: letter drills, flashcards, spaced repetition, quizzes, phrases with audio, and grammar.

**Live site:** https://boofpackx.github.io/yugolearn/

## Two ways to run it

### 1. In the browser (GitHub Pages)

Open the live site. Everything runs in your browser, and progress is saved in that browser on that device.

- All lessons work: Azbuka, Drill, Cards, Quiz, Match, Phrases, Grammar, Convert.
- Smart SRS, Mistakes, Vocab Bank and Logistics run on a built-in engine that uses the same scheduling rules as the Python backend.

The site redeploys automatically on every push to the default branch (see `.github/workflows/pages.yml`).

### 2. On your PC

Saves progress to the SQLite database (`backend/yugolearn.db`) instead of the browser.

Requirements: Python 3.10+, then:

```
pip install fastapi uvicorn
```

On Windows, double-click `start_yugolearn.bat`. Otherwise:

```
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

Then open http://127.0.0.1:8000. The badge in the top bar shows **DB: ON** when the backend is connected.

To rebuild the database from scratch, delete `backend/yugolearn.db` and run `python seed.py` inside `backend/`.

## Project layout

```
index.html            App shell
css/style.css         Styles and themes
js/data.js            Alphabet, decks, phrases, grammar content
js/local-engine.js    In-browser engine used when the backend is not running
js/api.js             Talks to the backend, or falls back to the in-browser engine
js/app.js             Views, router, audio, state
backend/              FastAPI server, SQLite database, SRS logistics
```
