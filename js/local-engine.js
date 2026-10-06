/* =========================================================
   YUGOLEARN — In-Browser Engine
   Mirrors the FastAPI backend (SRS logistics, mistake journal,
   vocab bank, analytics, built-in Serbian tutor) on top of
   localStorage, so the app runs fully on a static host such as
   GitHub Pages. Used whenever the local backend is not reachable.
   ========================================================= */

const YugoLocal = (() => {
  const STORAGE_KEY = "yugolearn_local_db_v1";

  // -------------------------------------------------------------
  // 1. SEED CONTENT (same as backend/seed.py)
  // -------------------------------------------------------------
  const SEED_LETTERS = [
    ["А", "A", "Short or long 'a' like father", "Identical"],
    ["Б", "B", "True 'B' as in Belgrade or book", "Cyrillic Classic"],
    ["В", "V", "Sounds like English 'V'! NOT 'B'!", "False Friend"],
    ["Г", "G", "Always hard 'G' as in go", "Cyrillic Classic"],
    ["Д", "D", "Firm 'D' as in day", "Cyrillic Classic"],
    ["Ђ", "Đ", "Soft 'dj' sound, like 'dew' (Vuk gem)", "Serbian Special"],
    ["Е", "E", "Clean open 'e' like bed or pet", "Identical"],
    ["Ж", "Ž", "Sound of 's' in treasure or measure", "Cyrillic Classic"],
    ["З", "Z", "Buzzing 'Z' as in zebra or zoo", "Cyrillic Classic"],
    ["И", "I", "Pure 'ee' sound as in meet or machine", "Cyrillic Classic"],
    ["Ј", "J", "Sounds like English 'Y' in yes", "Identical"],
    ["К", "K", "Crisp 'k' as in kite or coffee", "Identical"],
    ["Л", "L", "Clean 'L' as in lemon", "Cyrillic Classic"],
    ["Љ", "Lj", "Soft 'ly' sound like million or Italian gli", "Serbian Special"],
    ["М", "M", "'m' as in mother or moon", "Identical"],
    ["Н", "N", "Sounds like English 'N'! NOT 'H'!", "False Friend"],
    ["Њ", "Nj", "Soft 'ny' sound like canyon or Spanish ñ", "Serbian Special"],
    ["О", "O", "Pure round 'o' as in orbit", "Identical"],
    ["П", "P", "'P' as in park or paper (NOT P=R!)", "Cyrillic Classic"],
    ["Р", "R", "Rolled / trilled 'R'! NOT Latin 'P'!", "False Friend"],
    ["С", "S", "Sharp 'S' as in sun! NOT 'C'!", "False Friend"],
    ["Т", "T", "Dental 't' with tongue touching teeth", "Identical"],
    ["Ћ", "Ć", "Soft 'ch' sound in British tune", "Serbian Special"],
    ["У", "U", "Sounds like 'oo' in boot! NOT 'Y'!", "False Friend"],
    ["Ф", "F", "'F' as in film or friend", "Cyrillic Classic"],
    ["Х", "H", "Raspy 'h' in loch! NOT 'X'!", "False Friend"],
    ["Ц", "C", "Sound 'ts' as in tsunami or cats", "Cyrillic Classic"],
    ["Ч", "Č", "Hard 'ch' as in chocolate", "Cyrillic Classic"],
    ["Џ", "Dž", "Hard 'j' as in jeep or jam", "Serbian Special"],
    ["Ш", "Š", "Sound 'sh' as in shoe", "Cyrillic Classic"]
  ];

  const SEED_WORDS = [
    ["Да", "Da", "Yes", "essentials", "Short affirmative"],
    ["Не", "Ne", "No", "essentials", "Simple negation"],
    ["Молим", "Molim", "Please / Excuse me / You're welcome", "essentials", "Magic polite word"],
    ["Хвала", "Hvala", "Thank you", "essentials", "Remember: X = H"],
    ["Изволите", "Izvolite", "Here you go / How can I help?", "essentials", "Common in shops"],
    ["Здраво", "Zdravo", "Hello / Hi", "essentials", "Friendly informal greeting"],
    ["Довиђења", "Doviđenja", "Goodbye", "essentials", "Formal farewell"],
    ["Ћао", "Ćao", "Ciao / Hi / Bye", "essentials", "Very common informal"],
    ["Добро", "Dobro", "Good / Okay", "essentials", "Universal agreement"],
    ["Лоше", "Loše", "Bad", "essentials", "Opposite of dobro"],
    ["Добро јутро", "Dobro jutro", "Good morning", "essentials", "Morning greeting"],
    ["Добар дан", "Dobar dan", "Good day", "essentials", "Daytime greeting"],
    ["Добро вече", "Dobro veče", "Good evening", "essentials", "Evening greeting"],
    ["Лаку ноћ", "Laku noć", "Good night", "essentials", "Before sleep"],
    ["Како си?", "Kako si?", "How are you? (informal)", "essentials", "Friendly check-in"],
    ["Добро сам", "Dobro sam", "I am good", "essentials", "Standard reply"],
    ["Шта", "Šta", "What", "essentials", "Question word"],
    ["Ко", "Ko", "Who", "essentials", "Question word"],
    ["Где", "Gde", "Where", "essentials", "Navigation word"],
    ["Када", "Kada", "When", "essentials", "Time question"],
    ["Зашто", "Zašto", "Why", "essentials", "Reason question"],
    ["Колико кошта?", "Koliko košta?", "How much does it cost?", "essentials", "Crucial for market/store"],
    ["Рачун, молим", "Račun, molim", "The check/bill, please", "essentials", "At kafana/restaurant"],
    ["Један", "Jedan", "One (1)", "numbers", "Number 1"],
    ["Два", "Dva", "Two (2)", "numbers", "Number 2"],
    ["Три", "Tri", "Three (3)", "numbers", "Number 3"],
    ["Четири", "Četiri", "Four (4)", "numbers", "Number 4"],
    ["Пет", "Pet", "Five (5)", "numbers", "Number 5"],
    ["Десет", "Deset", "Ten (10)", "numbers", "Number 10"],
    ["Сто", "Sto", "One hundred (100) / Table", "numbers", "Number 100"],
    ["Кафа", "Kafa", "Coffee", "food", "Traditional beverage"],
    ["Вода", "Voda", "Water", "food", "Essential drink"],
    ["Пиво", "Pivo", "Beer", "food", "Cold beverage"],
    ["Хлеб", "Hleb", "Bread", "food", "Fresh bread"],
    ["Ћевапи", "Ćevapi", "Ćevapi (minced meat sausages)", "food", "Iconic Balkan dish"],
    ["Пљескавица", "Pljeskavica", "Serbian gourmet burger patty", "food", "Iconic Balkan food"],
    ["Кајмак", "Kajmak", "Clotted cream spread", "food", "Traditional dairy delight"],
    ["Сир", "Sir", "Cheese", "food", "Fresh cheese"],
    ["Ракија", "Rakija", "Fruit brandy (plum/quince)", "food", "National spirit"]
  ];

  // -------------------------------------------------------------
  // 2. AI TUTOR SCENARIOS & BUILT-IN SERBIAN NLP (backend/intelligence.py)
  // -------------------------------------------------------------
  const SCENARIOS = {
    kafana: {
      title: "☕ Belgrade Kafana / Kafić",
      description: "Order coffee (domaća or espresso), rakija, water, and food from waiter Dušan.",
      starter: "Добар дан, изволите! Шта могу да вам донесем данас? (Good day, how can I help you?)"
    },
    friend: {
      title: "🤝 Meeting a Friend in Dorćol",
      description: "Catch up with Milica, plan what to do in Belgrade, talk about the weather and food.",
      starter: "Ћао! Како си? Баш ми је драго што те видим! Шта има ново? (Hi! How are you? What's new?)"
    },
    market: {
      title: "🛒 Kalenić Green Market (Пијаца)",
      description: "Buy fresh fruit, vegetables, or kajmak from vendor Jovanka at the market.",
      starter: "Добар дан, душо! Изволи, погледај ове свеже јабуке и домаћи сир! Шта желиш? (Good day! Look at these fresh apples!)"
    },
    tutor: {
      title: "🎓 Professor Vuk (Grammar & Case Specialist)",
      description: "Ask any question about Serbian Cyrillic, 7 Padeži (cases), conjugations, or culture.",
      starter: "Поздрав! Ја сам професор Вук. Спреман сам да одговорим на сва твоја питања о српском језику. Шта те данас занима?"
    }
  };

  const FALLBACK_RESPONSES = {
    kafana: [
      ["каф", "Одлично! Једна домаћа кувана кафа са ратлуком, или еспресо са млеком? [Odlično! Jedna domaća kuvana kafa sa ratlukom, ili espreso sa mlekom?] (Great! One domestic Turkish coffee with Turkish delight, or espresso with milk?)"],
      ["ракиј", "Имамо одличну домаћу шљивовицу и дуњу! Шта више волите? [Imamo odličnu domaću šljivovicu i dunju! Šta više volite?] (We have great homemade plum and quince rakija! Which do you prefer?)"],
      ["вод", "Наравно, стиже чаша хладне воде са лимуном одмах! [Naravno, stiže čaša hladne vode sa limunom odmah!] (Of course, a glass of cold water with lemon coming right up!)"],
      ["јес|храна|мени|ћевап|пљескавиц", "Препоручујем наше ћевапе са кајмаком и свежим луком! [Preporučujem naše ćevape sa kajmakom i svežim lukom!] (I recommend our ćevapi with kajmak and fresh onion!)"],
      ["хвала", "Нема на чему, уживајте! Могу ли још нешто да вам донесем? [Nema na čemu, uživajte! Mogu li još nešto da vam donesem?] (You are welcome, enjoy! Can I bring you anything else?)"],
      ["рачун|плати", "Наравно! Укупно је 480 динара. Плаћате ли картицом или готовином? [Naravno! Ukupno je 480 dinara. Plaćate li karticom ili gotovinom?] (Sure! Total is 480 dinars. Paying by card or cash?)"]
    ],
    friend: [
      ["добро|супер", "Баш ми је драго! Хоћемо ли у шетњу до Калемегдана касније? [Baš mi je drago! Hoćemo li u šetnju do Kalemegdana kasnije?] (I'm so glad! Want to take a walk to Kalemegdan later?)"],
      ["кафа|кафић", "Идемо у онај кафић у Доситејевој улици, имају феноменалну кафу! [Idemo u onaj kafić u Dositejevoj ulici, imaju fenomenalnu kafu!] (Let's go to that cafe on Dositejeva street, they have amazing coffee!)"],
      ["шта радиш|где си", "Ево ме код куће, спремам се да изађем. Шта ти планираш данас? [Evo me kod kuće, spremam se da izađem. Šta ti planiraš danas?] (Here I am at home getting ready to go out. What are you planning today?)"],
      ["хвала|ћао", "Видимо се ускоро, чујемо се! Ћао! [Vidimo se uskoro, čujemo se! Ćao!] (See you soon, talk to you later! Bye!)"]
    ],
    market: [
      ["јабук", "Јабуке су 120 динара килограм, преслатке су! Колико килограма желиш? [Jabuke su 120 dinara kilogram, preslatke su! Koliko kilograma želiš?] (Apples are 120 dinars a kilo, very sweet! How many kilos do you want?)"],
      ["сир|кајмак", "Овај кајмак је јутрос стигао са Златибора! Пробај мало! [Ovaj kajmak je jutros stigao sa Zlatibora! Probaj malo!] (This kajmak arrived this morning from Zlatibor! Try a little!)"],
      ["пошто|цена|колико", "Све је домаће и свеже! За тебе може и мали попуст ако узмеш два килограма. [Sve je domaće i sveže! Za tebe može i mali popust ako uzmeš dva kilograma.] (Everything is home-grown and fresh! For you, a small discount if you take two kilos.)"]
    ],
    tutor: [
      ["падеж|падежи|case", "Српски језик има 7 падежа: 1. Номинатив (ко? шта?), 2. Генитив (кога? чега?), 3. Датив (коме? чему?), 4. Акузатив (кога? шта?), 5. Вокатив (дозивање: Хеј!), 6. Инструментал (с ким? чиме?), 7. Локатив (о коме? о чему?). Који падеж желиш да вежбамо?"],
      ["азбук|слово|писмо|alphabet", "Српска ћирилица има тачно 30 слова. Правило Вука Караџића је генијално: 'Пиши као што говориш, а читај као што је написано.' Нема тихих слова!"],
      ["бити|verb", "Глагол БИТИ у презенту гласи: ја сам, ти си, он/она/оно је, ми смо, ви сте, они су. На пример: 'Ја сам студент' (I am a student)."]
    ]
  };

  const GENERIC_REPLIES = {
    kafana: "Одлично! Све ће бити спремно за пар минута. Још нешто за вас? [Odlično! Sve će biti spremno za par minuta. Još nešto za vas?] (Great! Everything will be ready in a couple minutes. Anything else for you?)",
    friend: "Супер звучи! Хајде да се видимо око шест сати у центру! [Super zvuči! Hajde da se vidimo oko šest sati u centru!] (Sounds super! Let's meet around 6 o'clock in the center!)",
    market: "Ево, изволи свеже спаковано! Пријатно и дођи нам опет! [Evo, izvoli sveže spakovano! Prijatno i dođi nam opet!] (Here you go, freshly packed! Have a nice day and come again!)",
    tutor: "Одлично вежбаш! Свака реченица коју напишеш на ћирилици гради твоју течност. Настави даље! [Odlično vežbaš! Svaka rečenica koju napišeš na ćirilici gradi tvoju tečnost.] (Great practice! Keep going!)"
  };

  function fallbackTutorReply(scenario, userText) {
    const userLower = userText.toLowerCase();
    const responses = FALLBACK_RESPONSES[scenario] || FALLBACK_RESPONSES.tutor;
    for (const [pattern, reply] of responses) {
      if (new RegExp(pattern).test(userLower)) return reply;
    }
    return GENERIC_REPLIES[scenario] || GENERIC_REPLIES.tutor;
  }

  // -------------------------------------------------------------
  // 3. STORAGE
  // -------------------------------------------------------------
  let db = null;

  function nowIso() {
    return new Date().toISOString();
  }

  function newSrsItem(id, itemType, deckId, cyr, lat, en, hint, soundGuide) {
    return {
      id,
      item_type: itemType,
      deck_id: deckId,
      front_cyr: cyr,
      front_lat: lat,
      back_en: en,
      hint,
      sound_guide: soundGuide,
      ease_factor: 2.5,
      interval_days: 0,
      repetitions: 0,
      lapses: 0,
      mastery_level: 0,
      last_reviewed: null,
      next_due: nowIso(),
      created_at: nowIso()
    };
  }

  function seed() {
    const fresh = { srs_items: {}, mistakes: [], sessions: [], vocab: [], nextMistakeId: 1, nextVocabId: 1 };

    for (const [cyr, lat, sound, grp] of SEED_LETTERS) {
      const id = `letter_${cyr}`;
      fresh.srs_items[id] = newSrsItem(id, "letter", "alphabet", cyr, lat, `Letter ${cyr} (${lat})`, grp, sound);
    }

    for (const [cyr, lat, en, cat, note] of SEED_WORDS) {
      const id = `word_${cyr}`;
      fresh.srs_items[id] = newSrsItem(id, "word", cat, cyr, lat, en, note, cat.charAt(0).toUpperCase() + cat.slice(1));
      fresh.vocab.push({
        id: fresh.nextVocabId++,
        cyr, lat, en,
        category: cat,
        notes: note,
        srs_level: 0,
        is_custom: 0,
        created_at: nowIso()
      });
    }
    return fresh;
  }

  function load() {
    if (db) return db;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) db = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load in-browser database", e);
    }
    if (!db || !db.srs_items) {
      db = seed();
      save();
    }
    return db;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn("Could not save in-browser database", e);
    }
  }

  // YugoStore is a top-level const in app.js, so it is not a window property.
  function rewardXP(amount) {
    if (typeof YugoStore !== "undefined") YugoStore.addXP(amount);
  }

  const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // -------------------------------------------------------------
  // 4. SPACED REPETITION LOGISTICS (backend/logistics.py)
  // -------------------------------------------------------------
  function calculateReview(currentInterval, repetitions, easeFactor, lapses, grade) {
    const now = new Date();
    const DAY = 24 * 60 * 60 * 1000;
    let newEf = easeFactor;
    let newReps, newLapses, newInterval, nextDue, mastery;

    if (grade === 1) { // AGAIN
      newReps = 0;
      newLapses = lapses + 1;
      newEf = Math.max(1.3, easeFactor - 0.20);
      newInterval = 0;
      nextDue = new Date(now.getTime() + 15 * 60 * 1000);
      mastery = 1;
    } else if (grade === 2) { // HARD
      newReps = repetitions + 1;
      newLapses = lapses;
      newEf = Math.max(1.3, easeFactor - 0.15);
      newInterval = currentInterval > 0 ? Math.max(1, Math.trunc(currentInterval * 1.2)) : 1;
      nextDue = new Date(now.getTime() + newInterval * DAY);
      mastery = Math.min(4, Math.max(1, newReps));
    } else if (grade === 3) { // GOOD
      newReps = repetitions + 1;
      newLapses = lapses;
      if (newReps === 1) newInterval = 1;
      else if (newReps === 2) newInterval = 3;
      else newInterval = Math.max(4, Math.trunc(currentInterval * easeFactor));
      nextDue = new Date(now.getTime() + newInterval * DAY);
      mastery = Math.min(5, 2 + newReps);
    } else if (grade === 4) { // EASY
      newReps = repetitions + 1;
      newLapses = lapses;
      newEf = Math.min(3.0, easeFactor + 0.15);
      if (newReps === 1) newInterval = 3;
      else if (newReps === 2) newInterval = 6;
      else newInterval = Math.max(7, Math.trunc(currentInterval * easeFactor * 1.3));
      nextDue = new Date(now.getTime() + newInterval * DAY);
      mastery = Math.min(5, 3 + newReps);
    } else {
      return null;
    }

    return {
      interval_days: newInterval,
      repetitions: newReps,
      ease_factor: Math.round(newEf * 100) / 100,
      lapses: newLapses,
      mastery_level: mastery,
      next_due: nextDue.toISOString(),
      last_reviewed: now.toISOString()
    };
  }

  function getSRSQueue(limit = 25) {
    const items = Object.values(load().srs_items);
    const now = nowIso();

    const due = items
      .filter(c => c.next_due <= now && c.repetitions > 0)
      .sort((a, b) => (b.lapses - a.lapses) || byStr(a.next_due, b.next_due))
      .slice(0, limit);

    const remaining = limit - due.length;
    if (remaining > 0) {
      const fresh = items
        .filter(c => c.repetitions === 0)
        .sort((a, b) => byStr(a.deck_id, b.deck_id) || byStr(a.id, b.id))
        .slice(0, Math.min(remaining, 10));
      due.push(...fresh);
    }

    return { queue: due.map(c => ({ ...c })), count: due.length };
  }

  function submitSRSReview(cardId, grade) {
    const item = load().srs_items[cardId];
    if (!item) return null;

    const res = calculateReview(item.interval_days, item.repetitions, item.ease_factor, item.lapses, grade);
    if (!res) return null;
    Object.assign(item, res);
    save();

    const reward = { 1: 5, 2: 10, 3: 15, 4: 20 }[grade] || 10;
    rewardXP(reward);

    return { status: "ok", card_id: cardId, calculation: res, xp_awarded: reward };
  }

  function getSRSForecast() {
    const items = Object.values(load().srs_items);
    const now = new Date();
    const forecast = [];

    for (let day = 0; day < 7; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
      const start = d.getTime();
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
      const count = items.filter(c => {
        const t = Date.parse(c.next_due);
        return t >= start && t <= end;
      }).length;

      forecast.push({
        day_index: day,
        day_label: day === 0 ? "Today" : day === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
        date: `${d.toLocaleDateString("en-US", { month: "short" })} ${String(d.getDate()).padStart(2, "0")}`,
        due_count: count
      });
    }
    return forecast;
  }

  function getLogisticsPlan() {
    const data = load();
    const items = Object.values(data.srs_items);
    const now = nowIso();

    const dueCount = items.filter(c => c.next_due <= now).length;
    const totalItems = items.length;
    const masteredCount = items.filter(c => c.mastery_level >= 4).length;
    const learningCount = items.filter(c => c.mastery_level > 0 && c.mastery_level < 4).length;
    const unseenCount = totalItems - (masteredCount + learningCount);
    const unresolved = data.mistakes.filter(m => !m.resolved).length;
    const estMinutes = Math.max(3, Math.ceil((dueCount * 12 + unresolved * 30) / 60));

    return {
      due_count: dueCount,
      mastered_count: masteredCount,
      learning_count: learningCount,
      unseen_count: Math.max(0, unseenCount),
      unresolved_mistakes: unresolved,
      est_session_minutes: estMinutes,
      retention_index: totalItems > 0 ? Math.round((masteredCount / totalItems) * 1000) / 10 : 0,
      recommended_focus: (
        unresolved > 4 ? "Conquer your unresolved mistakes in the Mistakes Journal!"
        : dueCount > 0 ? "Clear your Spaced Repetition queue to lock down memory retention!"
        : "Explore new vocabulary or chat with the Belgrade AI Tutor!"
      )
    };
  }

  function getAnalytics() {
    const data = load();
    const sessions = [...data.sessions].sort((a, b) => byStr(b.timestamp, a.timestamp)).slice(0, 30);

    const letterStatus = Object.values(data.srs_items)
      .filter(c => c.item_type === "letter")
      .sort((a, b) => (a.mastery_level - b.mastery_level) || (b.lapses - a.lapses))
      .map(c => ({
        front_cyr: c.front_cyr,
        front_lat: c.front_lat,
        mastery_level: c.mastery_level,
        lapses: c.lapses,
        repetitions: c.repetitions
      }));

    const topWeaknesses = data.mistakes
      .filter(m => !m.resolved)
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 8)
      .map(m => ({
        prompt: m.prompt,
        user_answer: m.user_answer,
        correct_answer: m.correct_answer,
        review_count: m.review_count,
        error_category: m.error_category
      }));

    const total = sessions.length;
    const avgAcc = total > 0 ? sessions.reduce((s, x) => s + x.accuracy_pct, 0) / total : 0;
    const totalMins = Math.floor(sessions.reduce((s, x) => s + x.duration_seconds, 0) / 60);

    return {
      total_sessions: total,
      avg_accuracy_pct: Math.round(avgAcc * 10) / 10,
      total_study_minutes: totalMins,
      letter_status: letterStatus,
      top_weaknesses: topWeaknesses,
      recent_sessions: sessions.slice(0, 10)
    };
  }

  function logSession(mode, durationSeconds, totalItems, correctItems, xpEarned) {
    const data = load();
    const accuracy = totalItems > 0 ? (correctItems / totalItems) * 100 : 0;
    data.sessions.push({
      id: data.sessions.length + 1,
      mode,
      duration_seconds: durationSeconds,
      total_items: totalItems,
      correct_items: correctItems,
      accuracy_pct: Math.round(accuracy * 10) / 10,
      xp_earned: xpEarned,
      timestamp: nowIso()
    });
    save();
  }

  // -------------------------------------------------------------
  // 5. MISTAKE JOURNAL (backend/database.py)
  // -------------------------------------------------------------
  function getMistakes(onlyUnresolved = true) {
    const all = load().mistakes;
    const list = onlyUnresolved
      ? all.filter(m => !m.resolved).sort((a, b) => (b.review_count - a.review_count) || byStr(b.last_failed_at, a.last_failed_at))
      : [...all].sort((a, b) => byStr(b.last_failed_at, a.last_failed_at));
    const mistakes = list.slice(0, 100).map(m => ({ ...m }));
    return { mistakes, count: mistakes.length };
  }

  function logMistake(mode, itemId, prompt, userAns, correctAns, explanation = "", category = "") {
    const data = load();
    const existing = data.mistakes.find(m => m.prompt === prompt && m.correct_answer === correctAns && !m.resolved);

    if (existing) {
      existing.review_count += 1;
      existing.user_answer = userAns;
      existing.last_failed_at = nowIso();
    } else {
      data.mistakes.push({
        id: data.nextMistakeId++,
        mode,
        item_id: itemId || "",
        prompt,
        user_answer: userAns,
        correct_answer: correctAns,
        explanation: explanation || "",
        error_category: category || "",
        resolved: 0,
        review_count: 1,
        last_failed_at: nowIso()
      });
    }
    save();
  }

  function resolveMistake(mistakeId) {
    const m = load().mistakes.find(x => x.id === Number(mistakeId));
    if (m) {
      m.resolved = 1;
      save();
    }
    return { status: "ok", resolved_id: mistakeId };
  }

  // -------------------------------------------------------------
  // 6. VOCABULARY BANK
  // -------------------------------------------------------------
  function getVocab(q = "", category = "all") {
    const needle = (q || "").toLowerCase();
    const vocab = load().vocab
      .filter(v => !category || category === "all" || v.category === category)
      .filter(v => !needle || [v.cyr, v.lat, v.en].some(s => s.toLowerCase().includes(needle)))
      .sort((a, b) => b.id - a.id)
      .slice(0, 150)
      .map(v => ({ ...v }));
    return { vocab, count: vocab.length };
  }

  function addVocab(cyr, lat, en, category = "custom", notes = "") {
    const cleanCyr = (cyr || "").trim() || YugoTranslit.toCyrillic(lat || "");
    const cleanLat = (lat || "").trim() || YugoTranslit.toLatin(cleanCyr);
    const cleanEn = (en || "").trim();
    if (!cleanCyr || !cleanEn) return null;

    const data = load();
    const id = data.nextVocabId++;
    data.vocab.push({
      id,
      cyr: cleanCyr,
      lat: cleanLat,
      en: cleanEn,
      category: category || "custom",
      notes: notes || "",
      srs_level: 0,
      is_custom: 1,
      created_at: nowIso()
    });

    // Also register into SRS for flashcard review
    const srsId = `custom_${id}`;
    if (!data.srs_items[srsId]) {
      data.srs_items[srsId] = newSrsItem(srsId, "custom", "custom", cleanCyr, cleanLat, cleanEn, notes || "", "Custom Vocabulary");
    }
    save();

    rewardXP(15);
    return { status: "ok", id, cyr: cleanCyr, lat: cleanLat };
  }

  function deleteVocab(id) {
    const data = load();
    const numId = Number(id);
    data.vocab = data.vocab.filter(v => v.id !== numId);
    delete data.srs_items[`custom_${numId}`];
    save();
    return { status: "ok" };
  }

  // -------------------------------------------------------------
  // 7. AI TUTOR (built-in engine)
  // -------------------------------------------------------------
  function getScenarios() {
    return JSON.parse(JSON.stringify(SCENARIOS));
  }

  function sendAIChat(scenario, message) {
    const rawReply = fallbackTutorReply(scenario, message);

    const correctionMatch = rawReply.match(/\{Correction:\s*(.*?)\}/);
    const correction = correctionMatch ? correctionMatch[1].trim() : null;
    const displayText = rawReply.replace(/\{Correction:.*?\}/g, "").trim();

    const latMatch = displayText.match(/\[(?:Latin:)?\s*(.*?)\]/);
    const enMatch = displayText.match(/\((?:English:)?\s*(.*?)\)/);

    return {
      reply_raw: rawReply,
      reply_display: displayText,
      latin: latMatch ? latMatch[1].trim() : YugoTranslit.toLatin(displayText),
      english: enMatch ? enMatch[1].trim() : "",
      correction,
      engine: "builtin_nlp"
    };
  }

  function evaluateSentence(sentence) {
    const cleaned = (sentence || "").trim();
    const hasLatin = /[A-Za-z]/.test(cleaned);
    const hasCyrillic = /[А-Яа-яЂђЈјЉљЊњЋћЏџ]/.test(cleaned);
    const mixedScript = hasLatin && hasCyrillic;

    let warning = null;
    if (/\bB\b/.test(cleaned) || /B[aeiou]/.test(cleaned)) {
      warning = "Watch out: Latin 'B' sounds like 'B', but Cyrillic 'В' sounds like 'V'! The true Cyrillic 'B' is 'Б'.";
    } else if (/\bH\b/.test(cleaned) || /H[aeiou]/.test(cleaned)) {
      warning = "Watch out: Latin 'H' looks like Cyrillic 'Н', which sounds like 'N'! Cyrillic for sound 'H' is 'Х'.";
    }

    const words = cleaned.split(/\s+/).filter(Boolean);
    let score = 90;
    if (mixedScript) score -= 20;
    if (words.length >= 3) score += 10;

    return {
      original: cleaned,
      cyrillic: YugoTranslit.toCyrillic(cleaned),
      latin: YugoTranslit.toLatin(cleaned),
      score: Math.min(100, Math.max(50, score)),
      mixed_script: mixedScript,
      warning,
      word_count: words.length,
      feedback: (!mixedScript && !warning)
        ? "Excellent native phonetic composition! Keep using full Cyrillic script."
        : "Good attempt! Pay close attention to avoiding mixing Latin and Cyrillic glyphs."
    };
  }

  function reset() {
    db = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  return {
    getSRSQueue, submitSRSReview, getSRSForecast,
    getLogisticsPlan, getAnalytics, logSession,
    getMistakes, logMistake, resolveMistake,
    getVocab, addVocab, deleteVocab,
    getScenarios, sendAIChat, evaluateSentence,
    reset
  };
})();
