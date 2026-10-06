/* =========================================================
   YUGOLEARN — Core Application Logic
   Audio Engine, State Store, Router & Brutalist Interactive Views
   ========================================================= */

// -------------------------------------------------------------
// 1. AUDIO ENGINE (Web Speech API + Web Audio Synthesizer)
// -------------------------------------------------------------
const YugoAudio = {
  ctx: null,
  voices: [],
  selectedVoice: null,
  srVoiceFound: false,
  soundFxEnabled: true,
  speechRate: 0.9,

  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }

    if ("speechSynthesis" in window) {
      const populate = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.detectBestVoice();
        this.updateBadge();
      };
      populate();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populate;
      }
    } else {
      this.updateBadge();
    }
  },

  detectBestVoice() {
    if (!this.voices || !this.voices.length) return;
    const prefVoiceName = YugoStore.getSetting("preferredVoice", "");
    if (prefVoiceName) {
      const match = this.voices.find(v => v.name === prefVoiceName);
      if (match) {
        this.selectedVoice = match;
        this.srVoiceFound = true;
        return;
      }
    }

    // Try Serbian (sr-RS, sr, sr-CS, sr-Latn)
    let v = this.voices.find(v => /^(sr|sr[-_]RS|sr[-_]CS)/i.test(v.lang));
    if (v) {
      this.selectedVoice = v;
      this.srVoiceFound = true;
      return;
    }

    // Try closely related South Slavic languages: Bosnian (bs), Croatian (hr), Slovenian (sl)
    v = this.voices.find(v => /^(bs|hr|sl)/i.test(v.lang));
    if (v) {
      this.selectedVoice = v;
      this.srVoiceFound = true;
      return;
    }

    // Try other Slavic (Russian, Polish, Czech) or standard fallback
    v = this.voices.find(v => /^(ru|pl|cs|bg|sk)/i.test(v.lang));
    if (v) {
      this.selectedVoice = v;
      this.srVoiceFound = false;
      return;
    }

    // Default system voice
    this.selectedVoice = this.voices[0] || null;
    this.srVoiceFound = false;
  },

  updateBadge() {
    const badge = document.getElementById("audio-badge");
    if (!badge) return;
    if (!("speechSynthesis" in window)) {
      badge.textContent = "Audio: Not supported";
      return;
    }
    if (this.selectedVoice) {
      const isSerbian = /sr/i.test(this.selectedVoice.lang);
      badge.textContent = isSerbian
        ? `🔊 ${this.selectedVoice.name} (${this.selectedVoice.lang})`
        : `🔊 ${this.selectedVoice.name} (Slavic/System)`;
    } else {
      badge.textContent = "🔊 Speech ready";
    }
  },

  speak(text, slow = false, btn = null) {
    if (!("speechSynthesis" in window)) {
      this.beep(440, 0.1);
      return;
    }
    window.speechSynthesis.cancel();

    // If letter is single character, ensure Serbian pronunciation
    let clean = (text || "").trim();

    const utt = new SpeechSynthesisUtterance(clean);
    if (this.selectedVoice) {
      utt.voice = this.selectedVoice;
    }
    utt.lang = this.selectedVoice ? this.selectedVoice.lang : "sr-RS";

    const baseRate = parseFloat(YugoStore.getSetting("speechRate", 0.9));
    utt.rate = slow ? Math.max(0.5, baseRate * 0.65) : baseRate;
    utt.pitch = 1.0;

    if (btn) {
      btn.classList.add("speaking");
      utt.onend = () => btn.classList.remove("speaking");
      utt.onerror = () => btn.classList.remove("speaking");
    }

    window.speechSynthesis.speak(utt);
  },

  // Sound FX via Web Audio API (instant, punchy brutalist audio feedback)
  beep(freq = 440, duration = 0.08, type = "square") {
    if (!this.soundFxEnabled || !this.ctx) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context errors
    }
  },

  fxCorrect() {
    this.beep(523.25, 0.06, "sine"); // C5
    setTimeout(() => this.beep(659.25, 0.08, "sine"), 60); // E5
    setTimeout(() => this.beep(783.99, 0.12, "sine"), 120); // G5
  },

  fxWrong() {
    this.beep(220, 0.12, "sawtooth");
    setTimeout(() => this.beep(164.81, 0.18, "sawtooth"), 100);
  },

  fxClick() {
    this.beep(800, 0.02, "triangle");
  },

  fxWin() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.15, "triangle"), i * 90);
    });
  }
};

// -------------------------------------------------------------
// 2. STATE STORE & LOCALSTORAGE PERSISTENCE
// -------------------------------------------------------------
const YugoStore = {
  data: {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    dailyXpGoal: 50,
    todayXp: 0,
    letterMastery: {}, // e.g. { "А": 3, "Б": 2 } (0 to 3)
    cardProgress: {},  // e.g. { "word_key": { level: 0, nextDue: 0 } }
    bestMatchTimes: {},
    settings: {
      theme: "dark",
      fontFamily: "learner",
      soundFx: true,
      speechRate: 0.9,
      preferredVoice: ""
    }
  },

  async init() {
    try {
      const saved = localStorage.getItem("yugolearn_state_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...this.data, ...parsed, settings: { ...this.data.settings, ...(parsed.settings || {}) } };
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }

    // Connect to SQLite backend persistent memory & local intelligence
    if (window.YugoAPI) {
      try {
        const health = await YugoAPI.checkHealth();
        if (health) {
          const remoteState = await YugoAPI.getState();
          if (remoteState) {
            if (remoteState.xp > this.data.xp) this.data.xp = remoteState.xp;
            if (remoteState.streak) this.data.streak = remoteState.streak;
            if (remoteState.letterMastery) {
              this.data.letterMastery = { ...this.data.letterMastery, ...remoteState.letterMastery };
            }
            if (remoteState.settings) {
              this.data.settings = { ...this.data.settings, ...remoteState.settings };
            }
          }
          this.save();
        }
      } catch (err) {
        console.warn("Persistent backend sync check skipped", err);
      }
    }

    this.checkStreak();
    YugoAudio.soundFxEnabled = this.data.settings.soundFx;
    this.updateHUD();
    if (window.YugoTheme) {
      YugoTheme.apply(this.getSetting("theme", "dark"), false);
    }
    if (window.YugoFont) {
      YugoFont.apply(this.getSetting("fontFamily", "learner"), false);
    }
  },

  save() {
    try {
      localStorage.setItem("yugolearn_state_v1", JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    if (window.YugoAPI && YugoAPI.isOnline) {
      YugoAPI.saveState(this.data);
    }
  },

  checkStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const last = this.data.lastActiveDate;

    if (!last) {
      this.data.streak = 1;
      this.data.lastActiveDate = today;
      this.data.todayXp = 0;
    } else if (last === today) {
      // Same day, streak intact
    } else {
      const lastDate = new Date(last);
      const curDate = new Date(today);
      const diffDays = Math.round((curDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        this.data.streak += 1;
      } else if (diffDays > 1) {
        this.data.streak = 1;
      }
      this.data.lastActiveDate = today;
      this.data.todayXp = 0;
    }
    this.save();
  },

  addXP(amount, targetElement = null) {
    this.data.xp += amount;
    this.data.todayXp += amount;
    this.save();
    this.updateHUD(true);

    if (window.YugoAPI && YugoAPI.isOnline) {
      YugoAPI.addXP(amount);
    }

    if (targetElement) {
      this.popXP(amount, targetElement);
    }
  },

  popXP(amount, el) {
    try {
      const rect = el.getBoundingClientRect();
      const pop = document.createElement("div");
      pop.className = "xp-pop";
      pop.textContent = `+${amount} XP`;
      pop.style.left = `${rect.left + rect.width / 2 - 20}px`;
      pop.style.top = `${rect.top - 10}px`;
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 900);
    } catch (e) {
      // Element might be off-screen
    }
  },

  updateHUD(bump = false) {
    const xpEl = document.getElementById("hud-xp");
    const streakEl = document.getElementById("hud-streak");
    if (xpEl) {
      xpEl.textContent = `${this.data.xp} XP`;
      if (bump) {
        xpEl.classList.remove("bump");
        void xpEl.offsetWidth;
        xpEl.classList.add("bump");
      }
    }
    if (streakEl) {
      streakEl.textContent = `STREAK ${this.data.streak}`;
    }
  },

  getLetterMastery(letter) {
    return this.data.letterMastery[letter] || 0;
  },

  setLetterMastery(letter, delta) {
    const cur = this.getLetterMastery(letter);
    const next = Math.max(0, Math.min(3, cur + delta));
    this.data.letterMastery[letter] = next;
    this.save();
    return next;
  },

  getMasteredCount() {
    let count = 0;
    YUGO_DATA.alphabet.forEach(l => {
      if ((this.data.letterMastery[l.cyr] || 0) >= 3) count++;
    });
    return count;
  },

  getSetting(key, fallback) {
    return this.data.settings[key] !== undefined ? this.data.settings[key] : fallback;
  },

  setSetting(key, val) {
    this.data.settings[key] = val;
    this.save();
  },

  resetAll() {
    localStorage.removeItem("yugolearn_state_v1");
    this.data = {
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      dailyXpGoal: 50,
      todayXp: 0,
      letterMastery: {},
      cardProgress: {},
      bestMatchTimes: {},
      settings: {
        theme: "dark",
        fontFamily: "learner",
        soundFx: true,
        speechRate: 0.9,
        preferredVoice: ""
      }
    };
    this.save();
    this.updateHUD();
    if (window.YugoTheme) {
      YugoTheme.apply("dark", false);
    }
    if (window.YugoFont) {
      YugoFont.apply("learner", false);
    }
  }
};

// -------------------------------------------------------------
// 2b. THEME ENGINE (Cold War Noir Dark / Yugoslav Print Light)
// -------------------------------------------------------------
const YugoTheme = {
  currentPref: "dark",

  init() {
    const saved = YugoStore.getSetting("theme", "dark");
    this.apply(saved, false);

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (YugoStore.getSetting("theme", "dark") === "auto") {
          this.apply("auto", false);
        }
      });
    }

    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => this.toggle());
    }

    // Keyboard shortcut: 'T' toggles theme when not typing in text fields
    window.addEventListener("keydown", (e) => {
      if (e.key === "t" || e.key === "T") {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea" && !e.target.isContentEditable) {
          this.toggle();
        }
      }
    });
  },

  getEffectiveTheme(pref) {
    if (pref === "auto") {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }
    return pref === "light" ? "light" : "dark";
  },

  apply(themePref, notify = true) {
    this.currentPref = themePref;
    const effective = this.getEffectiveTheme(themePref);

    document.documentElement.setAttribute("data-theme", effective);
    document.documentElement.setAttribute("data-theme-pref", themePref);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", effective === "dark" ? "#12110f" : "#ece3cc");
    }

    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      if (effective === "dark") {
        btn.innerHTML = `☀️ DAN`;
        btn.title = `Ноћни режим (Cold War Noir) aktivan. Kliknite za Дневни [T]`;
      } else {
        btn.innerHTML = `🌙 NOĆ`;
        btn.title = `Дневни режим (Newsprint) aktivan. Kliknite za Ноћни [T]`;
      }
    }

    if (notify) {
      const label = effective === "dark" ? "Ноћни режим · Cold War Noir" : "Дневни режим · Yugoslav Newsprint";
      YugoUI.toast(`Тема: ${label}`);
      if (YugoAudio && YugoAudio.fxClick) YugoAudio.fxClick();
    }
  },

  toggle() {
    const curEffective = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = curEffective === "dark" ? "light" : "dark";
    this.set(next);
  },

  set(pref) {
    YugoStore.setSetting("theme", pref);
    this.apply(pref, true);
  }
};

// -------------------------------------------------------------
// 2c. TYPOGRAPHY ENGINE (Font Presets for Language Learners)
// -------------------------------------------------------------
const YugoFont = {
  presets: ["learner", "inter", "literary", "vintage"],
  labels: {
    learner: "Јасна Ћирилица · Clean Learner (IBM Plex Sans)",
    inter: "Интер Студио · Modern Sans (Inter)",
    literary: "Књижевна · Belgrade Literary (Lora)",
    vintage: "Ретро Досије · Vintage Print (Playfair / Oswald)"
  },
  current: "learner",

  init() {
    const saved = YugoStore.getSetting("fontFamily", "learner");
    this.apply(saved, false);

    const hudBtn = document.getElementById("btn-font-cycle");
    if (hudBtn) {
      hudBtn.addEventListener("click", () => this.cycle());
    }

    // Keyboard shortcut: 'F' cycles font presets when not in a text input
    window.addEventListener("keydown", (e) => {
      if (e.key === "f" || e.key === "F") {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea" && !e.target.isContentEditable) {
          this.cycle();
        }
      }
    });
  },

  apply(fontName, notify = true) {
    this.current = this.presets.includes(fontName) ? fontName : "learner";
    document.documentElement.setAttribute("data-font", this.current);

    const hudBtn = document.getElementById("btn-font-cycle");
    if (hudBtn) {
      const shortLabels = {
        learner: "🔤 PLEX",
        inter: "🔤 INTER",
        literary: "🔤 LORA",
        vintage: "🔤 RETRO"
      };
      hudBtn.innerHTML = shortLabels[this.current] || "🔤 FONT";
      hudBtn.title = `Фонт: ${this.labels[this.current]}. Kliknite za sledeći [F]`;
    }

    if (notify) {
      YugoUI.toast(`Фонт: ${this.labels[this.current]}`);
      if (YugoAudio && YugoAudio.fxClick) YugoAudio.fxClick();
    }
  },

  cycle() {
    const curIdx = this.presets.indexOf(this.current);
    const next = this.presets[(curIdx + 1) % this.presets.length];
    this.set(next);
  },

  set(fontName) {
    YugoStore.setSetting("fontFamily", fontName);
    this.apply(fontName, true);
  }
};

// -------------------------------------------------------------
// 3. UI HELPERS & NOTIFICATIONS
// -------------------------------------------------------------
const YugoUI = {
  toast(msg, isWarn = false) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = isWarn ? "toast show warn" : "toast show";
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      el.className = "toast";
    }, 2800);
  },

  renderBars(level = 0, max = 3) {
    let html = '<span class="bars">';
    for (let i = 1; i <= max; i++) {
      html += `<i class="${i <= level ? "on" : ""}"></i>`;
    }
    html += "</span>";
    return html;
  },

  setupTicker() {
    const track = document.getElementById("ticker");
    if (!track) return;
    const items = YUGO_DATA.alphabet.map(l =>
      `<span><b>${l.cyr}${l.cyrLower}</b> = ${l.lat} [${l.ipa.replace(/\//g, "")}]</span>`
    ).join(" &nbsp; · &nbsp; ");
    track.innerHTML = `${items} &nbsp; · &nbsp; ${items}`;
  }
};

// -------------------------------------------------------------
// 4. ROUTER & VIEW RENDERING
// -------------------------------------------------------------
const YugoRouter = {
  routes: {},

  init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  register(route, renderFn) {
    this.routes[route] = renderFn;
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || "/";
    const path = hash.split("?")[0];
    const navLinks = document.querySelectorAll(".nav a");
    navLinks.forEach(a => {
      const href = a.getAttribute("href").slice(1);
      if (href === path || (href === "/" && path === "")) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });

    const view = document.getElementById("view");
    if (!view) return;

    view.classList.remove("enter");
    void view.offsetWidth;
    view.classList.add("enter");

    const render = this.routes[path] || this.routes["/"];
    if (render) {
      render(view, hash);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};

// -------------------------------------------------------------
// 5. VIEW: HOME
// -------------------------------------------------------------
YugoRouter.register("/", (container) => {
  const mastered = YugoStore.getMasteredCount();
  const total = YUGO_DATA.alphabet.length;
  const pctMastered = Math.round((mastered / total) * 100);
  const todayXp = YugoStore.data.todayXp;
  const goalXp = YugoStore.data.dailyXpGoal;
  const goalPct = Math.min(100, Math.round((todayXp / goalXp) * 100));

  // Word of the Day (seeded by day of month)
  const dayIndex = new Date().getDate() % YUGO_DATA.wordOfTheDayPool.length;
  const wotd = YUGO_DATA.wordOfTheDayPool[dayIndex];

  container.innerHTML = `
    <section class="hero">
      <div>
        <span class="kicker">Брутално учење · No-Fluff Method</span>
        <h1>LEARN <span class="hl">SERBIAN</span> & CYRILLIC</h1>
        <p class="lead">
          Master the phonetic genius of Vuk Karadžić's 30-letter Azbuka.
          One sound, one letter. No silent characters. Read real signs, kafana menus, and speak authentic phrases in days.
        </p>
        <div class="row">
          <a href="#/alphabet" class="btn btn-red btn-lg">Explore Азбука →</a>
          <a href="#/drill" class="btn btn-yellow btn-lg">Start Letter Drill ⚡</a>
        </div>
      </div>
      <div class="hero-letters" aria-hidden="true">
        <div class="hl-tile" onclick="YugoAudio.speak('Ж')">Ж</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Б')">Б</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Љ')">Љ</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Ћ')">Ћ</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Џ')">Џ</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Ш')">Ш</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Њ')">Њ</div>
        <div class="hl-tile" onclick="YugoAudio.speak('Ђ')">Ђ</div>
        <div class="hl-tile" onclick="YugoAudio.speak('В')">В</div>
      </div>
    </section>

    <div class="stats">
      <div class="stat">
        <div class="stat-num">${mastered} <small>/ 30</small></div>
        <div class="stat-label">Letters Mastered</div>
      </div>
      <div class="stat">
        <div class="stat-num">${YugoStore.data.streak} <small>DAYS</small></div>
        <div class="stat-label">Daily Streak</div>
      </div>
      <div class="stat">
        <div class="stat-num">${YugoStore.data.xp}</div>
        <div class="stat-label">Total XP Earned</div>
      </div>
      <div class="stat">
        <div class="stat-num">${pctMastered}%</div>
        <div class="stat-label">Azbuka Fluency</div>
      </div>
      <div class="stat">
        <div class="stat-num">30</div>
        <div class="stat-label">Exact Sounds</div>
      </div>
    </div>

    <div class="goal box-flat">
      <span class="goal-label">DAILY GOAL: ${todayXp} / ${goalXp} XP</span>
      <div class="bar"><i style="width: ${goalPct}%;"></i></div>
      <span style="font-weight:700;font-size:0.85rem;">${goalPct}%</span>
    </div>

    <div class="section-title">
      <h2>LEARNING MODES</h2>
      <small>CHOOSE YOUR TRAINING WEAPON</small>
    </div>

    <div class="tiles">
      <a href="#/alphabet" class="tile c-yellow">
        <span class="tile-badge">30 LETTERS</span>
        <div class="tile-key">Аа</div>
        <div>
          <div class="tile-title">Interactive Азбука</div>
          <div class="tile-sub">Sounds, stroke orders & Vuk mnemonics</div>
        </div>
      </a>

      <a href="#/drill" class="tile c-red">
        <span class="tile-badge">ADAPTIVE</span>
        <div class="tile-key">⚡</div>
        <div>
          <div class="tile-title">Rapid Drill</div>
          <div class="tile-sub">Fast recognition & typing drills</div>
        </div>
      </a>

      <a href="#/cards" class="tile c-blue">
        <span class="tile-badge">SPACED REP</span>
        <div class="tile-key">🗂</div>
        <div>
          <div class="tile-title">Flashcards</div>
          <div class="tile-sub">Thematic decks from food to travel</div>
        </div>
      </a>

      <a href="#/quiz" class="tile c-green">
        <span class="tile-badge">10 Qs</span>
        <div class="tile-key">?</div>
        <div>
          <div class="tile-title">Mastery Quiz</div>
          <div class="tile-sub">Letters, audio comprehension & vocab</div>
        </div>
      </a>

      <a href="#/match" class="tile c-pink">
        <span class="tile-badge">SPEED</span>
        <div class="tile-key">⇄</div>
        <div>
          <div class="tile-title">Speed Match</div>
          <div class="tile-sub">Beat the clock connecting Cyrillic & Latin</div>
        </div>
      </a>

      <a href="#/srs" class="tile c-yellow">
        <span class="tile-badge">SM-2 / FSRS</span>
        <div class="tile-key">🧠</div>
        <div>
          <div class="tile-title">Smart SRS Review</div>
          <div class="tile-sub">Spaced-repetition memory retention logistics</div>
        </div>
      </a>

      <a href="#/tutor" class="tile c-red">
        <span class="tile-badge">LOCAL AI</span>
        <div class="tile-key">🤖</div>
        <div>
          <div class="tile-title">AI Serbian Tutor</div>
          <div class="tile-sub">Roleplay Kafana & Dorćol talk with instant feedback</div>
        </div>
      </a>

      <a href="#/mistakes" class="tile c-pink">
        <span class="tile-badge">WEAK SPOTS</span>
        <div class="tile-key">🎯</div>
        <div>
          <div class="tile-title">Mistakes Journal</div>
          <div class="tile-sub">Targeted recovery drills for false friends & slips</div>
        </div>
      </a>

      <a href="#/vocab" class="tile c-green">
        <span class="tile-badge">LINGQ BANK</span>
        <div class="tile-key">📖</div>
        <div>
          <div class="tile-title">Vocab Bank</div>
          <div class="tile-sub">Serbian dictionary + add custom vocabulary</div>
        </div>
      </a>

      <a href="#/logistics" class="tile c-blue">
        <span class="tile-badge">ANALYTICS</span>
        <div class="tile-key">📊</div>
        <div>
          <div class="tile-title">Logistics & Forecast</div>
          <div class="tile-sub">7-day retention curves & Azbuka mastery matrix</div>
        </div>
      </a>

      <a href="#/phrases" class="tile c-ink">
        <span class="tile-badge">AUDIO</span>
        <div class="tile-key">💬</div>
        <div>
          <div class="tile-title">Kafana Phrases</div>
          <div class="tile-sub">Ordering, greetings & real survival talk</div>
        </div>
      </a>

      <a href="#/grammar" class="tile c-lilac">
        <span class="tile-badge">7 CASES</span>
        <div class="tile-key">§</div>
        <div>
          <div class="tile-title">Grammar Rules</div>
          <div class="tile-sub">The 7 cases, verbs & the kafana cheat code</div>
        </div>
      </a>

      <a href="#/convert" class="tile">
        <span class="tile-badge">LIVE TOOL</span>
        <div class="tile-key">Ћ⇄Č</div>
        <div>
          <div class="tile-title">Script Converter</div>
          <div class="tile-sub">Live Ћирилица ⇄ Latinica transliterator</div>
        </div>
      </a>
    </div>

    <div class="home-split">
      <div class="box">
        <span class="kicker">РЕЧ ДАНА · WORD OF THE DAY</span>
        <div class="wotd-word cyr">${wotd.cyr}</div>
        <div class="wotd-lat">${wotd.lat}</div>
        <div class="wotd-en">${wotd.en}</div>
        <p class="muted" style="margin-top:8px;font-size:0.85rem;">${wotd.note}</p>
        <div class="row">
          <button class="btn btn-ink btn-sm" id="btn-wotd-speak">🔊 Listen</button>
          <button class="btn btn-yellow btn-sm" id="btn-wotd-slow">🐢 Slow (0.7x)</button>
        </div>
      </div>

      <div class="box">
        <span class="kicker">THE METHODOLOGY</span>
        <ul class="method-list">
          <li>
            <div><b>Vuk's 4 Tiers:</b> Learn identical letters first, defuse false friends, master classics, unlock the 5 Serbian specials.</div>
          </li>
          <li>
            <div><b>Active Sound Recall:</b> Train ear-to-letter connection with native speech synthesis and instant phonetic cues.</div>
          </li>
          <li>
            <div><b>High-Frequency Balkan Vocab:</b> Skip obscure filler. Focus on food, travel, Kafana etiquette, and street signs.</div>
          </li>
          <li>
            <div><b>Dual Script Fluency:</b> Seamlessly flip between Serbian Cyrillic and Gaj's Latinica.</div>
          </li>
        </ul>
      </div>
    </div>
  `;

  document.getElementById("btn-wotd-speak")?.addEventListener("click", (e) => {
    YugoAudio.speak(wotd.cyr, false, e.currentTarget);
  });
  document.getElementById("btn-wotd-slow")?.addEventListener("click", (e) => {
    YugoAudio.speak(wotd.cyr, true, e.currentTarget);
  });
});

// -------------------------------------------------------------
// 6. VIEW: ALPHABET (АЗБУКА)
// -------------------------------------------------------------
YugoRouter.register("/alphabet", (container) => {
  let activeFilter = "all";
  let selectedLetter = YUGO_DATA.alphabet[0];

  function render() {
    const filtered = YUGO_DATA.alphabet.filter(l => {
      if (activeFilter === "all") return true;
      return l.group === activeFilter;
    });

    const mastered = YugoStore.getMasteredCount();

    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">АЗБУКА · 30 PHONETIC LETTERS</span>
        <h1>SERBIAN CYRILLIC ALPHABET</h1>
        <p class="lead">
          Click any letter to hear its authentic pronunciation, see its Latin equivalent, and view its memory trick.
        </p>
      </div>

      <div class="chips">
        <button class="chip ${activeFilter === "all" ? "on" : ""}" data-filter="all">
          <span>All 30 Letters</span>
          <span class="chip-cyr">Све (${mastered}/30 mastered)</span>
        </button>
        <button class="chip ${activeFilter === "identical" ? "on" : ""}" data-filter="identical">
          <span>1. Identical (7)</span>
          <span class="chip-cyr">А, Е, Ј, К, М, О, Т</span>
        </button>
        <button class="chip ${activeFilter === "false_friends" ? "on" : ""}" data-filter="false_friends">
          <span>2. False Friends (6)</span>
          <span class="chip-cyr">В, Н, Р, С, У, Х</span>
        </button>
        <button class="chip ${activeFilter === "classic_cyrillic" ? "on" : ""}" data-filter="classic_cyrillic">
          <span>3. Cyrillic Classics (12)</span>
          <span class="chip-cyr">Б, Г, Д, Ж, З, И, Л...</span>
        </button>
        <button class="chip ${activeFilter === "serbian_specials" ? "on" : ""}" data-filter="serbian_specials">
          <span>4. Serbian Specials (5)</span>
          <span class="chip-cyr">Ђ, Љ, Њ, Ћ, Џ</span>
        </button>
      </div>

      <div class="alpha-layout">
        <div class="alpha-grid">
          ${filtered.map(l => {
            const mastery = YugoStore.getLetterMastery(l.cyr);
            const isSel = selectedLetter && selectedLetter.cyr === l.cyr;
            const gClass = l.group === "identical" ? "g1" :
                           l.group === "false_friends" ? "g2" :
                           l.group === "classic_cyrillic" ? "g3" : "g4";
            return `
              <button class="ltile ${gClass} ${isSel ? "sel" : ""}" data-cyr="${l.cyr}">
                <span class="cyr">${l.cyr}<em>${l.cyrLower}</em></span>
                <small>${l.lat}</small>
                ${YugoUI.renderBars(mastery, 3)}
              </button>
            `;
          }).join("")}
        </div>

        <div class="box detail" id="alpha-detail">
          ${renderDetailHtml(selectedLetter)}
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });

    container.querySelectorAll(".ltile").forEach(tile => {
      tile.addEventListener("click", () => {
        const cyr = tile.dataset.cyr;
        selectedLetter = YUGO_DATA.alphabet.find(l => l.cyr === cyr) || selectedLetter;
        render();
        YugoAudio.speak(selectedLetter.cyr);
      });
    });

    attachDetailListeners();
  }

  function renderDetailHtml(l) {
    if (!l) return "";
    const mastery = YugoStore.getLetterMastery(l.cyr);
    const isTrap = l.group === "false_friends";
    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <span class="tag ${isTrap ? "tag-new" : ""}">${l.groupLabel}</span>
          <div class="detail-letter cyr">${l.cyr} <span style="font-size:0.6em;font-weight:400;color:var(--mute);">${l.cyrLower}</span></div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.8rem;font-weight:700;letter-spacing:0.1em;color:var(--mute);">LATIN EQUIVALENT</span>
          <div style="font-family:var(--fh);font-weight:900;font-size:2.8rem;line-height:1;">${l.lat}</div>
        </div>
      </div>

      <div class="detail-sound">
        <b>Sound:</b> ${l.soundGuide}
        <div style="margin-top:6px;font-size:0.85rem;color:var(--mute);">IPA Phonetic: <code>${l.ipa}</code></div>
      </div>

      ${isTrap ? `<div class="warn-tag">⚠️ FALSE FRIEND: Don't read as Latin '${l.cyr}'!</div>` : ""}

      <div class="example">
        <div>
          <small class="kicker">EXAMPLE WORD</small>
          <span class="ex-word cyr">${l.example.cyr.replace(l.example.highlight, `<u>${l.example.highlight}</u>`)}</span>
          <small><b>${l.example.lat}</b> — ${l.example.en}</small>
        </div>
        <button class="btn btn-yellow btn-icon" id="btn-ex-speak" title="Listen to example word">🔊</button>
      </div>

      <div style="margin-top:16px;padding:12px;background:var(--paper);border:var(--b);font-size:0.88rem;">
        <b>Vuk's Pro-Tip:</b> ${l.proTip}
      </div>

      <div class="detail-meta">
        <span>Mastery Level:</span>
        ${YugoUI.renderBars(mastery, 3)}
        <span style="margin-left:auto;font-size:0.8rem;color:var(--mute);">${mastery}/3 ★</span>
      </div>

      <div class="row tight" style="margin-top:16px;">
        <button class="btn btn-ink" id="btn-detail-speak" style="flex:1;">🔊 Speak Letter</button>
        <button class="btn btn-yellow" id="btn-detail-slow" style="flex:1;">🐢 Slow (0.7x)</button>
      </div>
    `;
  }

  function attachDetailListeners() {
    document.getElementById("btn-detail-speak")?.addEventListener("click", (e) => {
      YugoAudio.speak(selectedLetter.cyr, false, e.currentTarget);
    });
    document.getElementById("btn-detail-slow")?.addEventListener("click", (e) => {
      YugoAudio.speak(selectedLetter.cyr, true, e.currentTarget);
    });
    document.getElementById("btn-ex-speak")?.addEventListener("click", (e) => {
      YugoAudio.speak(selectedLetter.example.cyr, false, e.currentTarget);
    });
  }

  render();
});

// -------------------------------------------------------------
// 7. VIEW: RAPID DRILL (ADAPTIVE LETTER & SOUND TRAINER)
// -------------------------------------------------------------
YugoRouter.register("/drill", (container) => {
  let drillMode = "cyr_to_lat"; // 'cyr_to_lat' | 'lat_to_cyr' | 'audio_to_cyr' | 'type_lat'
  let filterGroup = "all";
  let questions = [];
  let curIndex = 0;
  let score = 0;
  let misses = [];
  let answered = false;

  function initQuestions() {
    let pool = YUGO_DATA.alphabet;
    if (filterGroup !== "all") {
      pool = pool.filter(l => l.group === filterGroup);
    }
    // Shuffle
    questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 15);
    curIndex = 0;
    score = 0;
    misses = [];
    answered = false;
  }

  function renderSetup() {
    container.innerHTML = `
      <div class="page-head setup">
        <span class="kicker">RAPID-FIRE DRILL</span>
        <h1>CYRILLIC REFLEX TRAINER</h1>
        <p class="lead">
          Build instant sub-second recognition reflexes. No guessing, pure phonetic mastery.
        </p>
      </div>

      <div class="box setup">
        <h3 class="step">1. Select Question Format</h3>
        <div class="chips" id="drill-mode-chips">
          <button class="chip ${drillMode === "cyr_to_lat" ? "on" : ""}" data-mode="cyr_to_lat">
            <span>Cyrillic → Latin</span>
            <span class="chip-cyr">Read Ж → Ž</span>
          </button>
          <button class="chip ${drillMode === "lat_to_cyr" ? "on" : ""}" data-mode="lat_to_cyr">
            <span>Latin → Cyrillic</span>
            <span class="chip-cyr">Match Ž → Ж</span>
          </button>
          <button class="chip ${drillMode === "audio_to_cyr" ? "on" : ""}" data-mode="audio_to_cyr">
            <span>Audio → Cyrillic</span>
            <span class="chip-cyr">Hear Sound → Pick Letter 🔊</span>
          </button>
          <button class="chip ${drillMode === "type_lat" ? "on" : ""}" data-mode="type_lat">
            <span>Typing Mode</span>
            <span class="chip-cyr">Type Latin / Diacritics ⌨</span>
          </button>
        </div>

        <h3 class="step">2. Target Letter Group</h3>
        <div class="chips" id="drill-group-chips">
          <button class="chip ${filterGroup === "all" ? "on" : ""}" data-group="all">All 30 Letters</button>
          <button class="chip ${filterGroup === "false_friends" ? "on" : ""}" data-group="false_friends">⚠️ False Friends (B, H, P, C, Y, X)</button>
          <button class="chip ${filterGroup === "serbian_specials" ? "on" : ""}" data-group="serbian_specials">★ Serbian Specials (Ђ, Љ, Њ, Ћ, Џ)</button>
          <button class="chip ${filterGroup === "classic_cyrillic" ? "on" : ""}" data-group="classic_cyrillic">Cyrillic Classics</button>
        </div>

        <div class="row" style="margin-top:28px;">
          <button class="btn btn-red btn-xl" id="btn-start-drill">START 15-ROUND DRILL ⚡</button>
        </div>
      </div>
    `;

    container.querySelectorAll("#drill-mode-chips .chip").forEach(btn => {
      btn.addEventListener("click", () => {
        drillMode = btn.dataset.mode;
        renderSetup();
      });
    });

    container.querySelectorAll("#drill-group-chips .chip").forEach(btn => {
      btn.addEventListener("click", () => {
        filterGroup = btn.dataset.group;
        renderSetup();
      });
    });

    document.getElementById("btn-start-drill")?.addEventListener("click", () => {
      initQuestions();
      renderQuestion();
    });
  }

  function renderQuestion() {
    if (curIndex >= questions.length) {
      renderResults();
      return;
    }

    const current = questions[curIndex];
    answered = false;

    // Generate 4 options (1 correct + 3 distinct distractors)
    const options = [current];
    const distractorPool = YUGO_DATA.alphabet.filter(l => l.cyr !== current.cyr);
    while (options.length < 4 && distractorPool.length) {
      const idx = Math.floor(Math.random() * distractorPool.length);
      options.push(distractorPool.splice(idx, 1)[0]);
    }
    options.sort(() => Math.random() - 0.5);

    const isAudioMode = drillMode === "audio_to_cyr";
    const isTypeMode = drillMode === "type_lat";

    container.innerHTML = `
      <div class="session">
        <div class="session-top">
          <button class="btn btn-sm" id="btn-quit-drill">✕ Exit</button>
          <div class="bar" style="flex:1;"><i style="width:${(curIndex / questions.length) * 100}%;"></i></div>
          <span class="count">${curIndex + 1} / ${questions.length}</span>
        </div>

        <div class="box prompt">
          <div class="prompt-label">
            ${isAudioMode ? "LISTEN AND IDENTIFY THE CYRILLIC LETTER" :
              drillMode === "cyr_to_lat" ? "WHAT IS THE LATIN EQUIVALENT?" :
              drillMode === "lat_to_cyr" ? "WHAT IS THE CYRILLIC LETTER?" :
              "TYPE THE LATIN EQUIVALENT (e.g. Ž, Đ, LJ, C...)"}
          </div>

          ${isAudioMode ? `
            <div style="margin:24px 0;">
              <button class="btn btn-yellow btn-xl" id="btn-drill-audio" style="font-size:2rem;padding:24px 36px;">
                🔊 PLAY SOUND
              </button>
            </div>
          ` : isTypeMode ? `
            <div class="mega cyr">${current.cyr}</div>
            <div style="font-size:0.95rem;color:var(--mute);margin-top:6px;">${current.example.cyr} (${current.example.en})</div>
          ` : drillMode === "cyr_to_lat" ? `
            <div class="mega cyr">${current.cyr}</div>
          ` : `
            <div class="mega">${current.lat}</div>
          `}

          ${isTypeMode ? `
            <form class="type-form" id="type-form" autocomplete="off" style="margin-top:20px;">
              <input type="text" class="type-input" id="type-input" placeholder="Type Latin equivalent..." autofocus>
              <button type="submit" class="btn btn-ink" id="btn-type-submit">CHECK ↵</button>
            </form>
            <div class="diacritics">
              <span style="font-size:0.75rem;font-weight:700;color:var(--mute);align-self:center;">SERBIAN KEYS:</span>
              <button class="key" data-k="Č">Č</button>
              <button class="key" data-k="Ć">Ć</button>
              <button class="key" data-k="Đ">Đ</button>
              <button class="key" data-k="Š">Š</button>
              <button class="key" data-k="Ž">Ž</button>
              <button class="key" data-k="Dž">Dž</button>
              <button class="key" data-k="Lj">Lj</button>
              <button class="key" data-k="Nj">Nj</button>
            </div>
          ` : `
            <div class="opts" id="opts">
              ${options.map((opt, i) => {
                const label = isAudioMode || drillMode === "lat_to_cyr" ? opt.cyr : opt.lat;
                const isCyr = isAudioMode || drillMode === "lat_to_cyr";
                return `
                  <button class="opt" data-cyr="${opt.cyr}">
                    <kbd>${i + 1}</kbd>
                    <span class="opt-txt ${isCyr ? "cyr opt-big" : "opt-big"}">${label}</span>
                  </button>
                `;
              }).join("")}
            </div>
          `}
        </div>

        <div class="feedback" id="feedback"></div>
      </div>
    `;

    document.getElementById("btn-quit-drill")?.addEventListener("click", () => renderSetup());

    // Auto-play audio in audio mode
    if (isAudioMode) {
      setTimeout(() => YugoAudio.speak(current.cyr), 250);
      document.getElementById("btn-drill-audio")?.addEventListener("click", () => {
        YugoAudio.speak(current.cyr);
      });
    }

    if (isTypeMode) {
      const input = document.getElementById("type-input");
      const form = document.getElementById("type-form");

      container.querySelectorAll(".diacritics .key").forEach(k => {
        k.addEventListener("click", () => {
          if (!input) return;
          input.value += k.dataset.k;
          input.focus();
        });
      });

      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (answered || !input) return;
        const val = input.value.trim().toLowerCase();
        const expected = current.lat.toLowerCase();
        // Allow common alternate representations like dj for đ
        const isOk = val === expected || (expected === "đ" && val === "dj");
        handleAnswer(isOk, input);
      });
    } else {
      // Multiple choice clicks
      container.querySelectorAll(".opt").forEach(btn => {
        btn.addEventListener("click", () => {
          if (answered) return;
          const chosenCyr = btn.dataset.cyr;
          const isOk = chosenCyr === current.cyr;
          handleAnswer(isOk, btn);
        });
      });

      // Keyboard shortcuts 1, 2, 3, 4
      const handleKey = (e) => {
        if (answered) {
          if (e.key === "Enter" || e.key === " ") {
            window.removeEventListener("keydown", handleKey);
            curIndex++;
            renderQuestion();
          }
          return;
        }
        if (["1", "2", "3", "4"].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          const btns = container.querySelectorAll(".opt");
          if (btns[idx]) {
            btns[idx].click();
          }
        }
      };
      window.addEventListener("keydown", handleKey, { once: false });
    }
  }

  function handleAnswer(isOk, triggerEl) {
    answered = true;
    const current = questions[curIndex];
    const fb = document.getElementById("feedback");

    if (isOk) {
      score++;
      YugoStore.addXP(5, triggerEl);
      YugoStore.setLetterMastery(current.cyr, 1);
      YugoAudio.fxCorrect();
      if (triggerEl) triggerEl.classList.add("correct");

      if (fb) {
        fb.className = "feedback show ok";
        fb.innerHTML = `
          <div class="fb-msg">
            <strong>ТАЧНО! · CORRECT</strong>
            <span>${current.cyr} = <b>${current.lat}</b> [${current.soundGuide}]</span>
          </div>
          <button class="btn btn-ink" id="btn-next">NEXT ↵</button>
        `;
      }
    } else {
      misses.push(current);
      YugoStore.setLetterMastery(current.cyr, -1);
      YugoAudio.fxWrong();
      if (triggerEl) triggerEl.classList.add("wrong");

      if (window.YugoAPI) {
        const userChoice = triggerEl ? triggerEl.textContent.trim() : "wrong";
        YugoAPI.logMistake(
          "drill",
          `letter_${current.cyr}`,
          `Identify Cyrillic letter: ${current.cyr}`,
          userChoice,
          `${current.lat} (${current.soundGuide})`,
          current.proTip || current.soundGuide,
          current.group || "letter"
        );
      }

      // Highlight correct option
      container.querySelectorAll(".opt").forEach(b => {
        if (b.dataset.cyr === current.cyr) b.classList.add("correct");
        else b.classList.add("dim");
      });

      if (fb) {
        fb.className = "feedback show bad";
        fb.innerHTML = `
          <div class="fb-msg">
            <strong>НИЈЕ ТАЧНО · MISTAKE!</strong>
            <span>The letter <b>${current.cyr}</b> is Latin <b>${current.lat}</b> (${current.soundGuide})</span>
          </div>
          <button class="btn btn-ink" id="btn-next">GOT IT ↵</button>
        `;
      }
    }

    YugoAudio.speak(current.cyr);

    document.getElementById("btn-next")?.addEventListener("click", () => {
      curIndex++;
      renderQuestion();
    });
  }

  function renderResults() {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const xpBonus = score * 5 + (pct === 100 ? 50 : 20);
    YugoStore.addXP(xpBonus);
    if (pct >= 80) YugoAudio.fxWin();

    if (window.YugoAPI) {
      YugoAPI.logSession("drill", 60, total, score, xpBonus);
    }

    container.innerHTML = `
      <div class="box results">
        <span class="kicker">DRILL COMPLETED</span>
        <div class="big-score">${score}<span>/${total}</span></div>
        <div class="verdict">
          <h2>${pct === 100 ? "САВРШЕНО! · FLAWLESS ACCURACY" : pct >= 80 ? "ОДЛИЧНО! · GREAT MASTERY" : "ДОБАР ТРУД · KEEP DRILLING"}</h2>
          <p class="muted">+${xpBonus} XP Bonus Awarded to your profile</p>
        </div>

        ${misses.length ? `
          <div style="margin:24px 0;text-align:left;">
            <h3 style="margin-bottom:10px;">LETTERS TO REVIEW (${misses.length})</h3>
            <ul class="miss-list">
              ${misses.map(m => `
                <li>
                  <span class="cyr">${m.cyr} ${m.cyrLower}</span>
                  <span><b>Latin:</b> ${m.lat}</span>
                  <span style="color:var(--mute);">${m.soundGuide}</span>
                  <button class="btn btn-sm btn-yellow" onclick="YugoAudio.speak('${m.cyr}')">🔊</button>
                </li>
              `).join("")}
            </ul>
          </div>
        ` : `
          <div style="margin:20px 0;padding:16px;background:var(--feedback-ok-bg);color:var(--feedback-ok-color);border:var(--b);font-weight:700;">
            ★ Zero errors! Your recognition speed is at native reflex level.
          </div>
        `}

        <div class="row center">
          <button class="btn btn-red btn-lg" id="btn-retry">DRILL AGAIN ⚡</button>
          <a href="#/alphabet" class="btn btn-ink btn-lg">Back to Азбука</a>
        </div>
      </div>
    `;

    document.getElementById("btn-retry")?.addEventListener("click", () => {
      initQuestions();
      renderQuestion();
    });
  }

  renderSetup();
});

// -------------------------------------------------------------
// 8. VIEW: FLASHCARDS (SPACED REPETITION)
// -------------------------------------------------------------
YugoRouter.register("/cards", (container) => {
  let activeDeckId = "alphabet";
  let curIndex = 0;
  let flipped = false;

  function getDeck() {
    return YUGO_DATA.decks.find(d => d.id === activeDeckId) || YUGO_DATA.decks[0];
  }

  function render() {
    const deck = getDeck();
    const items = deck.items;
    const current = items[curIndex];

    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">LEITNER FLASHCARDS · SPACED REPETITION</span>
        <h1>SERBIAN MEMORY DECKS</h1>
        <p class="lead">Select a deck below. Flip each card, say the word out loud, and rate your confidence.</p>
      </div>

      <div class="deck-grid">
        ${YUGO_DATA.decks.map(d => `
          <button class="deck ${d.id === activeDeckId ? "on" : ""}" data-deck="${d.id}">
            <span class="deck-icon">${d.icon}</span>
            <b>${d.name}</b>
            <small>${d.items.length} cards</small>
          </button>
        `).join("")}
      </div>

      <div class="session" style="margin-top:28px;">
        <div class="session-top">
          <span style="font-weight:700;font-size:0.9rem;">${deck.name}</span>
          <div class="bar" style="flex:1;"><i style="width:${((curIndex + 1) / items.length) * 100}%;"></i></div>
          <span class="count">${curIndex + 1} / ${items.length}</span>
        </div>

        <div class="box flash" id="card">
          <div class="tags">
            <span class="tag">${deck.icon} ${deck.id}</span>
            ${current.hint ? `<span class="tag tag-new">${current.hint}</span>` : ""}
          </div>

          <div class="card-word cyr">${current.cyr}</div>

          <div class="row center" style="margin-top:14px;">
            <button class="btn btn-yellow btn-sm" id="btn-card-audio">🔊 Speak</button>
            <button class="btn btn-ink btn-sm" id="btn-card-slow">🐢 Slow</button>
          </div>

          ${flipped ? `
            <div class="card-back">
              <div class="ans-lat">${current.lat}</div>
              <div class="ans-en">${current.en}</div>
            </div>
          ` : `
            <div style="margin-top:32px;color:var(--mute);font-size:0.85rem;font-weight:700;">
              [CLICK CARD OR PRESS SPACE TO FLIP]
            </div>
          `}
        </div>

        <div class="card-actions">
          ${!flipped ? `
            <button class="btn btn-yellow btn-lg wide" id="btn-flip">FLIP CARD (SPACE) ↵</button>
          ` : `
            <button class="btn rate rate-0" data-rating="0">
              <b>AGAIN</b>
              <small>&lt; 1 min</small>
            </button>
            <button class="btn rate rate-1" data-rating="1">
              <b>HARD</b>
              <small>1 day</small>
            </button>
            <button class="btn rate rate-2" data-rating="2">
              <b>GOOD</b>
              <small>3 days</small>
            </button>
            <button class="btn rate rate-3" data-rating="3">
              <b>EASY</b>
              <small>7 days</small>
            </button>
          `}
        </div>

        <div class="row center" style="margin-top:20px;">
          <button class="btn btn-sm" id="btn-prev-card" ${curIndex === 0 ? "disabled" : ""}>← Previous</button>
          <button class="btn btn-sm" id="btn-shuffle-card">🔀 Shuffle Deck</button>
          <button class="btn btn-sm" id="btn-next-card" ${curIndex === items.length - 1 ? "disabled" : ""}>Next →</button>
        </div>
      </div>
    `;

    // Deck selection
    container.querySelectorAll(".deck").forEach(btn => {
      btn.addEventListener("click", () => {
        activeDeckId = btn.dataset.deck;
        curIndex = 0;
        flipped = false;
        render();
      });
    });

    // Flip & card clicks
    const flipFn = () => {
      flipped = !flipped;
      YugoAudio.fxClick();
      render();
    };

    document.getElementById("btn-flip")?.addEventListener("click", flipFn);
    document.getElementById("card")?.addEventListener("click", (e) => {
      // Don't flip if clicking audio buttons
      if (e.target.closest("button")) return;
      flipFn();
    });

    // Audio triggers
    document.getElementById("btn-card-audio")?.addEventListener("click", (e) => {
      e.stopPropagation();
      YugoAudio.speak(current.cyr, false, e.currentTarget);
    });
    document.getElementById("btn-card-slow")?.addEventListener("click", (e) => {
      e.stopPropagation();
      YugoAudio.speak(current.cyr, true, e.currentTarget);
    });

    // Rating buttons
    container.querySelectorAll(".rate").forEach(btn => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.dataset.rating, 10);
        YugoStore.addXP(rating + 2, btn);
        YugoAudio.fxCorrect();
        flipped = false;
        curIndex = (curIndex + 1) % items.length;
        render();
      });
    });

    // Navigation buttons
    document.getElementById("btn-prev-card")?.addEventListener("click", () => {
      if (curIndex > 0) {
        curIndex--;
        flipped = false;
        render();
      }
    });

    document.getElementById("btn-next-card")?.addEventListener("click", () => {
      if (curIndex < items.length - 1) {
        curIndex++;
        flipped = false;
        render();
      }
    });

    document.getElementById("btn-shuffle-card")?.addEventListener("click", () => {
      items.sort(() => Math.random() - 0.5);
      curIndex = 0;
      flipped = false;
      YugoUI.toast("Deck shuffled!");
      render();
    });
  }

  render();
});

// -------------------------------------------------------------
// 9. VIEW: MASTERY QUIZ (10 QUESTIONS)
// -------------------------------------------------------------
YugoRouter.register("/quiz", (container) => {
  let questions = [];
  let curIndex = 0;
  let score = 0;
  let answered = false;

  function buildQuiz() {
    questions = [];

    // 1. Letters questions (3)
    const letterSample = [...YUGO_DATA.alphabet].sort(() => Math.random() - 0.5).slice(0, 3);
    letterSample.forEach(l => {
      const distractors = YUGO_DATA.alphabet.filter(x => x.cyr !== l.cyr).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [l, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: "letter",
        prompt: `Which Latin sound does the Serbian Cyrillic letter «${l.cyr}» make?`,
        cyr: l.cyr,
        correct: l.lat,
        explanation: `${l.cyr} = ${l.lat} (${l.soundGuide})`,
        options: opts.map(o => o.lat)
      });
    });

    // 2. Vocabulary questions (4)
    const vocabPool = YUGO_DATA.decks.flatMap(d => d.items.filter(i => i.cyr.length > 1));
    const vocabSample = [...vocabPool].sort(() => Math.random() - 0.5).slice(0, 4);
    vocabSample.forEach(v => {
      const distractors = vocabPool.filter(x => x.cyr !== v.cyr).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [v, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: "vocab",
        prompt: `What does «${v.cyr}» (${v.lat}) mean?`,
        cyr: v.cyr,
        correct: v.en,
        explanation: `«${v.cyr}» (${v.lat}) translates to "${v.en}".`,
        options: opts.map(o => o.en)
      });
    });

    // 3. Audio listening question (2)
    const audioSample = [...YUGO_DATA.alphabet].sort(() => Math.random() - 0.5).slice(0, 2);
    audioSample.forEach(l => {
      const distractors = YUGO_DATA.alphabet.filter(x => x.cyr !== l.cyr).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [l, ...distractors].sort(() => Math.random() - 0.5);
      questions.push({
        type: "audio",
        prompt: "Listen to the audio. Which letter was spoken?",
        cyr: l.cyr,
        correct: l.cyr,
        explanation: `The audio spoken was «${l.cyr}» (${l.lat}).`,
        options: opts.map(o => o.cyr),
        isAudio: true
      });
    });

    // 4. Vuk Rule / Grammar question (1)
    questions.push({
      type: "grammar",
      prompt: "What is Vuk Karadžić's fundamental rule of Serbian spelling?",
      correct: "Write as you speak, read as it is written",
      explanation: "«Пиши као што говориш, читај како је написано» means 100% phonetic 1-to-1 consistency.",
      options: [
        "Write as you speak, read as it is written",
        "Always double vowels for length",
        "Capitalize every noun like German",
        "Silent letters indicate root etymology"
      ]
    });

    // Shuffle the 10 questions
    questions.sort(() => Math.random() - 0.5);
    curIndex = 0;
    score = 0;
    answered = false;
  }

  function renderQuestion() {
    if (curIndex >= questions.length) {
      renderResults();
      return;
    }

    const q = questions[curIndex];
    answered = false;

    container.innerHTML = `
      <div class="session">
        <div class="session-top">
          <span class="tag tag-new">ROUND ${curIndex + 1} / ${questions.length}</span>
          <div class="bar" style="flex:1;"><i style="width:${(curIndex / questions.length) * 100}%;"></i></div>
          <span class="count">${score} Points</span>
        </div>

        <div class="box prompt">
          <div class="prompt-label">QUESTION ${curIndex + 1}</div>
          <div class="prompt-word ${q.isAudio ? "" : "en"}">${q.prompt}</div>

          ${q.isAudio ? `
            <div style="margin:20px 0;">
              <button class="btn btn-yellow btn-xl" id="btn-quiz-audio">🔊 LISTEN TO SOUND</button>
            </div>
          ` : ""}

          <div class="opts" id="opts">
            ${q.options.map((opt, i) => `
              <button class="opt" data-ans="${opt}">
                <kbd>${i + 1}</kbd>
                <span class="opt-txt ${q.isAudio ? "cyr opt-big" : ""}">${opt}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="feedback" id="feedback"></div>
      </div>
    `;

    if (q.isAudio) {
      setTimeout(() => YugoAudio.speak(q.cyr), 300);
      document.getElementById("btn-quiz-audio")?.addEventListener("click", () => {
        YugoAudio.speak(q.cyr);
      });
    }

    container.querySelectorAll(".opt").forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosen = btn.dataset.ans;
        const isOk = chosen === q.correct;
        const fb = document.getElementById("feedback");

        if (isOk) {
          score++;
          YugoStore.addXP(10, btn);
          YugoAudio.fxCorrect();
          btn.classList.add("correct");
          if (fb) {
            fb.className = "feedback show ok";
            fb.innerHTML = `
              <div class="fb-msg">
                <strong>ТАЧНО! · CORRECT</strong>
                <span>${q.explanation}</span>
              </div>
              <button class="btn btn-ink" id="btn-quiz-next">NEXT ↵</button>
            `;
          }
        } else {
          YugoAudio.fxWrong();
          btn.classList.add("wrong");

          if (window.YugoAPI) {
            YugoAPI.logMistake(
              "quiz",
              q.cyr || "quiz_item",
              q.question,
              chosen,
              q.correct,
              q.explanation,
              q.type || "quiz"
            );
          }

          container.querySelectorAll(".opt").forEach(b => {
            if (b.dataset.ans === q.correct) b.classList.add("correct");
            else b.classList.add("dim");
          });
          if (fb) {
            fb.className = "feedback show bad";
            fb.innerHTML = `
              <div class="fb-msg">
                <strong>НИЈЕ ТАЧНО · INCORRECT</strong>
                <span>Correct answer: <b>${q.correct}</b>. ${q.explanation}</span>
              </div>
              <button class="btn btn-ink" id="btn-quiz-next">CONTINUE ↵</button>
            `;
          }
        }

        document.getElementById("btn-quiz-next")?.addEventListener("click", () => {
          curIndex++;
          renderQuestion();
        });
      });
    });
  }

  function renderResults() {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const xpBonus = score * 10 + (pct >= 80 ? 50 : 10);
    YugoStore.addXP(xpBonus);
    if (pct >= 70) YugoAudio.fxWin();

    if (window.YugoAPI) {
      YugoAPI.logSession("quiz", 90, total, score, xpBonus);
    }

    container.innerHTML = `
      <div class="box results">
        <span class="kicker">QUIZ COMPLETE</span>
        <div class="big-score">${score}<span>/${total}</span></div>
        <div class="verdict">
          <h2>${pct === 100 ? "САВРШЕНО! · PERFECT SCORE" : pct >= 70 ? "СЈАЈНО! · GREAT PERFORMANCE" : "ТРЕНИРАЈ ДАЉЕ · PRACTICE MORE"}</h2>
          <p class="muted">+${xpBonus} XP Bonus credited to your journey.</p>
        </div>
        <div class="row center" style="margin-top:24px;">
          <button class="btn btn-red btn-lg" id="btn-retake">RETAKE QUIZ ⚡</button>
          <a href="#/drill" class="btn btn-yellow btn-lg">Drill Letters</a>
          <a href="#/" class="btn btn-ink btn-lg">Home</a>
        </div>
      </div>
    `;

    document.getElementById("btn-retake")?.addEventListener("click", () => {
      buildQuiz();
      renderQuestion();
    });
  }

  buildQuiz();
  renderQuestion();
});

// -------------------------------------------------------------
// 10. VIEW: SPEED MATCH (CONNECT CYRILLIC & LATIN)
// -------------------------------------------------------------
YugoRouter.register("/match", (container) => {
  let activeDeckId = "essentials";
  let leftItems = [];
  let rightItems = [];
  let selectedLeft = null;
  let selectedRight = null;
  let matchedPairs = 0;
  let startTime = null;
  let timerInterval = null;
  let finalTimeSec = 0;

  function getDeck() {
    return YUGO_DATA.decks.find(d => d.id === activeDeckId) || YUGO_DATA.decks[1];
  }

  function initMatch() {
    clearInterval(timerInterval);
    const deck = getDeck();
    // Pick 6 random items
    const sample = [...deck.items].sort(() => Math.random() - 0.5).slice(0, 6);

    leftItems = sample.map(item => ({ id: item.cyr, text: item.cyr, isCyr: true }));
    rightItems = sample.map(item => ({ id: item.cyr, text: `${item.lat} (${item.en})`, isCyr: false }));

    // Shuffle both columns independently
    leftItems.sort(() => Math.random() - 0.5);
    rightItems.sort(() => Math.random() - 0.5);

    selectedLeft = null;
    selectedRight = null;
    matchedPairs = 0;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
  }

  function updateTimer() {
    const el = document.getElementById("match-timer");
    if (!el || !startTime) return;
    const diff = (Date.now() - startTime) / 1000;
    el.textContent = `${diff.toFixed(1)}s`;
  }

  function render() {
    const deck = getDeck();
    const bestTime = YugoStore.data.bestMatchTimes[activeDeckId];

    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">SPEED MATCH · CONNECT SCRIPTS</span>
        <h1>SPEED MATCHER</h1>
        <p class="lead">Tap a Cyrillic card on the left, then connect it to its matching Latin/English meaning on the right.</p>
      </div>

      <div class="deck-grid" style="margin-bottom:20px;">
        ${YUGO_DATA.decks.map(d => `
          <button class="deck ${d.id === activeDeckId ? "on" : ""}" data-deck="${d.id}">
            <span class="deck-icon">${d.icon}</span>
            <b>${d.name}</b>
          </button>
        `).join("")}
      </div>

      <div class="match-bar box-flat">
        <div>
          <span style="font-weight:700;font-size:0.8rem;color:var(--mute);">ACTIVE DECK:</span>
          <b>${deck.name}</b>
        </div>
        <div class="timer" id="match-timer">0.0s</div>
        <div class="best">BEST: ${bestTime ? `${bestTime}s` : "None"}</div>
      </div>

      <div class="match-grid">
        <div class="col" id="col-left">
          ${leftItems.map(item => `
            <button class="mtile cyr" data-id="${item.id}" id="left-${item.id}">
              ${item.text}
            </button>
          `).join("")}
        </div>

        <div class="col" id="col-right">
          ${rightItems.map(item => `
            <button class="mtile" data-id="${item.id}" id="right-${item.id}">
              ${item.text}
            </button>
          `).join("")}
        </div>
      </div>

      <div id="match-done-wrap"></div>
    `;

    // Deck switch
    container.querySelectorAll(".deck").forEach(btn => {
      btn.addEventListener("click", () => {
        activeDeckId = btn.dataset.deck;
        initMatch();
        render();
      });
    });

    // Left column items
    container.querySelectorAll("#col-left .mtile").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("matched")) return;
        container.querySelectorAll("#col-left .mtile").forEach(b => b.classList.remove("sel"));
        btn.classList.add("sel");
        selectedLeft = btn.dataset.id;
        YugoAudio.speak(btn.dataset.id);
        checkMatch();
      });
    });

    // Right column items
    container.querySelectorAll("#col-right .mtile").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("matched")) return;
        container.querySelectorAll("#col-right .mtile").forEach(b => b.classList.remove("sel"));
        btn.classList.add("sel");
        selectedRight = btn.dataset.id;
        YugoAudio.fxClick();
        checkMatch();
      });
    });
  }

  function checkMatch() {
    if (!selectedLeft || !selectedRight) return;

    const leftEl = document.getElementById(`left-${selectedLeft}`);
    const rightEl = document.getElementById(`right-${selectedRight}`);

    if (selectedLeft === selectedRight) {
      // Correct match!
      YugoAudio.fxCorrect();
      YugoStore.addXP(4, leftEl);
      leftEl.classList.remove("sel");
      rightEl.classList.remove("sel");
      leftEl.classList.add("matched");
      rightEl.classList.add("matched");
      matchedPairs++;

      selectedLeft = null;
      selectedRight = null;

      if (matchedPairs >= leftItems.length) {
        finishMatch();
      }
    } else {
      // Mismatch
      YugoAudio.fxWrong();
      leftEl.classList.add("wrong");
      rightEl.classList.add("wrong");

      if (window.YugoAPI) {
        YugoAPI.logMistake(
          "match",
          `match_${selectedLeft}`,
          `Speed match pair for: ${selectedLeft}`,
          selectedRight,
          selectedLeft,
          "Speed matching misconnection",
          "match"
        );
      }

      setTimeout(() => {
        leftEl.classList.remove("wrong", "sel");
        rightEl.classList.remove("wrong", "sel");
        selectedLeft = null;
        selectedRight = null;
      }, 400);
    }
  }

  function finishMatch() {
    clearInterval(timerInterval);
    finalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
    YugoAudio.fxWin();

    if (window.YugoAPI) {
      YugoAPI.logSession("match", Math.round(parseFloat(finalTimeSec)), leftItems.length, leftItems.length, 25);
    }

    const curBest = YugoStore.data.bestMatchTimes[activeDeckId];
    const isNewBest = !curBest || parseFloat(finalTimeSec) < parseFloat(curBest);
    if (isNewBest) {
      YugoStore.data.bestMatchTimes[activeDeckId] = finalTimeSec;
      YugoStore.save();
    }

    YugoStore.addXP(25);

    const doneWrap = document.getElementById("match-done-wrap");
    if (doneWrap) {
      doneWrap.innerHTML = `
        <div class="box match-done" style="animation:rise 0.3s;">
          <h2>СВЕ ПОВЕЗАНО! · ALL MATCHED!</h2>
          <div class="big-score" style="font-size:4rem;margin:10px 0;">${finalTimeSec}s</div>
          <p class="muted">
            ${isNewBest ? "🏆 NEW PERSONAL RECORD!" : `Deck Best: ${curBest}s`} · +25 XP Bonus
          </p>
          <div class="row center">
            <button class="btn btn-red btn-lg" id="btn-match-again">PLAY AGAIN ⚡</button>
          </div>
        </div>
      `;
      document.getElementById("btn-match-again")?.addEventListener("click", () => {
        initMatch();
        render();
      });
    }
  }

  initMatch();
  render();
});

// -------------------------------------------------------------
// 11. VIEW: PRACTICAL PHRASES
// -------------------------------------------------------------
YugoRouter.register("/phrases", (container) => {
  let activeCatIndex = 0;
  let hideEnglish = false;

  function render() {
    const cat = YUGO_DATA.phrases[activeCatIndex] || YUGO_DATA.phrases[0];

    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">СВАКОДНЕВНИ ГОВОР · SURVIVAL PHRASES</span>
        <h1>AUTHENTIC SERBIAN PHRASES</h1>
        <p class="lead">
          Real colloquial Serbian with native phonetic speech and grammatical context breakdown.
        </p>
      </div>

      <div class="chips">
        ${YUGO_DATA.phrases.map((c, i) => `
          <button class="chip ${i === activeCatIndex ? "on" : ""}" data-idx="${i}">
            <span>${c.category.split("(")[0]}</span>
            <span class="chip-cyr">${c.category.match(/\((.*?)\)/)?.[1] || ""}</span>
          </button>
        `).join("")}
      </div>

      <div class="toolbar">
        <button class="btn btn-sm ${hideEnglish ? "btn-yellow" : ""}" id="btn-toggle-en">
          ${hideEnglish ? "👁 Reveal English Translations" : "🙈 Blur English (Active Recall)"}
        </button>
        <span style="font-size:0.8rem;color:var(--mute);margin-left:auto;">${cat.items.length} phrases in category</span>
      </div>

      <div class="phrase-list ${hideEnglish ? "hidden-en" : ""}">
        ${cat.items.map((item, idx) => `
          <div class="box phrase" id="phrase-${idx}">
            <div style="flex:1;">
              <div class="ph-cyr cyr">${item.cyr}</div>
              <div class="ph-lat sub">${item.lat}</div>
              <div class="ph-en">${item.en}</div>
              ${item.note ? `<div class="ph-note">${item.note}</div>` : ""}
            </div>
            <div class="phrase-actions">
              <button class="btn btn-yellow btn-icon" data-speak="${item.cyr}" title="Listen">🔊</button>
              <button class="btn btn-icon slow" data-slow="${item.cyr}" title="Slow (0.7x)">🐢</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    // Category switch
    container.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCatIndex = parseInt(btn.dataset.idx, 10);
        render();
      });
    });

    // Toggle blur
    document.getElementById("btn-toggle-en")?.addEventListener("click", () => {
      hideEnglish = !hideEnglish;
      render();
    });

    // Un-blur on click
    if (hideEnglish) {
      container.querySelectorAll(".ph-en").forEach(el => {
        el.addEventListener("click", () => el.classList.toggle("revealed"));
      });
    }

    // Audio triggers
    container.querySelectorAll("[data-speak]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.speak;
        YugoAudio.speak(text, false, btn);
        YugoStore.addXP(1);
      });
    });

    container.querySelectorAll("[data-slow]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.slow;
        YugoAudio.speak(text, true, btn);
      });
    });
  }

  render();
});

// -------------------------------------------------------------
// 12. VIEW: GRAMMAR CHEATSHEETS
// -------------------------------------------------------------
YugoRouter.register("/grammar", (container) => {
  let openIndex = 0; // First lesson open by default

  function render() {
    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">ГРАМАТИКА БЕЗ МУКЕ · BRUTALIST GRAMMAR</span>
        <h1>SERBIAN GRAMMAR PLAYBOOK</h1>
        <p class="lead">
          No 500-page linguistic jargon. Just the core rules, the 7 cases, verb conjugations, and the kafana cheat codes.
        </p>
      </div>

      <div class="lessons">
        ${YUGO_DATA.grammar.map((lesson, idx) => `
          <div class="lesson ${idx === openIndex ? "open" : ""}" id="lesson-${idx}">
            <button class="lesson-head" data-idx="${idx}">
              <div class="lesson-num">${idx + 1}</div>
              <div>
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-sub">${lesson.subtitle}</div>
              </div>
              <div class="lesson-toggle">+</div>
            </button>
            <div class="lesson-body">
              ${lesson.content}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    container.querySelectorAll(".lesson-head").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        openIndex = openIndex === idx ? -1 : idx;
        render();
      });
    });
  }

  render();
});

// -------------------------------------------------------------
// 13. VIEW: SCRIPT CONVERTER (ЋИРИЛИЦА ⇄ LATINICA)
// -------------------------------------------------------------
YugoRouter.register("/convert", (container) => {
  let cyrVal = "Добродошли у Србију! Пиши као што говориш.";
  let latVal = YugoTranslit.toLatin(cyrVal);

  function render() {
    container.innerHTML = `
      <div class="page-head">
        <span class="kicker">ПРЕСЛОВЉАВАЊЕ · TWO-WAY TRANSLITERATOR</span>
        <h1>SERBIAN SCRIPT CONVERTER</h1>
        <p class="lead">
          Convert instantly between Serbian Cyrillic (Ћирилица) and Gaj's Latin (Latinica).
          Handles all Serbian digraphs (LJ, NJ, DŽ) with 100% accuracy.
        </p>
      </div>

      <div class="conv">
        <div class="box-flat conv-pane">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <label>ЋИРИЛИЦА (CYRILLIC)</label>
            <div class="row tight">
              <button class="btn btn-sm btn-yellow" id="btn-cyr-speak">🔊 Read Aloud</button>
              <button class="btn btn-sm" id="btn-copy-cyr">Copy</button>
            </div>
          </div>
          <textarea id="ta-cyr" class="cyr" placeholder="Унесите текст овде...">${cyrVal}</textarea>
        </div>

        <div class="conv-swap">
          ⇄
        </div>

        <div class="box-flat conv-pane">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <label>LATINICA (LATIN)</label>
            <div class="row tight">
              <button class="btn btn-sm btn-yellow" id="btn-lat-speak">🔊 Read Aloud</button>
              <button class="btn btn-sm" id="btn-copy-lat">Copy</button>
            </div>
          </div>
          <textarea id="ta-lat" placeholder="Unesite tekst ovde...">${latVal}</textarea>
        </div>
      </div>

      <div class="box" style="margin-top:24px;">
        <span class="kicker">ON-SCREEN SERBIAN CYRILLIC KEYBOARD</span>
        <div class="kb" style="margin-top:12px;">
          ${YUGO_DATA.alphabet.map(l => `
            <button class="key" data-char="${l.cyr}">
              <span class="cyr">${l.cyr}</span>
              <small>${l.lat}</small>
            </button>
          `).join("")}
          <button class="key wide" data-char=" ">SPACE</button>
          <button class="key wide" id="btn-kb-clear">CLEAR</button>
        </div>
      </div>
    `;

    const taCyr = document.getElementById("ta-cyr");
    const taLat = document.getElementById("ta-lat");

    // Cyrillic input changes -> update Latin
    taCyr?.addEventListener("input", () => {
      cyrVal = taCyr.value;
      latVal = YugoTranslit.toLatin(cyrVal);
      if (taLat) taLat.value = latVal;
    });

    // Latin input changes -> update Cyrillic
    taLat?.addEventListener("input", () => {
      latVal = taLat.value;
      cyrVal = YugoTranslit.toCyrillic(latVal);
      if (taCyr) taCyr.value = cyrVal;
    });

    // Audio speak
    document.getElementById("btn-cyr-speak")?.addEventListener("click", () => {
      YugoAudio.speak(taCyr.value);
    });
    document.getElementById("btn-lat-speak")?.addEventListener("click", () => {
      YugoAudio.speak(taLat.value);
    });

    // Clipboard copy
    document.getElementById("btn-copy-cyr")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(taCyr.value);
      YugoUI.toast("Cyrillic text copied to clipboard!");
    });
    document.getElementById("btn-copy-lat")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(taLat.value);
      YugoUI.toast("Latin text copied to clipboard!");
    });

    // Keyboard buttons
    container.querySelectorAll(".kb .key[data-char]").forEach(btn => {
      btn.addEventListener("click", () => {
        const char = btn.dataset.char;
        taCyr.value += char;
        taCyr.dispatchEvent(new Event("input"));
        taCyr.focus();
      });
    });

    document.getElementById("btn-kb-clear")?.addEventListener("click", () => {
      taCyr.value = "";
      taLat.value = "";
      cyrVal = "";
      latVal = "";
      taCyr.focus();
    });
  }

  render();
});

// -------------------------------------------------------------
// 14. VIEW: SMART SRS (SPACED REPETITION ENGINE)
// -------------------------------------------------------------
YugoRouter.register("/srs", async (container) => {
  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">СМ-2 / FSRS · SPACED REPETITION LOGISTICS</span>
      <h1>SMART SRS REVIEW</h1>
      <p class="lead">Algorithmic memory retention engine. Active recall scheduling based on the Ebbinghaus forgetting curve.</p>
    </div>
    <div id="srs-mount" class="srs-wrap">
      <div class="box" style="text-align:center;padding:48px;">
        <p><b>Loading review queue from persistent memory...</b></p>
      </div>
    </div>
  `;

  const mount = document.getElementById("srs-mount");
  let queueData = await YugoAPI.getSRSQueue(25);
  let queue = queueData.queue || [];
  let curIndex = 0;
  let reviewedCount = 0;
  let sessionXp = 0;

  function renderEmpty() {
    mount.innerHTML = `
      <div class="box" style="text-align:center;padding:50px 24px;">
        <span class="kicker">INBOX ZERO · ALL MEMORIES CONSOLIDATED</span>
        <h2 style="font-size:2rem;margin:12px 0;">NO REVIEWS DUE RIGHT NOW</h2>
        <p class="lead" style="max-width:540px;margin:0 auto 24px;">
          Your memory traces are strong! The logistics engine has scheduled your next reviews according to your retention curve.
        </p>
        <div class="row center">
          <button class="btn btn-yellow btn-lg" id="btn-srs-all">⚡ Review 15 Cards Ahead of Schedule</button>
          <a href="#/tutor" class="btn btn-red btn-lg">Chat with Belgrade AI Tutor →</a>
          <a href="#/logistics" class="btn btn-ink btn-lg">View 7-Day Forecast</a>
        </div>
      </div>
    `;

    document.getElementById("btn-srs-all")?.addEventListener("click", async () => {
      const res = await YugoAPI.getSRSQueue(15);
      if (res && res.queue.length) {
        queue = res.queue;
        curIndex = 0;
        renderCard();
      } else {
        YugoUI.toast("No extra cards available.");
      }
    });
  }

  function renderCard() {
    if (curIndex >= queue.length) {
      renderSummary();
      return;
    }

    const card = queue[curIndex];
    let isFlipped = false;

    mount.innerHTML = `
      <div class="srs-header">
        <span class="muted-h"><b>CARD ${curIndex + 1} OF ${queue.length}</b></span>
        <div class="row tight">
          <span class="hud-item hud-streak">REPS: ${card.repetitions || 0}</span>
          <span class="hud-item hud-xp">INTERVAL: ${card.interval_days || 0}d</span>
        </div>
      </div>

      <div class="srs-card-box" id="srs-card">
        <span class="srs-badge">${card.item_type.toUpperCase()} · ${card.deck_id.toUpperCase()}</span>
        <div class="srs-counter">${curIndex + 1} / ${queue.length}</div>
        
        <div class="srs-cyr">${card.front_cyr}</div>
        <div class="row center" style="margin-top:8px;">
          <button class="btn btn-yellow btn-sm" id="btn-srs-speak">🔊 Listen Native</button>
        </div>

        <div id="srs-back" class="hidden" style="display:grid;gap:14px;margin-top:16px;">
          <div class="srs-lat">${card.front_lat}</div>
          <div class="srs-meaning">Meaning: <b>${card.back_en}</b></div>
          ${card.sound_guide ? `<div class="srs-hint">💡 <b>Phonetic Guide:</b> ${card.sound_guide}</div>` : ""}
          ${card.hint ? `<div class="srs-hint">Mnemonic: ${card.hint}</div>` : ""}
        </div>
      </div>

      <div id="srs-actions" class="row center" style="margin-top:16px;">
        <button class="btn btn-ink btn-lg" id="btn-srs-flip" style="min-width:240px;">SHOW ANSWER <kbd>SPACE</kbd></button>
      </div>

      <div id="srs-rating-bar" class="srs-ratings hidden" style="margin-top:16px;">
        <button class="btn btn-rating btn-again" data-grade="1">
          AGAIN <kbd>1</kbd>
          <small>&lt; 15 mins</small>
        </button>
        <button class="btn btn-rating btn-hard" data-grade="2">
          HARD <kbd>2</kbd>
          <small>+1 day</small>
        </button>
        <button class="btn btn-rating btn-good" data-grade="3">
          GOOD <kbd>3</kbd>
          <small>+3 days</small>
        </button>
        <button class="btn btn-rating btn-easy" data-grade="4">
          EASY <kbd>4</kbd>
          <small>+6+ days</small>
        </button>
      </div>
    `;

    const backEl = document.getElementById("srs-back");
    const actionsEl = document.getElementById("srs-actions");
    const ratingBar = document.getElementById("srs-rating-bar");

    // Auto speak
    YugoAudio.speak(card.front_cyr);

    document.getElementById("btn-srs-speak")?.addEventListener("click", () => {
      YugoAudio.speak(card.front_cyr);
    });

    function flipCard() {
      if (isFlipped) return;
      isFlipped = true;
      backEl.classList.remove("hidden");
      actionsEl.classList.add("hidden");
      ratingBar.classList.remove("hidden");
      YugoAudio.fxClick();
    }

    document.getElementById("btn-srs-flip")?.addEventListener("click", flipCard);

    ratingBar.querySelectorAll(".btn-rating").forEach(btn => {
      btn.addEventListener("click", async () => {
        const grade = parseInt(btn.dataset.grade, 10);
        await rateCard(grade);
      });
    });

    const keyListener = async (e) => {
      if (e.key === " " && !isFlipped) {
        e.preventDefault();
        flipCard();
      } else if (isFlipped && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        window.removeEventListener("keydown", keyListener);
        const grade = parseInt(e.key, 10);
        await rateCard(grade);
      }
    };
    window.addEventListener("keydown", keyListener, { once: false });

    async function rateCard(grade) {
      window.removeEventListener("keydown", keyListener);
      const res = await YugoAPI.submitSRSReview(card.id, grade);
      const xpGained = res?.xp_awarded || (grade * 5);
      sessionXp += xpGained;
      reviewedCount++;

      if (grade === 1) {
        YugoAudio.fxWrong();
        YugoAPI.logMistake("srs", card.id, card.front_cyr, "Failed recall", `${card.front_lat} (${card.back_en})`, card.sound_guide || "", card.deck_id);
      } else {
        YugoAudio.fxCorrect();
      }

      curIndex++;
      renderCard();
    }
  }

  function renderSummary() {
    YugoAudio.fxWin();
    if (window.YugoAPI) {
      YugoAPI.logSession("srs", reviewedCount * 12, reviewedCount, reviewedCount, sessionXp);
    }

    mount.innerHTML = `
      <div class="box results" style="text-align:center;padding:48px 24px;">
        <span class="kicker">SESSION CONSOLIDATED</span>
        <div class="big-score">${reviewedCount}<span> CARDS</span></div>
        <div class="verdict">
          <h2>ОДЛИЧАН ТРУД · MEMORY UPDATED</h2>
          <p class="lead">+${sessionXp} XP added to your persistent SQLite profile.</p>
        </div>
        <div class="row center" style="margin-top:24px;">
          <a href="#/logistics" class="btn btn-yellow btn-lg">View Memory Forecast 📊</a>
          <a href="#/tutor" class="btn btn-red btn-lg">Practice with Belgrade AI Tutor →</a>
          <a href="#/" class="btn btn-ink btn-lg">Return Home</a>
        </div>
      </div>
    `;
  }

  if (!queue || queue.length === 0) {
    renderEmpty();
  } else {
    renderCard();
  }
});

// -------------------------------------------------------------
// 15. VIEW: AI SERBIAN TUTOR & ROLEPLAY
// -------------------------------------------------------------
YugoRouter.register("/tutor", async (container) => {
  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">ВЕШТАЧКА ИНТЕЛИГЕНЦИЈА · NATIVE IMMERSION</span>
      <h1>BELGRADE AI TUTOR</h1>
      <p class="lead">Conversational roleplay with local intelligence (Ollama GPU + Serbian NLP). Practice Kafana banter, street directions, and grammar.</p>
    </div>

    <div class="tutor-layout">
      <div class="scenario-tabs" id="scenario-tabs">
        <button class="scenario-tab active" data-scenario="kafana">☕ Belgrade Kafana</button>
        <button class="scenario-tab" data-scenario="friend">🤝 Dorćol Friend</button>
        <button class="scenario-tab" data-scenario="market">🛒 Kalenić Market</button>
        <button class="scenario-tab" data-scenario="tutor">🎓 Professor Vuk (Grammar)</button>
      </div>

      <div class="tutor-chat-box">
        <div class="chat-head">
          <div id="chat-title" style="font-weight:700;">☕ Belgrade Kafana (Waiter Dušan)</div>
          <div class="row tight">
            <span class="hud-item" id="ai-model-tag" style="background:var(--yellow);color:var(--text-on-light);font-size:0.75rem;">
              ⚡ ${YugoAPI.activeModel.toUpperCase()}
            </span>
            <button class="btn btn-sm btn-ink" id="btn-clear-chat">Clear</button>
          </div>
        </div>

        <div class="chat-messages" id="chat-messages"></div>

        <div class="chat-starters" id="chat-starters"></div>

        <div class="box-flat" style="padding:6px 14px;background:var(--paper);border-top:var(--b);">
          <small style="font-weight:700;letter-spacing:0.06em;color:var(--mute);">QUICK SERBIAN CYRILLIC KEYS:</small>
          <div style="display:inline-flex;gap:4px;margin-left:8px;flex-wrap:wrap;">
            ${["Ђ", "Ј", "Љ", "Њ", "Ћ", "Џ", "Č", "Ć", "Ž", "Š", "Đ"].map(k => `
              <button class="btn btn-sm btn-yellow s-key" style="padding:1px 6px;font-size:0.8rem;" data-k="${k}">${k}</button>
            `).join("")}
          </div>
        </div>

        <div class="chat-input-bar">
          <input type="text" id="chat-input" placeholder="Type Serbian in Cyrillic or Latin (e.g. Једну кафу, молим)..." autocomplete="off">
          <button class="btn btn-red btn-lg" id="btn-chat-send">Send ↵</button>
        </div>
      </div>
    </div>
  `;

  const tabs = document.querySelectorAll(".scenario-tab");
  const msgContainer = document.getElementById("chat-messages");
  const startersContainer = document.getElementById("chat-starters");
  const inputEl = document.getElementById("chat-input");
  const sendBtn = document.getElementById("btn-chat-send");
  const titleEl = document.getElementById("chat-title");

  let curScenario = "kafana";
  const scenariosData = await YugoAPI.getScenarios();

  const startersMap = {
    kafana: [
      "Једну домаћу кафу, молим.",
      "Шта имате од јела?",
      "Колико кошта пиво?",
      "Рачун, молим!"
    ],
    friend: [
      "Ћао! Како си данас?",
      "Шта радиш у Београду?",
      "Хоћемо ли у кафић?",
      "Где се налази Калемегдан?"
    ],
    market: [
      "Пошто су јабуке данас?",
      "Желим два килограма сира.",
      "Да ли је ово домаћи кајмак?",
      "Хвала лепо, пријатно!"
    ],
    tutor: [
      "Објасни ми 7 падежа укратко.",
      "Која је разлика између Ћ и Ч?",
      "Како се мења глагол 'бити'?",
      "Зашто је слово В лажни пријатељ?"
    ]
  };

  function appendMessage(sender, text, latin = "", en = "", correction = "") {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;

    const senderLabel = sender === "user" ? "YOU · ТИ" : (
      curScenario === "kafana" ? "DUŠAN (WAITPERSON)" :
      curScenario === "friend" ? "MILICA (FRIEND)" :
      curScenario === "market" ? "JOVANKA (VENDOR)" : "PROFESSOR VUK"
    );

    bubble.innerHTML = `
      <div class="chat-sender">
        <span>${senderLabel}</span>
        ${sender === "assistant" ? `<button class="btn btn-sm btn-yellow btn-speak-msg">🔊 Speak</button>` : ""}
      </div>
      <div class="chat-cyr">${text}</div>
      ${latin ? `<div class="chat-lat">Latinica: ${latin}</div>` : ""}
      ${en ? `<div class="chat-en">English: ${en}</div>` : ""}
      ${correction ? `<div class="chat-correction">💡 <b>Linguistic Tip:</b> ${correction}</div>` : ""}
    `;

    if (sender === "assistant") {
      bubble.querySelector(".btn-speak-msg")?.addEventListener("click", () => {
        YugoAudio.speak(text);
      });
    }

    msgContainer.appendChild(bubble);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function setScenario(scId) {
    curScenario = scId;
    tabs.forEach(t => t.classList.toggle("active", t.dataset.scenario === scId));

    const sData = scenariosData[scId] || {};
    titleEl.textContent = sData.title || scId;
    msgContainer.innerHTML = "";

    // Starter assistant greeting
    const greeting = sData.starter || "Здраво! Изволите, како могу да помогнем?";
    appendMessage("assistant", greeting, YugoTranslit.toLatin(greeting));

    // Render quick starters
    const chips = startersMap[scId] || [];
    startersContainer.innerHTML = chips.map(c => `
      <button class="starter-chip" data-text="${c}">${c}</button>
    `).join("");

    startersContainer.querySelectorAll(".starter-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        inputEl.value = btn.dataset.text;
        sendMessage();
      });
    });
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";

    // Render user bubble
    appendMessage("user", text);
    YugoAudio.fxClick();

    // Show typing state
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble assistant";
    typingBubble.id = "typing-bubble";
    typingBubble.innerHTML = `<i>● ● ● Thinking in Serbian...</i>`;
    msgContainer.appendChild(typingBubble);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Send to backend
    const resp = await YugoAPI.sendAIChat(curScenario, text);
    typingBubble.remove();

    if (resp) {
      appendMessage(
        "assistant",
        resp.reply_display || resp.reply_raw,
        resp.latin || "",
        resp.english || "",
        resp.correction || ""
      );
      YugoAudio.fxCorrect();
      YugoStore.addXP(5);
    } else {
      appendMessage("assistant", "Извините, дошло је до грешке у вези са локалним сервером.", "Izvinite, doslo je do greske.");
    }
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => setScenario(t.dataset.scenario));
  });

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Serbian keys
  container.querySelectorAll(".s-key").forEach(k => {
    k.addEventListener("click", () => {
      inputEl.value += k.dataset.k;
      inputEl.focus();
    });
  });

  document.getElementById("btn-clear-chat")?.addEventListener("click", () => {
    setScenario(curScenario);
  });

  setScenario("kafana");
});

// -------------------------------------------------------------
// 16. VIEW: MISTAKES JOURNAL & WEAKNESS LOGISTICS
// -------------------------------------------------------------
YugoRouter.register("/mistakes", async (container) => {
  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">ДНЕВНИК ГРЕШАКА · WEAKNESS CONQUEST</span>
      <h1>MISTAKES JOURNAL</h1>
      <p class="lead">Every missed letter, false-friend trap, and quiz error is logged in persistent memory so you can target and conquer your blindspots.</p>
    </div>

    <div class="row" style="margin-bottom:24px;justify-content:space-between;flex-wrap:wrap;">
      <div class="row tight">
        <button class="btn btn-red btn-lg" id="btn-blitz-mistakes">⚡ Blitz Drill Mistakes</button>
      </div>
      <div class="row tight">
        <button class="btn btn-sm btn-yellow active" id="btn-filter-unresolved">Unresolved Only</button>
        <button class="btn btn-sm btn-paper" id="btn-filter-all">All History</button>
      </div>
    </div>

    <div id="mistakes-mount" class="mistakes-grid">
      <p><b>Loading mistake log from database...</b></p>
    </div>
  `;

  let showUnresolved = true;

  async function loadList() {
    const mount = document.getElementById("mistakes-mount");
    const data = await YugoAPI.getMistakes(showUnresolved);
    const list = data.mistakes || [];

    if (!list.length) {
      mount.innerHTML = `
        <div class="box" style="text-align:center;padding:48px 20px;">
          <h2 style="margin-bottom:12px;">★ ZERO ACTIVE MISTAKES!</h2>
          <p class="lead">You have conquered every error in your journal. Continue drilling to test your reflexes.</p>
          <div class="row center" style="margin-top:20px;">
            <a href="#/drill" class="btn btn-yellow btn-lg">Start Rapid Letter Drill →</a>
            <a href="#/srs" class="btn btn-ink btn-lg">Open Spaced Repetition</a>
          </div>
        </div>
      `;
      return;
    }

    mount.innerHTML = list.map(m => `
      <div class="mistake-card ${m.resolved ? "resolved" : ""}" data-id="${m.id}">
        <div class="mistake-top">
          <span class="mistake-badge">${m.error_category || m.mode || "TRAP"}</span>
          <span class="muted-h" style="font-size:0.75rem;">Failed ${m.review_count}x</span>
        </div>
        <div class="mistake-prompt">${m.prompt}</div>
        <div class="mistake-diff">
          <div>Your input: <span class="wrong">${m.user_answer}</span></div>
          <div>Target: <span class="right">${m.correct_answer}</span></div>
        </div>
        ${m.explanation ? `<div class="srs-hint" style="margin:0;font-size:0.82rem;">💡 ${m.explanation}</div>` : ""}
        <div class="row tight" style="margin-top:6px;">
          <button class="btn btn-sm btn-green btn-resolve" data-id="${m.id}">✓ Mark as Conquered</button>
          <button class="btn btn-sm btn-yellow btn-speak" data-text="${m.prompt}">🔊 Listen</button>
        </div>
      </div>
    `).join("");

    mount.querySelectorAll(".btn-resolve").forEach(b => {
      b.addEventListener("click", async () => {
        const id = parseInt(b.dataset.id, 10);
        await YugoAPI.resolveMistake(id);
        YugoAudio.fxCorrect();
        YugoUI.toast("Mistake marked as conquered!");
        loadList();
      });
    });

    mount.querySelectorAll(".btn-speak").forEach(b => {
      b.addEventListener("click", () => {
        YugoAudio.speak(b.dataset.text);
      });
    });
  }

  document.getElementById("btn-filter-unresolved")?.addEventListener("click", (e) => {
    showUnresolved = true;
    e.target.className = "btn btn-sm btn-yellow active";
    document.getElementById("btn-filter-all").className = "btn btn-sm btn-paper";
    loadList();
  });

  document.getElementById("btn-filter-all")?.addEventListener("click", (e) => {
    showUnresolved = false;
    e.target.className = "btn btn-sm btn-yellow active";
    document.getElementById("btn-filter-unresolved").className = "btn btn-sm btn-paper";
    loadList();
  });

  document.getElementById("btn-blitz-mistakes")?.addEventListener("click", () => {
    window.location.hash = "#/drill";
  });

  loadList();
});

// -------------------------------------------------------------
// 17. VIEW: VOCABULARY BANK (LINGQ-STYLE DICTIONARY)
// -------------------------------------------------------------
YugoRouter.register("/vocab", async (container) => {
  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">РЕЧНИК · LINGQ-STYLE VOCABULARY BANK</span>
      <h1>SERBIAN VOCAB BANK</h1>
      <p class="lead">Complete dictionary of vocabulary & phrases. Add custom words with live Cyrillic-to-Latin auto-transliteration.</p>
    </div>

    <div class="vocab-toolbar" style="margin-bottom:20px;">
      <input type="text" id="vocab-search" class="vocab-search" placeholder="Search Cyrillic, Latin, or English...">
      <div class="row tight">
        <button class="btn btn-sm btn-yellow active v-cat" data-cat="all">All</button>
        <button class="btn btn-sm btn-paper v-cat" data-cat="essentials">Essentials</button>
        <button class="btn btn-sm btn-paper v-cat" data-cat="food">Food & Drinks</button>
        <button class="btn btn-sm btn-paper v-cat" data-cat="numbers">Numbers</button>
        <button class="btn btn-sm btn-paper v-cat" data-cat="custom">Custom</button>
        <button class="btn btn-sm btn-red" id="btn-add-word-modal">➕ Add Word</button>
      </div>
    </div>

    <div id="add-word-panel" class="box hidden" style="margin-bottom:24px;background:var(--white);">
      <span class="kicker">ADD NEW VOCABULARY ITEM</span>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;margin-top:12px;">
        <div class="field">
          <label>Cyrillic (Ћирилица)</label>
          <input type="text" id="inp-add-cyr" class="cyr" placeholder="нпр. Плејскавица">
        </div>
        <div class="field">
          <label>Latinica</label>
          <input type="text" id="inp-add-lat" placeholder="npr. Pljeskavica">
        </div>
        <div class="field">
          <label>English Translation</label>
          <input type="text" id="inp-add-en" placeholder="e.g. Serbian Burger">
        </div>
        <div class="field">
          <label>Category</label>
          <select id="sel-add-cat">
            <option value="custom">Custom</option>
            <option value="food">Food & Drink</option>
            <option value="travel">Travel & City</option>
            <option value="slang">Belgrade Slang</option>
          </select>
        </div>
      </div>
      <div class="row tight" style="margin-top:16px;">
        <button class="btn btn-yellow btn-md" id="btn-save-vocab">Save Word to Database</button>
        <button class="btn btn-paper btn-md" id="btn-cancel-vocab">Cancel</button>
      </div>
    </div>

    <div class="vocab-table-wrap">
      <table class="vocab-table">
        <thead>
          <tr>
            <th>Cyrillic</th>
            <th>Latin</th>
            <th>English Meaning</th>
            <th>Category</th>
            <th>Audio</th>
          </tr>
        </thead>
        <tbody id="vocab-tbody">
          <tr><td colspan="5">Loading vocabulary items...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const searchInput = document.getElementById("vocab-search");
  const tbody = document.getElementById("vocab-tbody");
  const addPanel = document.getElementById("add-word-panel");
  const cyrInput = document.getElementById("inp-add-cyr");
  const latInput = document.getElementById("inp-add-lat");
  const enInput = document.getElementById("inp-add-en");
  const catSelect = document.getElementById("sel-add-cat");

  let curCategory = "all";
  let curSearch = "";

  async function loadTable() {
    const data = await YugoAPI.getVocab(curSearch, curCategory);
    const items = data.vocab || [];

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;">No vocabulary matching criteria found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(w => `
      <tr>
        <td class="cyr" style="font-size:1.2rem;font-weight:700;">${w.cyr}</td>
        <td><b>${w.lat}</b></td>
        <td>${w.en}</td>
        <td><span class="tile-badge" style="position:static;">${w.category}</span></td>
        <td>
          <button class="btn btn-sm btn-yellow btn-v-speak" data-cyr="${w.cyr}">🔊 Speak</button>
          ${w.is_custom ? `<button class="btn btn-sm btn-red btn-v-del" data-id="${w.id}">✕</button>` : ""}
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-v-speak").forEach(b => {
      b.addEventListener("click", () => YugoAudio.speak(b.dataset.cyr));
    });

    tbody.querySelectorAll(".btn-v-del").forEach(b => {
      b.addEventListener("click", async () => {
        if (confirm("Delete this custom word?")) {
          await YugoAPI.deleteVocab(b.dataset.id);
          loadTable();
        }
      });
    });
  }

  // Live auto-transliteration in Add Word form
  cyrInput?.addEventListener("input", () => {
    latInput.value = YugoTranslit.toLatin(cyrInput.value);
  });
  latInput?.addEventListener("input", () => {
    cyrInput.value = YugoTranslit.toCyrillic(latInput.value);
  });

  document.getElementById("btn-add-word-modal")?.addEventListener("click", () => {
    addPanel.classList.toggle("hidden");
    cyrInput.focus();
  });

  document.getElementById("btn-cancel-vocab")?.addEventListener("click", () => {
    addPanel.classList.add("hidden");
  });

  document.getElementById("btn-save-vocab")?.addEventListener("click", async () => {
    const cyr = cyrInput.value.trim();
    const lat = latInput.value.trim();
    const en = enInput.value.trim();
    const cat = catSelect.value;

    if (!cyr || !en) {
      YugoUI.toast("Please enter both the Serbian word and English translation", true);
      return;
    }

    await YugoAPI.addVocab(cyr, lat, en, cat);
    YugoAudio.fxCorrect();
    YugoUI.toast(`Word '${cyr}' saved to persistent memory!`);
    addPanel.classList.add("hidden");
    cyrInput.value = "";
    latInput.value = "";
    enInput.value = "";
    loadTable();
  });

  searchInput.addEventListener("input", () => {
    curSearch = searchInput.value;
    loadTable();
  });

  container.querySelectorAll(".v-cat").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".v-cat").forEach(b => b.className = "btn btn-sm btn-paper v-cat");
      btn.className = "btn btn-sm btn-yellow active v-cat";
      curCategory = btn.dataset.cat;
      loadTable();
    });
  });

  loadTable();
});

// -------------------------------------------------------------
// 18. VIEW: LEARNING LOGISTICS & FORECAST
// -------------------------------------------------------------
YugoRouter.register("/logistics", async (container) => {
  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">ЛОГИСТИКА УЧЕЊА · COGNITIVE OPTIMIZER</span>
      <h1>LEARNING LOGISTICS & FORECAST</h1>
      <p class="lead">Machine-assisted scheduling, memory retention modeling, and 7-day review forecast.</p>
    </div>

    <div id="logistics-mount">
      <p><b>Loading logistics plan and memory analytics...</b></p>
    </div>
  `;

  const mount = document.getElementById("logistics-mount");
  const [plan, analytics, forecast] = await Promise.all([
    YugoAPI.getLogisticsPlan(),
    YugoAPI.getAnalytics(),
    YugoAPI.getSRSForecast()
  ]);

  const p = plan || {
    due_count: 0,
    mastered_count: 0,
    learning_count: 0,
    unseen_count: 0,
    unresolved_mistakes: 0,
    est_session_minutes: 5,
    retention_index: 0,
    recommended_focus: "Logistics data initializing..."
  };

  const fList = forecast || [];
  const maxDue = Math.max(1, ...fList.map(f => f.due_count));

  mount.innerHTML = `
    <div class="logistics-hero">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;">
        <div>
          <span class="kicker">TODAY'S COGNITIVE WORKOUT</span>
          <h2 style="margin-top:6px;">${p.recommended_focus}</h2>
        </div>
        <div class="row tight">
          <a href="#/srs" class="btn btn-yellow btn-lg">Start Daily SRS ⚡</a>
        </div>
      </div>

      <div class="stats" style="margin-top:12px;">
        <div class="stat">
          <div class="stat-num">${p.due_count}</div>
          <div class="stat-label">Cards Due Today</div>
        </div>
        <div class="stat">
          <div class="stat-num">${p.retention_index}%</div>
          <div class="stat-label">Retention Index</div>
        </div>
        <div class="stat">
          <div class="stat-num">${p.unresolved_mistakes}</div>
          <div class="stat-label">Active Mistakes</div>
        </div>
        <div class="stat">
          <div class="stat-num">~${p.est_session_minutes} <small>MIN</small></div>
          <div class="stat-label">Est. Completion Time</div>
        </div>
      </div>
    </div>

    <div class="box" style="margin-top:28px;">
      <span class="kicker">7-DAY SPACED REPETITION MEMORY FORECAST</span>
      <h3>REVIEWS COMING DUE</h3>
      <p class="muted" style="margin-top:4px;font-size:0.85rem;">Calculated by SM-2 / FSRS cognitive intervals.</p>

      <div class="forecast-chart">
        ${fList.map(item => {
          const heightPct = Math.round((item.due_count / maxDue) * 100);
          return `
            <div class="forecast-bar">
              <span style="font-size:0.75rem;font-weight:700;">${item.due_count}</span>
              <div class="forecast-fill" style="height:${Math.max(8, heightPct)}%;"></div>
              <span class="forecast-label">${item.day_label}<br><small style="font-weight:400;color:var(--mute);">${item.date}</small></span>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div class="box" style="margin-top:28px;">
      <span class="kicker">АЗБУКА MASTERY MATRIX</span>
      <h3>30-LETTER COGNITIVE CONSOLIDATION</h3>
      <p class="muted" style="margin-top:4px;font-size:0.85rem;">Click any letter to hear native pronunciation. Colors indicate mastery level (0 to 5).</p>

      <div class="mastery-matrix" style="margin-top:16px;">
        ${YUGO_DATA.alphabet.map(l => {
          const lvl = YugoStore.getLetterMastery(l.cyr);
          return `
            <div class="matrix-cell lvl-${lvl}" onclick="YugoAudio.speak('${l.cyr}')">
              <div class="matrix-cyr">${l.cyr}</div>
              <div class="matrix-lat">${l.lat}</div>
              <div style="font-size:0.65rem;font-weight:700;">LVL ${lvl}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div class="box" style="margin-top:28px;">
      <span class="kicker">PERSISTENCE ARCHITECTURE</span>
      <h3>SQLITE WAL DATABASE ENGINE</h3>
      <div style="margin-top:12px;font-size:0.9rem;display:grid;gap:8px;">
        <div><b>Database Path:</b> <code>backend/yugolearn.db</code> (Persistent across all sessions)</div>
        <div><b>Mode:</b> WAL (Write-Ahead Logging) with ACID compliance</div>
        <div><b>Local Intelligence:</b> Ollama GPU (qwen3:4b) + Serbian Heuristic NLP</div>
      </div>
      <div class="row" style="margin-top:16px;">
        <button class="btn btn-yellow btn-md" id="btn-force-sync">Force Persistent Sync</button>
      </div>
    </div>
  `;

  document.getElementById("btn-force-sync")?.addEventListener("click", async () => {
    await YugoAPI.saveState(YugoStore.data);
    YugoUI.toast("SQLite database synced with local state!");
  });
});

// -------------------------------------------------------------
// 19. VIEW: SETTINGS
// -------------------------------------------------------------
YugoRouter.register("/settings", (container) => {
  const voices = YugoAudio.voices;
  const currentVoiceName = YugoAudio.selectedVoice ? YugoAudio.selectedVoice.name : "";
  const soundFx = YugoStore.getSetting("soundFx", true);
  const speechRate = YugoStore.getSetting("speechRate", 0.9);
  const currentTheme = YugoStore.getSetting("theme", "dark");
  const currentFont = YugoStore.getSetting("fontFamily", "learner");

  container.innerHTML = `
    <div class="page-head">
      <span class="kicker">ПОДЕШАВАЊА · AUDIO & APP PREFERENCES</span>
      <h1>APP SETTINGS</h1>
      <p class="lead">Configure visual theme dossier, typography reading font, speech synthesis voice, rate, and data persistence.</p>
    </div>

    <div class="settings">
      <div class="box field">
        <label>Визуелна тема · Visual Theme Dossier</label>
        <p class="help">
          Toggle between authentic aged 1974 Yugoslav newsprint and classified Cold War Noir dark dossier. Quick toggle also available via header button or pressing <code>T</code>.
        </p>
        <div class="theme-picker" id="theme-picker">
          <div class="theme-card ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" tabindex="0" role="button">
            <div class="theme-card-prev prev-dark">
              <span class="prev-letter">Ж</span>
              <span class="prev-dots">
                <i style="background:#e63928;border-color:#e63928;"></i>
                <i style="background:#f2ba32;border-color:#f2ba32;"></i>
                <i style="background:#3d7dd9;border-color:#3d7dd9;"></i>
              </span>
            </div>
            <div class="theme-card-title">
              <span>🌙 НОЋНИ (DARK)</span>
              ${currentTheme === 'dark' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="theme-card-sub">Cold War Noir · Smudged carbon slate, glowing ivory Cyrillic & Zastava lacquer red</div>
          </div>

          <div class="theme-card ${currentTheme === 'light' ? 'active' : ''}" data-theme="light" tabindex="0" role="button">
            <div class="theme-card-prev prev-light">
              <span class="prev-letter">Ж</span>
              <span class="prev-dots">
                <i style="background:#bd2818;border-color:#bd2818;"></i>
                <i style="background:#cfa027;border-color:#cfa027;"></i>
                <i style="background:#1b355d;border-color:#1b355d;"></i>
              </span>
            </div>
            <div class="theme-card-title">
              <span>☀️ ДНЕВНИ (LIGHT)</span>
              ${currentTheme === 'light' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="theme-card-sub">SFRJ Newsprint · 1974 aged paper cellulose patina & linotype ink</div>
          </div>

          <div class="theme-card ${currentTheme === 'auto' ? 'active' : ''}" data-theme="auto" tabindex="0" role="button">
            <div class="theme-card-prev prev-auto">
              <span class="prev-letter">⚙</span>
              <span class="prev-dots">
                <i style="background:#3d7dd9;border-color:#3d7dd9;"></i>
                <i style="background:#f2ba32;border-color:#f2ba32;"></i>
                <i style="background:#2eb868;border-color:#2eb868;"></i>
              </span>
            </div>
            <div class="theme-card-title">
              <span>🖥️ СИСТЕМ (AUTO)</span>
              ${currentTheme === 'auto' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="theme-card-sub">Adaptive OS · Follows your operating system dark/light mode preference</div>
          </div>
        </div>
      </div>

      <div class="box field">
        <label>Типографија и писмо · Cyrillic Reading Font Preset</label>
        <p class="help">
          Select a font tailored for learning Serbian Cyrillic. Toggle between ultra-clear modern sans, literary book serifs, and vintage newsprint. Quick cycle via header button or pressing <code>F</code>.
        </p>
        <div class="font-picker" id="font-picker">
          <div class="font-card ${currentFont === 'learner' ? 'active' : ''}" data-font="learner" tabindex="0" role="button">
            <div class="font-card-prev font-prev-learner">
              <span class="fp-big">Ж б љ ћ џ ш</span>
              <span class="fp-sub">Азбука · Vuk Karadžić</span>
            </div>
            <div class="font-card-title">
              <span>★ ЈАСНА ЋИРИЛИЦА (CLEAN LEARNER)</span>
              ${currentFont === 'learner' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="font-card-sub">IBM Plex Sans · Open apertures, balanced geometry, zero stroke ambiguity. Ideal for beginners.</div>
          </div>

          <div class="font-card ${currentFont === 'inter' ? 'active' : ''}" data-font="inter" tabindex="0" role="button">
            <div class="font-card-prev font-prev-inter">
              <span class="fp-big">Ж б љ ћ џ ш</span>
              <span class="fp-sub">Азбука · Modern Screen</span>
            </div>
            <div class="font-card-title">
              <span>ИНТЕР СТУДИО (MODERN SANS)</span>
              ${currentFont === 'inter' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="font-card-sub">Inter · Geometric precision, high x-height, engineered for pixel-perfect screen legibility.</div>
          </div>

          <div class="font-card ${currentFont === 'literary' ? 'active' : ''}" data-font="literary" tabindex="0" role="button">
            <div class="font-card-prev font-prev-literary">
              <span class="fp-big">Ж б љ ћ џ ш</span>
              <span class="fp-sub">Азбука · Književnost</span>
            </div>
            <div class="font-card-title">
              <span>КЊИЖЕВНА (BELGRADE LITERARY)</span>
              ${currentFont === 'literary' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="font-card-sub">Lora · Low-contrast editorial book serif with authentic Cyrillic curves and warmth.</div>
          </div>

          <div class="font-card ${currentFont === 'vintage' ? 'active' : ''}" data-font="vintage" tabindex="0" role="button">
            <div class="font-card-prev font-prev-vintage">
              <span class="fp-big">Ж б љ ћ џ ш</span>
              <span class="fp-sub">Азбука · SFRJ 1974</span>
            </div>
            <div class="font-card-title">
              <span>РЕТРО ДОСИЈЕ (VINTAGE PRINT)</span>
              ${currentFont === 'vintage' ? '<span class="theme-badge-check">AKTIVNO</span>' : ''}
            </div>
            <div class="font-card-sub">Playfair Display & Oswald · High-contrast linotype newspaper press and teletype headings.</div>
          </div>
        </div>
      </div>

      <div class="box field">
        <label for="sel-voice">Speech Synthesis Voice</label>
        <select id="sel-voice">
          ${voices.length ? voices.map(v => `
            <option value="${v.name}" ${v.name === currentVoiceName ? "selected" : ""}>
              ${v.name} (${v.lang}) ${/sr/i.test(v.lang) ? "★ Serbian" : /hr|bs/i.test(v.lang) ? "✓ South Slavic" : ""}
            </option>
          `).join("") : `<option value="">Default System Voice</option>`}
        </select>
        <p class="help">
          For the purest pronunciation, install Windows <b>Serbian (Cyrillic, Serbia)</b> speech pack in <code>Settings → Time & Language → Speech</code>.
        </p>
        <div class="row tight">
          <button class="btn btn-yellow btn-sm" id="btn-test-voice">🔊 Test Voice ("Здраво, како си?")</button>
        </div>
      </div>

      <div class="box field">
        <label for="rng-speed">Speech Rate: <span id="lbl-speed">${speechRate}x</span></label>
        <input type="range" id="rng-speed" min="0.5" max="1.3" step="0.05" value="${speechRate}">
      </div>

      <div class="box field">
        <label class="switch">
          <input type="checkbox" id="chk-soundfx" ${soundFx ? "checked" : ""}>
          <span>Brutalist Sound Effects (Correct / Error / Click Beeps)</span>
        </label>
      </div>

      <div class="box field">
        <div class="lbl">Local Intelligence & Persistent Memory (Backend)</div>
        <p class="help">
          Connected to local SQLite database: <code>backend/yugolearn.db</code>.
          Local AI model: <b>${YugoAPI.activeModel.toUpperCase()}</b>.
        </p>
        <div class="row">
          <button class="btn btn-yellow btn-sm" id="btn-sync-sqlite">💾 Sync State to SQLite Database</button>
          <a href="#/logistics" class="btn btn-ink btn-sm">📊 View Logistics Forecast</a>
          <a href="#/tutor" class="btn btn-red btn-sm">🤖 Open AI Belgrade Tutor</a>
        </div>
      </div>

      <div class="box field">
        <div class="lbl">Debug / Progress Controls</div>
        <div class="row">
          <button class="btn btn-yellow btn-sm" id="btn-add-xp">+50 XP (Test)</button>
          <button class="btn btn-red btn-sm" id="btn-reset">⚠️ Reset All Saved Progress</button>
        </div>
      </div>
    </div>
  `;

  // Theme card selectors
  document.querySelectorAll("#theme-picker .theme-card").forEach(card => {
    card.addEventListener("click", () => {
      const selected = card.getAttribute("data-theme");
      YugoTheme.set(selected);
      YugoRouter.routes["/settings"](container);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const selected = card.getAttribute("data-theme");
        YugoTheme.set(selected);
        YugoRouter.routes["/settings"](container);
      }
    });
  });

  // Font card selectors
  document.querySelectorAll("#font-picker .font-card").forEach(card => {
    card.addEventListener("click", () => {
      const selected = card.getAttribute("data-font");
      YugoFont.set(selected);
      YugoRouter.routes["/settings"](container);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const selected = card.getAttribute("data-font");
        YugoFont.set(selected);
        YugoRouter.routes["/settings"](container);
      }
    });
  });

  // Voice select
  document.getElementById("sel-voice")?.addEventListener("change", (e) => {
    const val = e.target.value;
    YugoStore.setSetting("preferredVoice", val);
    YugoAudio.detectBestVoice();
    YugoAudio.updateBadge();
    YugoUI.toast(`Voice set to: ${val}`);
  });

  // Test voice
  document.getElementById("btn-test-voice")?.addEventListener("click", () => {
    YugoAudio.speak("Здраво, како си? Добродошли у Југолерн.");
  });

  // Speed slider
  const rngSpeed = document.getElementById("rng-speed");
  const lblSpeed = document.getElementById("lbl-speed");
  rngSpeed?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    if (lblSpeed) lblSpeed.textContent = `${val.toFixed(2)}x`;
    YugoStore.setSetting("speechRate", val);
  });

  // Sound FX checkbox
  document.getElementById("chk-soundfx")?.addEventListener("change", (e) => {
    const checked = e.target.checked;
    YugoStore.setSetting("soundFx", checked);
    YugoAudio.soundFxEnabled = checked;
    YugoUI.toast(`Sound effects ${checked ? "enabled" : "disabled"}`);
  });

  // Sync SQLite
  document.getElementById("btn-sync-sqlite")?.addEventListener("click", async () => {
    if (window.YugoAPI) {
      await YugoAPI.saveState(YugoStore.data);
      YugoUI.toast("Saved and synced to persistent SQLite database!");
    }
  });

  // Debug buttons
  document.getElementById("btn-add-xp")?.addEventListener("click", () => {
    YugoStore.addXP(50);
    YugoUI.toast("+50 XP added!");
  });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all XP, streak, and letter mastery?")) {
      YugoStore.resetAll();
      YugoUI.toast("Progress reset to zero.");
      location.reload();
    }
  });
});

// -------------------------------------------------------------
// 15. BOOTSTRAP APPLICATION
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  YugoStore.init();
  YugoAudio.init();
  YugoTheme.init();
  YugoFont.init();
  YugoUI.setupTicker();
  YugoRouter.init();
});
