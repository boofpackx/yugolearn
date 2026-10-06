/* =========================================================
   YUGOLEARN — Backend API & Persistent Memory Client
   Seamless synchronization between browser & SQLite DB
   and SRS logistics.
   ========================================================= */

const YugoAPI = {
  // Base URL pointing to local FastAPI server
  baseUrl: "http://127.0.0.1:8000/api",
  isOnline: false,
  _health: null,

  // The Python backend only ever runs on the learner's own machine. A hosted
  // copy (e.g. GitHub Pages) skips the probe and uses the in-browser engine.
  isLocalHost() {
    const host = location.hostname;
    return location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  },

  // Probes the backend once per page load; every caller shares the result.
  checkHealth() {
    if (!this._health) this._health = this.probeServer();
    return this._health;
  },

  async probeServer() {
    if (!this.isLocalHost()) {
      this.useBrowserEngine();
      return null;
    }
    try {
      const resp = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (!resp.ok) throw new Error("Health check failed");
      const data = await resp.json();
      this.isOnline = true;
      this.updateHudBadge(true);
      return data;
    } catch (e) {
      this.useBrowserEngine();
      return null;
    }
  },

  useBrowserEngine() {
    this.isOnline = false;
    this.updateHudBadge(false);
  },

  // True when calls should go to the backend, false for the in-browser engine.
  async useServer() {
    await this.checkHealth();
    return this.isOnline;
  },

  updateHudBadge(online) {
    const el = document.getElementById("hud-backend");
    if (!el) return;
    if (online) {
      el.className = "hud-item hud-backend online";
      el.innerHTML = `⚡ <span class="dot"></span> DB: ON`;
      el.title = "Connected to local SQLite database";
    } else {
      el.className = "hud-item hud-backend offline";
      el.innerHTML = `💾 <span class="dot"></span> BROWSER MODE`;
      el.title = "Progress is saved in this browser. Run the local backend to use the SQLite database.";
    }
  },

  async getState() {
    if (!this.isOnline) return null;
    try {
      const resp = await fetch(`${this.baseUrl}/state`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getState failed:", e);
    }
    return null;
  },

  async saveState(state) {
    if (!this.isOnline) return;
    try {
      await fetch(`${this.baseUrl}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
    } catch (e) {
      console.warn("API saveState failed:", e);
    }
  },

  async addXP(amount, reason = "reward") {
    if (!this.isOnline) return;
    try {
      await fetch(`${this.baseUrl}/xp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason })
      });
    } catch (e) {
      console.warn("API addXP failed:", e);
    }
  },

  // Spaced Repetition Logistics
  async getSRSQueue(limit = 25) {
    if (!(await this.useServer())) return YugoLocal.getSRSQueue(limit);
    try {
      const resp = await fetch(`${this.baseUrl}/srs/queue?limit=${limit}`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getSRSQueue failed:", e);
    }
    return { queue: [], count: 0 };
  },

  async submitSRSReview(cardId, grade) {
    if (!(await this.useServer())) return YugoLocal.submitSRSReview(cardId, grade);
    try {
      const resp = await fetch(`${this.baseUrl}/srs/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId, grade })
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API submitSRSReview failed:", e);
    }
    return null;
  },

  async getSRSForecast() {
    if (!(await this.useServer())) return YugoLocal.getSRSForecast();
    try {
      const resp = await fetch(`${this.baseUrl}/srs/forecast`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getSRSForecast failed:", e);
    }
    return [];
  },

  // Logistics & Analytics
  async getLogisticsPlan() {
    if (!(await this.useServer())) return YugoLocal.getLogisticsPlan();
    try {
      const resp = await fetch(`${this.baseUrl}/logistics/plan`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getLogisticsPlan failed:", e);
    }
    return null;
  },

  async getAnalytics() {
    if (!(await this.useServer())) return YugoLocal.getAnalytics();
    try {
      const resp = await fetch(`${this.baseUrl}/analytics`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getAnalytics failed:", e);
    }
    return null;
  },

  async logSession(mode, durationSeconds, totalItems, correctItems, xpEarned) {
    if (!(await this.useServer())) return YugoLocal.logSession(mode, durationSeconds, totalItems, correctItems, xpEarned);
    try {
      await fetch(`${this.baseUrl}/session/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          duration_seconds: durationSeconds,
          total_items: totalItems,
          correct_items: correctItems,
          xp_earned: xpEarned
        })
      });
    } catch (e) {
      console.warn("API logSession failed:", e);
    }
  },

  // Mistake Journal & Weakness Logistics
  async getMistakes(onlyUnresolved = true) {
    if (!(await this.useServer())) return YugoLocal.getMistakes(onlyUnresolved);
    try {
      const resp = await fetch(`${this.baseUrl}/mistakes?only_unresolved=${onlyUnresolved}`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getMistakes failed:", e);
    }
    return { mistakes: [], count: 0 };
  },

  async logMistake(mode, itemId, prompt, userAns, correctAns, explanation = "", category = "") {
    if (!(await this.useServer())) return YugoLocal.logMistake(mode, itemId, prompt, userAns, correctAns, explanation, category);
    try {
      await fetch(`${this.baseUrl}/mistakes/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          item_id: itemId,
          prompt,
          user_answer: userAns,
          correct_answer: correctAns,
          explanation,
          category
        })
      });
    } catch (e) {
      console.warn("API logMistake failed:", e);
    }
  },

  async resolveMistake(mistakeId) {
    if (!(await this.useServer())) return YugoLocal.resolveMistake(mistakeId);
    try {
      const resp = await fetch(`${this.baseUrl}/mistakes/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mistake_id: mistakeId })
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API resolveMistake failed:", e);
    }
    return null;
  },

  // LingQ-Style Vocabulary Bank
  async getVocab(q = "", category = "all") {
    if (!(await this.useServer())) return YugoLocal.getVocab(q, category);
    try {
      const url = new URL(`${this.baseUrl}/vocab`);
      if (q) url.searchParams.set("q", q);
      if (category && category !== "all") url.searchParams.set("category", category);
      const resp = await fetch(url);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getVocab failed:", e);
    }
    return { vocab: [], count: 0 };
  },

  async addVocab(cyr, lat, en, category = "custom", notes = "") {
    if (!(await this.useServer())) return YugoLocal.addVocab(cyr, lat, en, category, notes);
    try {
      const resp = await fetch(`${this.baseUrl}/vocab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cyr, lat, en, category, notes })
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API addVocab failed:", e);
    }
    return null;
  },

  async deleteVocab(id) {
    if (!(await this.useServer())) return YugoLocal.deleteVocab(id);
    try {
      const resp = await fetch(`${this.baseUrl}/vocab/${id}`, { method: "DELETE" });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API deleteVocab failed:", e);
    }
    return null;
  }
};

// Decide between the local backend and the in-browser engine as soon as the
// page loads, so the HUD badge is accurate on every view.
document.addEventListener("DOMContentLoaded", () => YugoAPI.checkHealth());
