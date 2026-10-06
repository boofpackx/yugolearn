/* =========================================================
   YUGOLEARN — Backend API & Persistent Memory Client
   Seamless synchronization between browser & SQLite DB,
   Local Ollama AI intelligence, and SRS logistics.
   ========================================================= */

const YugoAPI = {
  // Base URL pointing to local FastAPI server
  baseUrl: "http://127.0.0.1:8000/api",
  isOnline: false,
  activeModel: "Loading...",

  async checkHealth() {
    try {
      const resp = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (!resp.ok) throw new Error("Health check failed");
      const data = await resp.json();
      this.isOnline = true;
      this.activeModel = data.ai?.active_model || "Built-in NLP";
      this.updateHudBadge(true, data.ai?.active_model);
      return data;
    } catch (e) {
      this.isOnline = false;
      this.updateHudBadge(false);
      return null;
    }
  },

  updateHudBadge(online, modelName = "") {
    const el = document.getElementById("hud-backend");
    if (!el) return;
    if (online) {
      el.className = "hud-item hud-backend online";
      el.innerHTML = `⚡ <span class="dot"></span> AI: <b>${modelName.split(":")[0].toUpperCase()}</b> · DB: ON`;
      el.title = `Connected to local SQLite database & Ollama (${modelName})`;
    } else {
      el.className = "hud-item hud-backend offline";
      el.innerHTML = `⚠️ <span class="dot"></span> LOCAL MIRROR`;
      el.title = "Running on browser storage mirror. Start backend for persistent SQLite memory & AI tutor.";
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
    try {
      const resp = await fetch(`${this.baseUrl}/srs/queue?limit=${limit}`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getSRSQueue failed:", e);
    }
    return { queue: [], count: 0 };
  },

  async submitSRSReview(cardId, grade) {
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
    try {
      const resp = await fetch(`${this.baseUrl}/logistics/plan`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getLogisticsPlan failed:", e);
    }
    return null;
  },

  async getAnalytics() {
    try {
      const resp = await fetch(`${this.baseUrl}/analytics`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getAnalytics failed:", e);
    }
    return null;
  },

  async logSession(mode, durationSeconds, totalItems, correctItems, xpEarned) {
    if (!this.isOnline) return;
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
    try {
      const resp = await fetch(`${this.baseUrl}/mistakes?only_unresolved=${onlyUnresolved}`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getMistakes failed:", e);
    }
    return { mistakes: [], count: 0 };
  },

  async logMistake(mode, itemId, prompt, userAns, correctAns, explanation = "", category = "") {
    if (!this.isOnline) return;
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
    try {
      const resp = await fetch(`${this.baseUrl}/vocab/${id}`, { method: "DELETE" });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API deleteVocab failed:", e);
    }
    return null;
  },

  // Local AI & Conversational Tutor
  async getScenarios() {
    try {
      const resp = await fetch(`${this.baseUrl}/ai/scenarios`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API getScenarios failed:", e);
    }
    return {};
  },

  async sendAIChat(scenario, message, model = null) {
    try {
      const resp = await fetch(`${this.baseUrl}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, message, model })
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API sendAIChat failed:", e);
    }
    return null;
  },

  async evaluateSentence(sentence) {
    try {
      const resp = await fetch(`${this.baseUrl}/ai/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence })
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("API evaluateSentence failed:", e);
    }
    return null;
  }
};
