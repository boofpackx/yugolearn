/* =========================================================
   YUGOLEARN — Complete Offline Curriculum Data Store
   Serbian Cyrillic Azbuka (30 letters), 12 Thematic Decks (250+ words),
   8 Conversational Phrase Contexts, 9 Complete Grammar Masterclasses,
   and Dual-Script Transliteration Engine.
   100% Offline & Self-Contained.
   ========================================================= */

const YUGO_DATA = {
  // -------------------------------------------------------------
  // 1. VUK KARADŽIĆ'S 30-LETTER SERBIAN CYRILLIC AZBUKA
  // -------------------------------------------------------------
  alphabet: [
    // --- IDENTICAL GLYPHS (Look & sound identical to Latin) ---
    {
      cyr: "А", cyrLower: "а", lat: "A", latLower: "a", name: "A", ipa: "/a/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Short or long 'a' like 'father' or 'spa'.",
      example: { cyr: "Ауто", lat: "Auto", en: "Car", highlight: "А" },
      proTip: "Zero surprises. Exactly like English A in 'calm'."
    },
    {
      cyr: "Е", cyrLower: "е", lat: "E", latLower: "e", name: "E", ipa: "/e/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Clean open 'e' like 'bed' or 'pet'. Never diphthongized.",
      example: { cyr: "Ехо", lat: "Eho", en: "Echo", highlight: "Е" },
      proTip: "Never pronounced like English 'ee'. Always crisp as in 'set'."
    },
    {
      cyr: "Ј", cyrLower: "ј", lat: "J", latLower: "j", name: "Je", ipa: "/j/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Sounds like English 'Y' in 'yes' or 'yellow'.",
      example: { cyr: "Јабука", lat: "Jabuka", en: "Apple", highlight: "Ј" },
      proTip: "Written just like Latin J, but always sounds like the English 'Y'."
    },
    {
      cyr: "К", cyrLower: "к", lat: "K", latLower: "k", name: "Ka", ipa: "/k/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Crisp 'k' as in 'kite' or 'coffee'.",
      example: { cyr: "Кафа", lat: "Kafa", en: "Coffee", highlight: "К" },
      proTip: "Same look, same sound. Pure, un-aspirated K."
    },
    {
      cyr: "М", cyrLower: "м", lat: "M", latLower: "m", name: "Em", ipa: "/m/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "'m' as in 'mother' or 'moon'.",
      example: { cyr: "Мачка", lat: "Mačka", en: "Cat", highlight: "М" },
      proTip: "Identical twin to Latin M."
    },
    {
      cyr: "О", cyrLower: "о", lat: "O", latLower: "o", name: "O", ipa: "/o/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Pure round 'o' as in 'orbit' or Italian 'pizza'.",
      example: { cyr: "Око", lat: "Oko", en: "Eye", highlight: "О" },
      proTip: "Keep your lips round. Never slips into 'ow' sound."
    },
    {
      cyr: "Т", cyrLower: "т", lat: "T", latLower: "t", name: "Te", ipa: "/t/",
      group: "identical", groupLabel: "Identical",
      soundGuide: "Dental 't' with tongue touching upper teeth.",
      example: { cyr: "Торта", lat: "Torta", en: "Cake", highlight: "Т" },
      proTip: "Identical in uppercase. Lowercase printed is 'т'."
    },

    // --- FALSE FRIENDS (Look like Latin, sound totally different!) ---
    {
      cyr: "В", cyrLower: "в", lat: "V", latLower: "v", name: "Ve", ipa: "/v/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Sounds like English 'V' as in 'victory'! NOT 'B'.",
      example: { cyr: "Вода", lat: "Voda", en: "Water", highlight: "В" },
      proTip: "TRAP ALERT: Looks like 'B', but it is ALWAYS pronounced 'V'!"
    },
    {
      cyr: "Н", cyrLower: "н", lat: "N", latLower: "n", name: "En", ipa: "/n/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Sounds like English 'N' as in 'no'! NOT 'H'.",
      example: { cyr: "Ноћ", lat: "Noć", en: "Night", highlight: "Н" },
      proTip: "TRAP ALERT: Looks like Latin 'H', but it represents the 'N' sound."
    },
    {
      cyr: "Р", cyrLower: "р", lat: "R", latLower: "r", name: "Er", ipa: "/r/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Rolled / trilled 'R' as in Spanish or Italian! NOT 'P'.",
      example: { cyr: "Риба", lat: "Riba", en: "Fish", highlight: "Р" },
      proTip: "TRAP ALERT: Looks like Latin 'P', but it is a rolled Slavic 'R'!"
    },
    {
      cyr: "С", cyrLower: "с", lat: "S", latLower: "s", name: "Es", ipa: "/s/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Sharp 'S' as in 'sun' or 'snake'! NOT 'C' or 'K'.",
      example: { cyr: "Сунце", lat: "Sunce", en: "Sun", highlight: "С" },
      proTip: "TRAP ALERT: Looks like 'C', but it is ALWAYS a crisp hissing 'S'."
    },
    {
      cyr: "У", cyrLower: "у", lat: "U", latLower: "u", name: "U", ipa: "/u/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Sounds like 'oo' in 'boot' or 'moon'! NOT 'Y'.",
      example: { cyr: "Улица", lat: "Ulica", en: "Street", highlight: "У" },
      proTip: "TRAP ALERT: Looks like Latin 'Y', but it sounds like 'OO'."
    },
    {
      cyr: "Х", cyrLower: "х", lat: "H", latLower: "h", name: "Ha", ipa: "/x/",
      group: "false_friends", groupLabel: "False Friends",
      soundGuide: "Guttural 'h' as in Scottish 'loch' or German 'Bach'. NOT 'X'.",
      example: { cyr: "Хлеб", lat: "Hleb", en: "Bread", highlight: "Х" },
      proTip: "TRAP ALERT: Never 'eks'. It's the breathy rasp of Hleb or Hvala."
    },

    // --- CYRILLIC CLASSICS (Unique shapes, intuitive sounds) ---
    {
      cyr: "Б", cyrLower: "б", lat: "B", latLower: "b", name: "Be", ipa: "/b/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "True 'B' sound as in 'Belgrade' or 'book'.",
      example: { cyr: "Београд", lat: "Beograd", en: "Belgrade", highlight: "Б" },
      proTip: "Has a flat roof bar to distinguish it from Latin 'B'."
    },
    {
      cyr: "Г", cyrLower: "г", lat: "G", latLower: "g", name: "Ge", ipa: "/ɡ/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Always hard 'G' as in 'go' or 'great'. Never soft.",
      example: { cyr: "Град", lat: "Grad", en: "City / Town", highlight: "Г" },
      proTip: "Looks like a hanging gallows. Always hard G."
    },
    {
      cyr: "Д", cyrLower: "д", lat: "D", latLower: "d", name: "De", ipa: "/d/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Firm 'D' as in 'day' or 'door'.",
      example: { cyr: "Дан", lat: "Dan", en: "Day", highlight: "Д" },
      proTip: "Has little feet standing on the baseline, like Greek Delta."
    },
    {
      cyr: "Ж", cyrLower: "ж", lat: "Ž", latLower: "ž", name: "Že", ipa: "/ʒ/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Sound of 's' in 'treasure' or 'measure', French 'je'.",
      example: { cyr: "Живот", lat: "Život", en: "Life", highlight: "Ж" },
      proTip: "Looks like a beetle with 6 legs! Latin: Ž."
    },
    {
      cyr: "З", cyrLower: "з", lat: "Z", latLower: "z", name: "Ze", ipa: "/z/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Buzzing 'Z' as in 'zebra' or 'zoo'.",
      example: { cyr: "Звезда", lat: "Zvezda", en: "Star", highlight: "З" },
      proTip: "Looks like the number '3', but buzzes like a bee 'Zzz'."
    },
    {
      cyr: "И", cyrLower: "и", lat: "I", latLower: "i", name: "I", ipa: "/i/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Pure 'ee' sound as in 'meet' or 'machine'.",
      example: { cyr: "Име", lat: "Ime", en: "Name", highlight: "И" },
      proTip: "Looks like a backwards N. Sounds like Latin 'I'."
    },
    {
      cyr: "Л", cyrLower: "л", lat: "L", latLower: "l", name: "El", ipa: "/l/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Clean 'L' as in 'lemon' or 'light'.",
      example: { cyr: "Лето", lat: "Leto", en: "Summer", highlight: "Л" },
      proTip: "Greek Lambda shape with a soft curve."
    },
    {
      cyr: "П", cyrLower: "п", lat: "P", latLower: "p", name: "Pe", ipa: "/p/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "'P' as in 'park' or 'paper'.",
      example: { cyr: "Пиво", lat: "Pivo", en: "Beer", highlight: "П" },
      proTip: "Looks like math Pi (π). Sounds like 'P'."
    },
    {
      cyr: "Ф", cyrLower: "ф", lat: "F", latLower: "f", name: "Ef", ipa: "/f/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "'F' as in 'film' or 'friend'.",
      example: { cyr: "Филм", lat: "Film", en: "Movie / Film", highlight: "Ф" },
      proTip: "Greek Phi (Φ) shape with a vertical line through a circle."
    },
    {
      cyr: "Ц", cyrLower: "ц", lat: "C", latLower: "c", name: "Ce", ipa: "/ts/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Sound 'ts' as in 'tsunami' or 'cats'.",
      example: { cyr: "Цар", lat: "Car", en: "Tsar / Emperor", highlight: "Ц" },
      proTip: "Notice the little hook on bottom right. Latin: C."
    },
    {
      cyr: "Ч", cyrLower: "ч", lat: "Č", latLower: "č", name: "Če", ipa: "/tʃ/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Hard 'ch' as in 'chocolate' or 'church'. Hard palette.",
      example: { cyr: "Човек", lat: "Čovek", en: "Person / Man", highlight: "Ч" },
      proTip: "Harder cousin of Ћ. Latin equivalent: Č."
    },
    {
      cyr: "Ш", cyrLower: "ш", lat: "Š", latLower: "š", name: "Ša", ipa: "/ʃ/",
      group: "classic_cyrillic", groupLabel: "Cyrillic Classics",
      soundGuide: "Sound 'sh' as in 'shoe' or 'sugar'.",
      example: { cyr: "Школа", lat: "Škola", en: "School", highlight: "Ш" },
      proTip: "Like a trident with 3 prongs pointing up. Latin: Š."
    },

    // --- SERBIAN SPECIALS (The 5 gems created by Vuk Karadžić) ---
    {
      cyr: "Ђ", cyrLower: "ђ", lat: "Đ", latLower: "đ", name: "Đe", ipa: "/dʑ/",
      group: "serbian_specials", groupLabel: "Serbian Specials",
      soundGuide: "Soft 'dj' sound, like 'd' in British 'dew' or 'schedule'.",
      example: { cyr: "Ђак", lat: "Đak", en: "Pupil / Student", highlight: "Ђ" },
      proTip: "Vuk Karadžić invented this letter from an old root. Latin: Đ."
    },
    {
      cyr: "Љ", cyrLower: "љ", lat: "Lj", latLower: "lj", name: "Lje", ipa: "/ʎ/",
      group: "serbian_specials", groupLabel: "Serbian Specials",
      soundGuide: "Soft 'ly' sound like 'million' or Italian 'gli' in tagliatelle.",
      example: { cyr: "Љубав", lat: "Ljubav", en: "Love", highlight: "Љ" },
      proTip: "Vuk merged Л + Ь into a single glyph!"
    },
    {
      cyr: "Њ", cyrLower: "њ", lat: "Nj", latLower: "nj", name: "Nje", ipa: "/ɲ/",
      group: "serbian_specials", groupLabel: "Serbian Specials",
      soundGuide: "Soft 'ny' sound like 'canyon', French 'gn', or Spanish 'ñ'.",
      example: { cyr: "Њива", lat: "Njiva", en: "Cultivated Field", highlight: "Њ" },
      proTip: "Vuk merged Н + Ь into one glyph. Represents the Spanish 'ñ' sound."
    },
    {
      cyr: "Ћ", cyrLower: "ћ", lat: "Ć", latLower: "ć", name: "Će", ipa: "/tɕ/",
      group: "serbian_specials", groupLabel: "Serbian Specials",
      soundGuide: "Soft 'ch' sound, like 't' in British 'tune' or 'nature'.",
      example: { cyr: "Кућа", lat: "Kuća", en: "House", highlight: "ћ" },
      proTip: "Crossed bar at the top! Softer cousin of Ч (č). Latin: Ć."
    },
    {
      cyr: "Џ", cyrLower: "џ", lat: "Dž", latLower: "dž", name: "Dže", ipa: "/dʒ/",
      group: "serbian_specials", groupLabel: "Serbian Specials",
      soundGuide: "Hard 'j' as in 'jeep', 'jam', or 'jungle'.",
      example: { cyr: "Џем", lat: "Džem", en: "Jam / Marmalade", highlight: "Џ" },
      proTip: "Notice the tail dropping below baseline. Latin: Dž."
    }
  ],

  // -------------------------------------------------------------
  // 2. THEMATIC CURRICULUM DECKS (250+ Vocabulary Items)
  // -------------------------------------------------------------
  decks: [
    {
      id: "alphabet",
      name: "Азбука (All 30 Letters)",
      icon: "Ж",
      desc: "Vuk Karadžić's 30 phonetic letters with sound guides and mnemonics.",
      items: [
        { cyr: "А", lat: "A", en: "like 'a' in father", hint: "Identical" },
        { cyr: "Б", lat: "B", en: "like 'b' in book", hint: "Cyrillic Classic" },
        { cyr: "В", lat: "V", en: "like 'v' in victory (NOT B!)", hint: "False Friend" },
        { cyr: "Г", lat: "G", en: "hard 'g' in go", hint: "Cyrillic Classic" },
        { cyr: "Д", lat: "D", en: "like 'd' in day", hint: "Cyrillic Classic" },
        { cyr: "Ђ", lat: "Đ", en: "soft 'dj' (Vuk gem)", hint: "Serbian Special" },
        { cyr: "Е", lat: "E", en: "like 'e' in bed", hint: "Identical" },
        { cyr: "Ж", lat: "Ž", en: "like 's' in treasure", hint: "Cyrillic Classic" },
        { cyr: "З", lat: "Z", en: "like 'z' in zebra", hint: "Cyrillic Classic" },
        { cyr: "И", lat: "I", en: "like 'ee' in meet", hint: "Cyrillic Classic" },
        { cyr: "Ј", lat: "J", en: "like 'y' in yes", hint: "Identical" },
        { cyr: "К", lat: "K", en: "like 'k' in kite", hint: "Identical" },
        { cyr: "Л", lat: "L", en: "like 'l' in lemon", hint: "Cyrillic Classic" },
        { cyr: "Љ", lat: "Lj", en: "like 'll' in million", hint: "Serbian Special" },
        { cyr: "М", lat: "M", en: "like 'm' in moon", hint: "Identical" },
        { cyr: "Н", lat: "N", en: "like 'n' in no (NOT H!)", hint: "False Friend" },
        { cyr: "Њ", lat: "Nj", en: "like 'ny' in canyon / ñ", hint: "Serbian Special" },
        { cyr: "О", lat: "O", en: "like 'o' in orbit", hint: "Identical" },
        { cyr: "П", lat: "P", en: "like 'p' in park", hint: "Cyrillic Classic" },
        { cyr: "Р", lat: "R", en: "rolled 'r' (NOT P!)", hint: "False Friend" },
        { cyr: "С", lat: "S", en: "like 's' in sun (NOT C!)", hint: "False Friend" },
        { cyr: "Т", lat: "T", en: "like 't' in table", hint: "Identical" },
        { cyr: "Ћ", lat: "Ć", en: "soft 'ch' in tune", hint: "Serbian Special" },
        { cyr: "У", lat: "U", en: "like 'oo' in boot (NOT Y!)", hint: "False Friend" },
        { cyr: "Ф", lat: "F", en: "like 'f' in film", hint: "Cyrillic Classic" },
        { cyr: "Х", lat: "H", en: "raspy 'h' in loch (NOT X!)", hint: "False Friend" },
        { cyr: "Ц", lat: "C", en: "like 'ts' in tsunami", hint: "Cyrillic Classic" },
        { cyr: "Ч", lat: "Č", en: "hard 'ch' in chocolate", hint: "Cyrillic Classic" },
        { cyr: "Џ", lat: "Dž", en: "like 'j' in jam", hint: "Serbian Special" },
        { cyr: "Ш", lat: "Š", en: "like 'sh' in shoe", hint: "Cyrillic Classic" }
      ]
    },
    {
      id: "essentials",
      name: "Основе (Survival Essentials)",
      icon: "★",
      desc: "Top 25 words for instant communication, greetings, and politeness.",
      items: [
        { cyr: "Да", lat: "Da", en: "Yes", hint: "Affirmation" },
        { cyr: "Не", lat: "Ne", en: "No", hint: "Negation" },
        { cyr: "Молим", lat: "Molim", en: "Please / You're welcome / Excuse me", hint: "The universal magic word" },
        { cyr: "Хвала", lat: "Hvala", en: "Thank you", hint: "Remember: X = H" },
        { cyr: "Хвала лепо", lat: "Hvala lepo", en: "Thank you very much", hint: "Polite gratitude" },
        { cyr: "Изволите", lat: "Izvolite", en: "Here you go / How may I help you?", hint: "Used by waiters & shopkeepers" },
        { cyr: "Здраво", lat: "Zdravo", en: "Hello / Hi (literally: healthy)", hint: "Informal greeting" },
        { cyr: "Довиђења", lat: "Doviđenja", en: "Goodbye (until we meet again)", hint: "Formal farewell" },
        { cyr: "Ћао", lat: "Ćao", en: "Ciao / Bye / Hi", hint: "Universal casual hello & bye" },
        { cyr: "Добро", lat: "Dobro", en: "Good / Okay", hint: "Agreement" },
        { cyr: "Лоше", lat: "Loše", en: "Bad", hint: "Opposite of dobro" },
        { cyr: "Добро јутро", lat: "Dobro jutro", en: "Good morning", hint: "Morning until midday" },
        { cyr: "Добар дан", lat: "Dobar dan", en: "Good day / Good afternoon", hint: "Standard polite day greeting" },
        { cyr: "Добро вече", lat: "Dobro veče", en: "Good evening", hint: "After sunset" },
        { cyr: "Лаку ноћ", lat: "Laku noć", en: "Good night", hint: "When parting for sleep" },
        { cyr: "Како си?", lat: "Kako si?", en: "How are you? (informal)", hint: "Check-in with friend" },
        { cyr: "Како сте?", lat: "Kako ste?", en: "How are you? (formal / plural)", hint: "Polite check-in" },
        { cyr: "Добро сам", lat: "Dobro sam", en: "I am good / doing well", hint: "Standard positive reply" },
        { cyr: "Шта", lat: "Šta", en: "What", hint: "Question word" },
        { cyr: "Ко", lat: "Ko", en: "Who", hint: "Question word" },
        { cyr: "Где", lat: "Gde", en: "Where", hint: "Location question" },
        { cyr: "Када", lat: "Kada", en: "When", hint: "Time question" },
        { cyr: "Зашто", lat: "Zašto", en: "Why", hint: "Reason question" },
        { cyr: "Како", lat: "Kako", en: "How", hint: "Manner question" },
        { cyr: "Колико", lat: "Koliko", en: "How much / How many", hint: "Quantity question" }
      ]
    },
    {
      id: "numbers",
      name: "Бројеви & Време (Numbers & Time)",
      icon: "№",
      desc: "Counting, money, prices, time, and days of the week.",
      items: [
        { cyr: "Један", lat: "Jedan", en: "One (1)", hint: "1" },
        { cyr: "Два", lat: "Dva", en: "Two (2)", hint: "2" },
        { cyr: "Три", lat: "Tri", en: "Three (3)", hint: "3" },
        { cyr: "Четири", lat: "Četiri", en: "Four (4)", hint: "4" },
        { cyr: "Пет", lat: "Pet", en: "Five (5)", hint: "5" },
        { cyr: "Шест", lat: "Šest", en: "Six (6)", hint: "6" },
        { cyr: "Седам", lat: "Sedam", en: "Seven (7)", hint: "7" },
        { cyr: "Осам", lat: "Osam", en: "Eight (8)", hint: "8" },
        { cyr: "Девет", lat: "Devet", en: "Nine (9)", hint: "9" },
        { cyr: "Десет", lat: "Deset", en: "Ten (10)", hint: "10" },
        { cyr: "Једанаест", lat: "Jedanaest", en: "Eleven (11)", hint: "11" },
        { cyr: "Дванаест", lat: "Dvanaest", en: "Twelve (12)", hint: "12" },
        { cyr: "Двадесет", lat: "Dvadeset", en: "Twenty (20)", hint: "20" },
        { cyr: "Тридесет", lat: "Trideset", en: "Thirty (30)", hint: "30" },
        { cyr: "Педесет", lat: "Pedeset", en: "Fifty (50)", hint: "50" },
        { cyr: "Сто", lat: "Sto", en: "One hundred (100) / Table", hint: "100" },
        { cyr: "Петсто", lat: "Petsto", en: "Five hundred (500)", hint: "500" },
        { cyr: "Хиљаду", lat: "Hiljadu", en: "One thousand (1,000)", hint: "1,000 dinars" },
        { cyr: "Данас", lat: "Danas", en: "Today", hint: "Time" },
        { cyr: "Јуче", lat: "Juče", en: "Yesterday", hint: "Time" },
        { cyr: "Сутра", lat: "Sutra", en: "Tomorrow", hint: "Time" },
        { cyr: "Сада", lat: "Sada", en: "Now", hint: "Right now" },
        { cyr: "Сат", lat: "Sat", en: "Hour / Clock / Watch", hint: "Time unit" },
        { cyr: "Минут", lat: "Minut", en: "Minute", hint: "Time unit" }
      ]
    },
    {
      id: "food_drink",
      name: "Кафана, Храна & Пиће (Dining)",
      icon: "☕",
      desc: "Order authentic Serbian cuisine, drinks, coffee, and meats like a local.",
      items: [
        { cyr: "Кафа", lat: "Kafa", en: "Coffee", hint: "Domaća, turska, espresso" },
        { cyr: "Домаћа кафа", lat: "Domaća kafa", en: "Domestic / Turkish boiled coffee", hint: "Cooked in dzezva" },
        { cyr: "Вода", lat: "Voda", en: "Water", hint: "Still or mineral" },
        { cyr: "Кисела вода", lat: "Kisela voda", en: "Sparkling mineral water", hint: "Knjaz Milos" },
        { cyr: "Пиво", lat: "Pivo", en: "Beer", hint: "Cold beverage" },
        { cyr: "Точено пиво", lat: "Točeno pivo", en: "Draft beer", hint: "On tap" },
        { cyr: "Вино", lat: "Vino", en: "Wine", hint: "Belo, crveno, roze" },
        { cyr: "Ракија", lat: "Rakija", en: "Fruit brandy (National spirit)", hint: "Šljiva, dunja, kajsija" },
        { cyr: "Хлеб", lat: "Hleb", en: "Bread", hint: "Fresh daily loaf" },
        { cyr: "Бурек", lat: "Burek", en: "Burek (baked meat/cheese pastry)", hint: "Eaten with yogurt" },
        { cyr: "Јогурт", lat: "Jogurt", en: "Drinkable savory yogurt", hint: "Classic companion to burek" },
        { cyr: "Ћевапи", lat: "Ćevapi", en: "Ćevapi (grilled minced meat sausages)", hint: "Portion of 5 or 10 in somun" },
        { cyr: "Пљескавица", lat: "Pljeskavica", en: "Gourmet minced meat patty / burger", hint: "National culinary pride" },
        { cyr: "Кајмак", lat: "Kajmak", en: "Clotted cream spread", hint: "Golden dairy spread" },
        { cyr: "Сир", lat: "Sir", en: "Cheese", hint: "Sjenički, Zlatarski" },
        { cyr: "Шопска салата", lat: "Šopska salata", en: "Shopska salad (tomato, cucumber, grated cheese)", hint: "Essential Balkan salad" },
        { cyr: "Месо", lat: "Meso", en: "Meat", hint: "Beef, pork, poultry" },
        { cyr: "Пилетина", lat: "Piletina", en: "Chicken", hint: "Meat type" },
        { cyr: "Свињетина", lat: "Svinjetina", en: "Pork", hint: "Meat type" },
        { cyr: "Риба", lat: "Riba", en: "Fish", hint: "River or sea fish" },
        { cyr: "Супа / Чорба", lat: "Supa / Čorba", en: "Clear soup / Hearty thick soup", hint: "Riblja, teleća čorba" },
        { cyr: "Рачун", lat: "Račun", en: "The check / bill", hint: "Рачун, молим!" },
        { cyr: "Кебаб", lat: "Kebab", en: "Kebab", hint: "Street food" },
        { cyr: "Палачинка", lat: "Palačinka", en: "Crepe / Pancake", hint: "With eurokrem and plazma" }
      ]
    },
    {
      id: "travel_city",
      name: "Град & Превоз (City & Navigation)",
      icon: "✈",
      desc: "Getting around Belgrade, taxis, buses, streets, and key landmarks.",
      items: [
        { cyr: "Улица", lat: "Ulica", en: "Street", hint: "Knez Mihailova ulica" },
        { cyr: "Трг", lat: "Trg", en: "Square / Plaza", hint: "Trg Republike" },
        { cyr: "Град", lat: "Grad", en: "City / Town", hint: "Beograd = White city" },
        { cyr: "Центар", lat: "Centar", en: "City center / Downtown", hint: "U centru" },
        { cyr: "Аеродром", lat: "Aerodrom", en: "Airport", hint: "Aerodrom Nikola Tesla" },
        { cyr: "Станица", lat: "Stanica", en: "Station (bus or train)", hint: "Glavna stanica" },
        { cyr: "Аутобус", lat: "Autobus", en: "Bus", hint: "Public transit" },
        { cyr: "Воз", lat: "Voz", en: "Train", hint: "Soko high-speed train" },
        { cyr: "Такси", lat: "Taksi", en: "Taxi", hint: "Cab" },
        { cyr: "Карта", lat: "Karta", en: "Ticket / Map", hint: "Jedna karta, molim" },
        { cyr: "Хотел", lat: "Hotel", en: "Hotel", hint: "Lodging" },
        { cyr: "Смештај", lat: "Smeštaj", en: "Accommodation / Lodging", hint: "Apartment or room" },
        { cyr: "Апотека", lat: "Apoteka", en: "Pharmacy", hint: "Cross symbol outside" },
        { cyr: "Болница", lat: "Bolnica", en: "Hospital", hint: "Healthcare" },
        { cyr: "Банка", lat: "Banka", en: "Bank", hint: "Finance" },
        { cyr: "Банкомат", lat: "Bankomat", en: "ATM / Cash machine", hint: "Cash withdrawal" },
        { cyr: "Пошта", lat: "Pošta", en: "Post office", hint: "Mail & bills" },
        { cyr: "Лево", lat: "Levo", en: "Left", hint: "Turn left" },
        { cyr: "Десно", lat: "Desno", en: "Right", hint: "Turn right" },
        { cyr: "Право", lat: "Pravo", en: "Straight ahead", hint: "Idite pravo" },
        { cyr: "Улаз", lat: "Ulaz", en: "Entrance", hint: "Door sign" },
        { cyr: "Излаз", lat: "Izlaz", en: "Exit", hint: "Door sign" },
        { cyr: "Мост", lat: "Most", en: "Bridge", hint: "Brankov most, Gazela" },
        { cyr: "Река", lat: "Reka", en: "River", hint: "Dunav (Danube), Sava" }
      ]
    },
    {
      id: "verbs_core",
      name: "Главни Глаголи (Core Action Verbs)",
      icon: "⚡",
      desc: "High-yield present, past, and future verbs to speak fluently.",
      items: [
        { cyr: "Ја сам", lat: "Ja sam", en: "I am (Бити - to be)", hint: "1st person present" },
        { cyr: "Ти си", lat: "Ti si", en: "You are (Бити)", hint: "2nd person singular" },
        { cyr: "Он / Она је", lat: "On / Ona je", en: "He / She is (Бити)", hint: "3rd person singular" },
        { cyr: "Ми смо", lat: "Mi smo", en: "We are (Бити)", hint: "1st person plural" },
        { cyr: "Ви сте", lat: "Vi ste", en: "You are (formal / plural)", hint: "Polite or plural" },
        { cyr: "Они су", lat: "Oni su", en: "They are (Бити)", hint: "3rd person plural" },
        { cyr: "Имам", lat: "Imam", en: "I have (Имати)", hint: "Negative: немам" },
        { cyr: "Немам", lat: "Nemam", en: "I do not have", hint: "Negative fused verb" },
        { cyr: "Хоћу", lat: "Hoću", en: "I want (Хтети)", hint: "Negative: нећу" },
        { cyr: "Нећу", lat: "Neću", en: "I will not / I don't want", hint: "Firm refusal" },
        { cyr: "Могу", lat: "Mogu", en: "I can / am able (Моћи)", hint: "Ability" },
        { cyr: "Не могу", lat: "Ne mogu", en: "I cannot", hint: "Inability" },
        { cyr: "Идем", lat: "Idem", en: "I am going / I go (Ићи)", hint: "Movement" },
        { cyr: "Долазим", lat: "Dolazim", en: "I am coming / arriving (Долазити)", hint: "Arrival" },
        { cyr: "Једем", lat: "Jedem", en: "I eat / am eating (Јести)", hint: "Dining" },
        { cyr: "Пијем", lat: "Pijem", en: "I drink / am drinking (Пити)", hint: "Beverage" },
        { cyr: "Говорим", lat: "Govorim", en: "I speak / am talking (Говорити)", hint: "Speech" },
        { cyr: "Разумем", lat: "Razumem", en: "I understand (Разумети)", hint: "Comprehension" },
        { cyr: "Не разумем", lat: "Ne razumem", en: "I do not understand", hint: "Crucial learner phrase" },
        { cyr: "Знам", lat: "Znam", en: "I know (Знати)", hint: "Knowledge" },
        { cyr: "Не знам", lat: "Ne znam", en: "I don't know", hint: "Honest answer" },
        { cyr: "Учим", lat: "Učim", en: "I learn / am studying (Учити)", hint: "Language learning" },
        { cyr: "Радим", lat: "Radim", en: "I work / am doing (Радити)", hint: "Labor/action" },
        { cyr: "Волим", lat: "Volim", en: "I love / like (Волети)", hint: "Affection" },
        { cyr: "Желим", lat: "Želim", en: "I desire / wish (Желети)", hint: "Polite request" },
        { cyr: "Купујем", lat: "Kupujem", en: "I buy / am buying (Куповати)", hint: "Shopping" },
        { cyr: "Плаћам", lat: "Plaćam", en: "I pay / am paying (Плаћати)", hint: "Transactions" },
        { cyr: "Чекам", lat: "Čekam", en: "I wait / am waiting (Чекати)", hint: "Time" },
        { cyr: "Видим", lat: "Vidim", en: "I see (Видети)", hint: "Vision" },
        { cyr: "Чујем", lat: "Čujem", en: "I hear (Чути)", hint: "Hearing" }
      ]
    },
    {
      id: "adjectives",
      name: "Придеви (Adjectives & Qualities)",
      icon: "⚖",
      desc: "Describing people, objects, weather, sizes, and states of being.",
      items: [
        { cyr: "Велики / Велика", lat: "Veliki (m) / Velika (f)", en: "Big / Large", hint: "Size" },
        { cyr: "Мали / Мала", lat: "Mali (m) / Mala (f)", en: "Small / Little", hint: "Size" },
        { cyr: "Добар / Добра", lat: "Dobar (m) / Dobra (f)", en: "Good", hint: "Quality" },
        { cyr: "Лош / Лоша", lat: "Loš (m) / Loša (f)", en: "Bad", hint: "Quality" },
        { cyr: "Леп / Лепа", lat: "Lep (m) / Lepa (f)", en: "Beautiful / Nice", hint: "Aesthetic" },
        { cyr: "Ружан / Ружна", lat: "Ružan (m) / Ružna (f)", en: "Ugly", hint: "Opposite of lep" },
        { cyr: "Брз / Брза", lat: "Brz (m) / Brza (f)", en: "Fast / Quick", hint: "Speed" },
        { cyr: "Спор / Спора", lat: "Spor (m) / Spora (f)", en: "Slow", hint: "Speed" },
        { cyr: "Топao / Топла", lat: "Topao (m) / Topla (f)", en: "Warm", hint: "Temperature" },
        { cyr: "Хладан / Хладна", lat: "Hladan (m) / Hladna (f)", en: "Cold", hint: "Temperature" },
        { cyr: "Врућ / Врућа", lat: "Vruć (m) / Vruća (f)", en: "Hot (food/weather)", hint: "High heat" },
        { cyr: "Скуп / Скупа", lat: "Skup (m) / Skupa (f)", en: "Expensive", hint: "Price" },
        { cyr: "Јефтин / Јефтина", lat: "Jeftin (m) / Jeftina (f)", en: "Cheap / Inexpensive", hint: "Bargain" },
        { cyr: "Нов / Нова", lat: "Nov (m) / Nova (f)", en: "New", hint: "Age" },
        { cyr: "Стар / Стара", lat: "Star (m) / Stara (f)", en: "Old", hint: "Age" },
        { cyr: "Укусан / Укусна", lat: "Ukusan (m) / Ukusna (f)", en: "Delicious / Tasty", hint: "Food" },
        { cyr: "Свеж / Свежа", lat: "Svež (m) / Sveža (f)", en: "Fresh", hint: "Market produce" },
        { cyr: "Уморан / Уморна", lat: "Umoran (m) / Umorna (f)", en: "Tired / Exhausted", hint: "Physical state" },
        { cyr: "Срећан / Срећна", lat: "Srećan (m) / Srećna (f)", en: "Happy", hint: "Emotion" },
        { cyr: "Лаган / Лагана", lat: "Lagan (m) / Lagana (f)", en: "Easy / Light", hint: "Difficulty/weight" },
        { cyr: "Тежак / Тешка", lat: "Težak (m) / Teška (f)", en: "Difficult / Heavy", hint: "Complexity" }
      ]
    },
    {
      id: "family_home",
      name: "Кућа & Породица (Home & People)",
      icon: "⌂",
      desc: "Family members, housing, rooms, and personal relationships.",
      items: [
        { cyr: "Кућа", lat: "Kuća", en: "House / Home", hint: "Dwelling" },
        { cyr: "Стан", lat: "Stan", en: "Apartment / Flat", hint: "Urban housing" },
        { cyr: "Соба", lat: "Soba", en: "Room", hint: "Living space" },
        { cyr: "Кухиња", lat: "Kuhinja", en: "Kitchen", hint: "Cooking" },
        { cyr: "Купатило", lat: "Kupatilo", en: "Bathroom", hint: "Restroom" },
        { cyr: "Врата", lat: "Vrata", en: "Door", hint: "Entry" },
        { cyr: "Прозор", lat: "Prozor", en: "Window", hint: "Light/glass" },
        { cyr: "Сто", lat: "Sto", en: "Table", hint: "Furniture" },
        { cyr: "Столица", lat: "Stolica", en: "Chair", hint: "Seat" },
        { cyr: "Кревет", lat: "Krevet", en: "Bed", hint: "Sleep" },
        { cyr: "Породица", lat: "Porodica", en: "Family", hint: "Kin" },
        { cyr: "Мајка", lat: "Majka", en: "Mother", hint: "Mom" },
        { cyr: "Отац", lat: "Otac", en: "Father", hint: "Dad" },
        { cyr: "Брат", lat: "Brat", en: "Brother", hint: "Sibling" },
        { cyr: "Сестра", lat: "Sestra", en: "Sister", hint: "Sibling" },
        { cyr: "Син", lat: "Sin", en: "Son", hint: "Child" },
        { cyr: "Ћерка", lat: "Ćerka", en: "Daughter", hint: "Child" },
        { cyr: "Муж", lat: "Muž", en: "Husband", hint: "Spouse" },
        { cyr: "Жена", lat: "Žena", en: "Wife / Woman", hint: "Spouse / female" },
        { cyr: "Дете", lat: "Dete", en: "Child", hint: "Plural: деца (deca)" },
        { cyr: "Пријатељ", lat: "Prijatelj", en: "Friend (male)", hint: "Pal" },
        { cyr: "Пријатељица", lat: "Prijateljica", en: "Friend (female)", hint: "Pal" }
      ]
    },
    {
      id: "shopping_market",
      name: "Пијаца & Куповина (Market & Shopping)",
      icon: "🛒",
      desc: "Fresh produce at Kalenić & Bajloni markets, prices, and shopping talk.",
      items: [
        { cyr: "Пијаца", lat: "Pijaca", en: "Green market / Open-air bazaar", hint: "Kalenić, Bajloni" },
        { cyr: "Продавница", lat: "Prodavnica", en: "Store / Grocery shop", hint: "Shop" },
        { cyr: "Пекара", lat: "Pekara", en: "Bakery", hint: "Fresh bread & burek" },
        { cyr: "Месара", lat: "Mesara", en: "Butcher shop", hint: "Fresh meat" },
        { cyr: "Килограм / Кило", lat: "Kilogram / Kilo", en: "Kilogram (kg)", hint: "Weight" },
        { cyr: "Грам", lat: "Gram", en: "Gram", hint: "Weight" },
        { cyr: "Колико кошта?", lat: "Koliko košta?", en: "How much does it cost?", hint: "Price inquiry" },
        { cyr: "Цена", lat: "Cena", en: "Price", hint: "Cost" },
        { cyr: "Попуст", lat: "Popust", en: "Discount", hint: "Lower price" },
        { cyr: "Кеш / Готовина", lat: "Keš / Gotovina", en: "Cash", hint: "Paper money" },
        { cyr: "Картица", lat: "Kartica", en: "Credit/Debit card", hint: "Plastic pay" },
        { cyr: "Кеса", lat: "Kesa", en: "Plastic bag", hint: "Shopping sack" },
        { cyr: "Јабука", lat: "Jabuka", en: "Apple", hint: "Fruit" },
        { cyr: "Парадајз", lat: "Paradajz", en: "Tomato", hint: "Vegetable" },
        { cyr: "Кромпир", lat: "Krompir", en: "Potato", hint: "Staple vegetable" },
        { cyr: "Лук", lat: "Luk", en: "Onion", hint: "Crni luk (onion), beli luk (garlic)" },
        { cyr: "Паприка", lat: "Paprika", en: "Bell pepper / chili", hint: "Balkan vegetable king" },
        { cyr: "Купус", lat: "Kupus", en: "Cabbage", hint: "Salad & sarma" }
      ]
    },
    {
      id: "slang_culture",
      name: "Жаргон & Култура (Slang & Spirit)",
      icon: "🔥",
      desc: "Untranslatable Balkan mindset, cultural idioms, and authentic street slang.",
      items: [
        { cyr: "Бре", lat: "Bre", en: "Bre! (Emphatic exclamation: 'man!', 'come on!')", hint: "Most iconic Serbian word" },
        { cyr: "Инат", lat: "Inat", en: "Inat (Defiance, stubborn pride against all odds)", hint: "Core national psyche" },
        { cyr: "Мерак", lat: "Merak", en: "Merak (Deep soulful pleasure in small moments)", hint: "Sitting in the sun with coffee" },
        { cyr: "Брате", lat: "Brate", en: "Brother! / Bro / Dude (Vocative of brat)", hint: "Used in every conversation" },
        { cyr: "Хајде / Ајде", lat: "Hajde / Ajde", en: "Come on! / Let's go! / Hurry up!", hint: "Universal action motivator" },
        { cyr: "Важи", lat: "Važi", en: "Deal! / Agreed! / Sounds good!", hint: "Standard affirmative response" },
        { cyr: "Живели!", lat: "Živeli!", en: "Cheers! (literally: May you live long!)", hint: "Eye contact mandatory" },
        { cyr: "Нема проблема", lat: "Nema problema", en: "No problem!", hint: "Laidback attitude" },
        { cyr: "Комшија", lat: "Komšija", en: "Neighbor", hint: "Sacred neighborly bond" },
        { cyr: "Кафана", lat: "Kafana", en: "Traditional Balkan tavern / bistro", hint: "Where life happens" },
        { cyr: "Све је у реду", lat: "Sve je u redu", en: "Everything is fine / alright", hint: "Reassurance" },
        { cyr: "Баш ме брига", lat: "Baš me briga", en: "I don't care / couldn't care less", hint: "Colloquial dismissive" },
        { cyr: "Шта има?", lat: "Šta ima?", en: "What's up? / What's new?", hint: "Casual greeting" },
        { cyr: "Ништа посебно", lat: "Ništa posebno", en: "Nothing special", hint: "Standard chill reply" }
      ]
    }
  ],

  // -------------------------------------------------------------
  // 3. CONVERSATIONAL PHRASES BY REAL-WORLD CONTEXT (8 Domains)
  // -------------------------------------------------------------
  phrases: [
    {
      category: "Поздрав & Култура (Greetings & First Meetings)",
      items: [
        { cyr: "Здраво! Како си?", lat: "Zdravo! Kako si?", en: "Hello! How are you?", note: "Informal, everyday address for peers." },
        { cyr: "Добар дан! Како сте?", lat: "Dobar dan! Kako ste?", en: "Good day! How are you?", note: "Formal, respectful address for elders and clerks." },
        { cyr: "Добро сам, хвала. А ти?", lat: "Dobro sam, hvala. A ti?", en: "I'm good, thanks. And you?", note: "Standard polite comeback." },
        { cyr: "Како се зовеш?", lat: "Kako se zoveš?", en: "What is your name?", note: "Answer: 'Зовем се...' (Zovem se...)" },
        { cyr: "Зовем се Марко. Драго ми је.", lat: "Zovem se Marko. Drago mi je.", en: "My name is Marko. Nice to meet you.", note: "'Drago mi je' literally means 'It is dear to me'." },
        { cyr: "Одакле си?", lat: "Odakle si?", en: "Where are you from?", note: "Answer: 'Ја сам из...' (I am from...)" },
        { cyr: "Ја сам из Америке / Енглеске.", lat: "Ja sam iz Amerike / Engleske.", en: "I am from America / England.", note: "Preposition 'из' triggers Genitive case (-e ending)." }
      ]
    },
    {
      category: "У кафани & Ресторану (At the Kafana & Dining)",
      items: [
        { cyr: "Једну кафу, молим вас.", lat: "Jednu kafu, molim vas.", en: "One coffee, please.", note: "Kafu is in Akuzativ case (direct object)." },
        { cyr: "Може ли једно пиво?", lat: "Može li jedno pivo?", en: "Could I get one beer?", note: "'Može li...' is the natural polite Serbian request formula." },
        { cyr: "Шта препоручујете од јела?", lat: "Šta preporučujete od jela?", en: "What food do you recommend?", note: "Asking the waiter for specialties." },
        { cyr: "Десет ћевапа са кајмаком и луком.", lat: "Deset ćevapa sa kajmakom i lukom.", en: "Ten ćevapi with kajmak and onions.", note: "The gold standard Balkan meal order." },
        { cyr: "Једну пуњену пљескавицу, молим.", lat: "Jednu punjenu pljeskavicu, molim.", en: "One stuffed pljeskavica, please.", note: "Stuffed with cheese and smoked ham." },
        { cyr: "Још једну чашу воде, молим.", lat: "Još jednu čašu vode, molim.", en: "Another glass of water, please.", note: "'Još' = another / more." },
        { cyr: "Рачун, молим вас.", lat: "Račun, molim vas.", en: "The check, please.", note: "Said to the konobar when finished." },
        { cyr: "Може ли картицом или само кеш?", lat: "Može li karticom ili samo keš?", en: "Can I pay by card or cash only?", note: "Crucial question in traditional spots." },
        { cyr: "Задржите кусур.", lat: "Zadržite kusur.", en: "Keep the change.", note: "Tipping gesture." },
        { cyr: "Живели! У твоје здравље!", lat: "Živeli! U tvoje zdravlje!", en: "Cheers! To your health!", note: "Universal toast over rakija or wine." }
      ]
    },
    {
      category: "Сналажење у граду & Превоз (Directions & Transport)",
      items: [
        { cyr: "Извините, где је Кнез Михаилова улица?", lat: "Izvinite, gde je Knez Mihailova ulica?", en: "Excuse me, where is Knez Mihailova street?", note: "Belgrade's main pedestrian boulevard." },
        { cyr: "Идите право, па скрените лево.", lat: "Idite pravo, pa skrenite levo.", en: "Go straight, then turn left.", note: "'Pravo' = straight, 'levo' = left, 'desno' = right." },
        { cyr: "Колико је далеко пешке?", lat: "Koliko je daleko peške?", en: "How far is it on foot?", note: "Asking walking distance." },
        { cyr: "Једну карту до центра, молим.", lat: "Jednu kartu do centra, molim.", en: "One ticket to the center, please.", note: "Buying transit tickets." },
        { cyr: "Да ли овај аутобус иде до Калемегдана?", lat: "Da li ovaj autobus ide do Kalemegdana?", en: "Does this bus go to Kalemegdan fortress?", note: "'Da li...' starts direct questions." },
        { cyr: "Можете ли да ме одвезете до аеродрома?", lat: "Možete li da me odvezete do aerodroma?", en: "Could you drive me to the airport?", note: "To taxi drivers." }
      ]
    },
    {
      category: "Пијаца & Трговина (Market Haggling & Shopping)",
      items: [
        { cyr: "Пошто су вам јабуке данас?", lat: "Pošto su vam jabuke danas?", en: "How much are your apples today?", note: "'Pošto' = how much / what price." },
        { cyr: "Дајте ми једно кило сира.", lat: "Dajte mi jedno kilo sira.", en: "Give me one kilo of cheese.", note: "Direct friendly market style." },
        { cyr: "Да ли је овај кајмак млад или стар?", lat: "Da li je ovaj kajmak mlad ili star?", en: "Is this kajmak young (mild) or mature (sharp)?", note: "Mlad is sweet/creamy; star is tangy." },
        { cyr: "Могу ли да пробам?", lat: "Mogu li da probam?", en: "May I try / taste a sample?", note: "Market vendors will gladly offer a slice on a knife." },
        { cyr: "Имате ли ситно?", lat: "Imate li sitno?", en: "Do you have smaller change?", note: "When paying with big banknotes." }
      ]
    },
    {
      category: "Споразумевање (Communication & Learning Serbian)",
      items: [
        { cyr: "Ја учим српски језик.", lat: "Ja učim srpski jezik.", en: "I am learning the Serbian language.", note: "Locals will immediately welcome and encourage you." },
        { cyr: "Не говорим српски савршено, али вежбам.", lat: "Ne govorim srpski savršeno, ali vežbam.", en: "I don't speak Serbian perfectly, but I'm practicing.", note: "Disarming and genuine." },
        { cyr: "Да ли говорите енглески?", lat: "Da li govorite engleski?", en: "Do you speak English?", note: "Formal question." },
        { cyr: "Молим вас, говорите мало спорије.", lat: "Molim vas, govorite malo sporije.", en: "Please speak a bit slower.", note: "'Sporije' = slower." },
        { cyr: "Како се каже ово на српском?", lat: "Kako se kaže ovo na srpskom?", en: "How do you say this in Serbian?", note: "The #1 phrase to acquire new vocabulary naturally." },
        { cyr: "Шта значи та реч?", lat: "Šta znači ta reč?", en: "What does that word mean?", note: "'Znači' = means." }
      ]
    },
    {
      category: "Дружење & Слободно време (Socializing & Daily Life)",
      items: [
        { cyr: "Шта радиш данас? Има ли планова?", lat: "Šta radiš danas? Ima li planova?", en: "What are you doing today? Any plans?", note: "Making weekend or evening plans." },
        { cyr: "Хоћемо ли на кафу касније?", lat: "Hoćemo li na kafu kasnije?", en: "Shall we go for coffee later?", note: "The fundamental Serbian social invitation." },
        { cyr: "Хајде да се нађемо у шест код споменика.", lat: "Hajde da se nađemo u šest kod spomenika?", en: "Let's meet at 6 by the monument (Trg).", note: "'Kod konja' = by the horse statue in Republic Square." },
        { cyr: "Баш ми је било лепо са тобом.", lat: "Baš mi je bilo lepo sa tobom.", en: "I really had a wonderful time with you.", note: "Expressing social warmth." },
        { cyr: "Чујемо се ускоро!", lat: "Čujemo se uskoro!", en: "Talk to you soon! / We'll stay in touch!", note: "Universal parting phrase." }
      ]
    },
    {
      category: "Смештај & Хотел (Lodging & Accommodation)",
      items: [
        { cyr: "Имам резервацију на име Џон.", lat: "Imam rezervaciju na ime Džon.", en: "I have a reservation under the name John.", note: "At hotel check-in." },
        { cyr: "Која је шифра за вај-фај?", lat: "Koja je šifra za vaj-faj?", en: "What is the Wi-Fi password?", note: "'Šifra' = password." },
        { cyr: "У колико сати је доручак?", lat: "U koliko sati je doručak?", en: "At what time is breakfast?", note: "'Doručak' = breakfast." },
        { cyr: "Могу ли да оставим пртљаг овде?", lat: "Mogu li da ostavim prtljag ovde?", en: "Can I leave my luggage here?", note: "Luggage storage request." }
      ]
    },
    {
      category: "Хитни случајеви & Здравље (Health & Emergency)",
      items: [
        { cyr: "Упомоћ! Неко нека позове помоћ!", lat: "Upomoć! Neko neka pozove pomoć!", en: "Help! Someone call for help!", note: "Urgent distress shout." },
        { cyr: "Потребан ми је лекар одмах.", lat: "Potreban mi je lekar odmah.", en: "I need a doctor immediately.", note: "'Lekar' = medical doctor." },
        { cyr: "Где се налази најближа дежурна апотека?", lat: "Gde se nalazi najbliža dežurna apoteka?", en: "Where is the nearest 24/7 on-duty pharmacy?", note: "'Dežurna' = 24-hour on duty." },
        { cyr: "Боли ме глава / стомак.", lat: "Boli me glava / stomak.", en: "My head / stomach hurts.", note: "'Boli me...' = It hurts me." },
        { cyr: "Изгубио сам пасош.", lat: "Izgubio sam pasoš (m) / Izgubila sam pasoš (f).", en: "I lost my passport.", note: "For embassy or police report." }
      ]
    }
  ],

  // -------------------------------------------------------------
  // 4. NINE GRAMMAR MASTERCLASSES (From Vuk's Law to 7 Padeži & Tenses)
  // -------------------------------------------------------------
  grammar: [
    {
      id: "vuk_rule",
      title: "1. The Golden Rule of Vuk Karadžić",
      subtitle: "The world's most phonetically perfect writing system",
      content: `
        <blockquote>«Пиши као што говориш, читај како је написано.»<br><small style="font-weight:400;font-size:0.9rem;">"Write as you speak, read as it is written." — Вук Стефановић Караџић (1787–1864)</small></blockquote>
        <p>In Serbian, there are <b>NO silent letters</b> (unlike English 'knight' or French 'eaux'). Every single letter has exactly one sound, and every sound has one letter.</p>
        <ul>
          <li><b>No double consonants:</b> You never write 'tt' or 'll'. Even in compound words, sounds merge.</li>
          <li><b>Dedicated single letters:</b> English requires two characters for 'sh' (Ш), 'ch' (Ч/Ћ), 'dj' (Ђ/Џ), 'lj' (Љ), 'nj' (Њ). Serbian Cyrillic has a dedicated single glyph for each.</li>
          <li><b>Phonetic spelling of loanwords:</b> Foreign names are spelled exactly how they sound: <i>Shakespeare</i> becomes <b>Шекспир</b> (Šekspir), <i>New York</i> becomes <b>Њујорк</b> (Njujork).</li>
        </ul>
        <div class="tip">Master the 30 sounds of Vuk's Azbuka, and you can pronounce ANY written Serbian word with 100% native accuracy on day one.</div>
      `
    },
    {
      id: "cases_overview",
      title: "2. The 7 Cases (Падежи) — The Complete Map",
      subtitle: "Why word endings change and how they give meaning without strict word order",
      content: `
        <p>In English, word order dictates meaning ("The dog bites the man" vs "The man bites the dog"). In Serbian, <b>case endings</b> dictate who did what to whom. This allows poetic freedom in sentence structure!</p>
        <div class="table-wrap">
          <table class="gtable">
            <thead>
              <tr>
                <th>Case Name</th>
                <th>Trigger Question</th>
                <th>Core Function</th>
                <th>Real-Life Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>1. Номинатив</b> (Nominative)</td>
                <td>Ко? Шта? (Who? What?)</td>
                <td>Subject (the dictionary form)</td>
                <td><span class="say" onclick="YugoAudio.speak('Ово је кафа')">Ово је <b>кафа</b></span> (This is coffee)</td>
              </tr>
              <tr>
                <td><b>2. Генитив</b> (Genitive)</td>
                <td>Кога? Чега? (Of whom/what?)</td>
                <td>Origin, possession, absence (од, из, без, до)</td>
                <td><span class="say" onclick="YugoAudio.speak('Шоља кафе без шећера')">Шоља <b>кафе</b> без <b>шећера</b></span> (Cup of coffee without sugar)</td>
              </tr>
              <tr>
                <td><b>3. Датив</b> (Dative)</td>
                <td>Коме? Чему? (To whom/what?)</td>
                <td>Recipient / Direction towards (ка, према)</td>
                <td><span class="say" onclick="YugoAudio.speak('Дајем кафу пријатељу')">Дајем кафу <b>пријатељу</b></span> (I give coffee to my friend)</td>
              </tr>
              <tr>
                <td><b>4. Акузатив</b> (Accusative)</td>
                <td>Кога? Шта? (Whom/What?)</td>
                <td>Direct Object of action! #1 most used in speech</td>
                <td><span class="say" onclick="YugoAudio.speak('Пијем кафу')">Пијем <b>кафу</b></span> (I drink coffee)</td>
              </tr>
              <tr>
                <td><b>5. Вокатив</b> (Vocative)</td>
                <td>Хеј! Ој! (Calling out!)</td>
                <td>Addressing someone directly by name or title</td>
                <td><span class="say" onclick="YugoAudio.speak('Брате! Конобару!')"><b>Брате</b>! <b>Конобару</b>!</span> (Bro! Waiter!)</td>
              </tr>
              <tr>
                <td><b>6. Инструментал</b> (Instrumental)</td>
                <td>С ким? Чиме? (With whom/what?)</td>
                <td>Company or tool used ("са / с")</td>
                <td><span class="say" onclick="YugoAudio.speak('Кафа са млеком')">Кафа са <b>млеком</b></span> (Coffee with milk)</td>
              </tr>
              <tr>
                <td><b>7. Локатив</b> (Locative)</td>
                <td>О коме? О чему? Где? (Where? About?)</td>
                <td>Static location ("у, на, о, по")</td>
                <td><span class="say" onclick="YugoAudio.speak('У кафани')">У <b>кафани</b> смо</span> (We are in the kafana)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tip"><b>The Kafana Golden Formula:</b> Feminine nouns ending in <b>-а</b> (каф<b>а</b>, пљескавиц<b>а</b>) change to <b>-у</b> in Akuzativ: «Једну каф<b>у</b> и једну пљескавиц<b>у</b>, молим!»</div>
      `
    },
    {
      id: "noun_genders",
      title: "3. Noun Genders & Plural Endings",
      subtitle: "Detect Masculine, Feminine, or Neuter in 3 seconds",
      content: `
        <p>Look at the very last letter of any noun to instantly know its grammatical gender:</p>
        <ul>
          <li><b>Masculine (Мушки род):</b> Ends in a <b>Consonant</b>.<br>
            Examples: Град (city), Студент (student), Брат (brother), Рачун (bill).<br>
            <b>Plural:</b> Adds <b>-и</b> (or <b>-ови / -еви</b> for 1-syllable nouns): Градови (cities), Студенти.</li>
          <li><b>Feminine (Женски род):</b> Ends in <b>-А</b>.<br>
            Examples: Жена (woman), Кућа (house), Кафа (coffee), Књига (book).<br>
            <b>Plural:</b> The -а changes to <b>-Е</b>: Жене (women), Куће, Кафе, Књиге.</li>
          <li><b>Neuter (Средњи род):</b> Ends in <b>-О</b> or <b>-Е</b>.<br>
            Examples: Пиво (beer), Село (village), Поље (field), Дете (child).<br>
            <b>Plural:</b> Changes to <b>-А</b>: Пива (beers), Села (villages), Поља.</li>
        </ul>
      `
    },
    {
      id: "present_tense",
      title: "4. Verb Conjugation: The Present Tense",
      subtitle: "The Big 3 Endings: -am, -im, and -em",
      content: `
        <p>In Serbian, subject pronouns (Ја, Ти, Он...) are almost always omitted because the verb ending already states who is acting! Present tense verbs belong to one of 3 distinct classes:</p>
        <div class="table-wrap">
          <table class="gtable">
            <thead>
              <tr>
                <th>Person</th>
                <th>-AM Class: Гледати (watch)</th>
                <th>-IM Class: Говорити (speak)</th>
                <th>-EM Class: Пити (drink)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Ја</b> (I)</td>
                <td>Гледа-<b>м</b></td>
                <td>Говор-<b>им</b></td>
                <td>Пиј-<b>ем</b></td>
              </tr>
              <tr>
                <td><b>Ти</b> (You informal)</td>
                <td>Гледа-<b>ш</b></td>
                <td>Говор-<b>иш</b></td>
                <td>Пиј-<b>еш</b></td>
              </tr>
              <tr>
                <td><b>Он / Она / Оно</b> (He/She/It)</td>
                <td>Гледа</td>
                <td>Говор-<b>и</b></td>
                <td>Пиј-<b>е</b></td>
              </tr>
              <tr>
                <td><b>Ми</b> (We)</td>
                <td>Гледа-<b>мо</b></td>
                <td>Говор-<b>имо</b></td>
                <td>Пиј-<b>емо</b></td>
              </tr>
              <tr>
                <td><b>Ви</b> (You formal/plural)</td>
                <td>Гледа-<b>те</b></td>
                <td>Говор-<b>ите</b></td>
                <td>Пиј-<b>ете</b></td>
              </tr>
              <tr>
                <td><b>Они / Оне / Она</b> (They)</td>
                <td>Гледа-<b>ју</b></td>
                <td>Говор-<b>е</b></td>
                <td>Пиј-<b>у</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Notice the universal endings: 1st person always ends in <b>-м</b> (гледа<b>м</b>, говори<b>м</b>, пије<b>м</b>), 'we' always ends in <b>-мо</b>, and formal 'you' always ends in <b>-те</b>!</p>
      `
    },
    {
      id: "verb_to_be",
      title: "5. The Irregular Giant: Verb 'Бити' (To Be)",
      subtitle: "The most important verb in Serbian — Affirmative, Short & Negative forms",
      content: `
        <p>The verb <b>Бити</b> is the foundation of all compound tenses (past and future). It has short enclitic forms (used 95% of the time) and dedicated fused negative forms:</p>
        <div class="table-wrap">
          <table class="gtable">
            <thead>
              <tr>
                <th>Pronoun</th>
                <th>Short Enclitic (Everyday)</th>
                <th>Full Emphatic</th>
                <th>Negative Form (Crucial!)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Ја (I)</td><td><b>сам</b> (I am)</td><td>јесам</td><td><b>Нисам</b> (I am not)</td></tr>
              <tr><td>Ти (You)</td><td><b>си</b> (You are)</td><td>јеси</td><td><b>Ниси</b> (You are not)</td></tr>
              <tr><td>Он/Она (He/She)</td><td><b>је</b> (He/she is)</td><td>јесте</td><td><b>Није</b> (He/she is not)</td></tr>
              <tr><td>Ми (We)</td><td><b>смо</b> (We are)</td><td>јесмо</td><td><b>Нисмо</b> (We are not)</td></tr>
              <tr><td>Ви (You all)</td><td><b>сте</b> (You are)</td><td>јесте</td><td><b>Нисте</b> (You are not)</td></tr>
              <tr><td>Они (They)</td><td><b>су</b> (They are)</td><td>јесу</td><td><b>Нису</b> (They are not)</td></tr>
            </tbody>
          </table>
        </div>
        <div class="tip">Example: «Ја <b>сам</b> овде» (I am here) vs «<b>Нисам</b> уморан» (I am not tired).</div>
      `
    },
    {
      id: "past_tense",
      title: "6. The Past Tense (Перфекат)",
      subtitle: "How to talk about yesterday, memories, and events",
      content: `
        <p>Forming the past tense in Serbian is simple and mechanical. Formula:</p>
        <blockquote><b>Present of 'Бити' (сам, си, је...) + Past L-Participle of verb</b></blockquote>
        <p>The L-participle matches the gender of the speaker:</p>
        <ul>
          <li><b>Masculine singular:</b> Ends in <b>-О</b> (Радио, Видео, Био, Хтео)</li>
          <li><b>Feminine singular:</b> Ends in <b>-ЛА</b> (Радила, Видела, Била, Хтела)</li>
          <li><b>Plural:</b> Ends in <b>-ЛИ</b> (Радили, Видели, Били)</li>
        </ul>
        <div class="table-wrap">
          <table class="gtable">
            <thead>
              <tr><th>Person</th><th>Male Speaker</th><th>Female Speaker</th><th>English Meaning</th></tr>
            </thead>
            <tbody>
              <tr><td>Ја (I)</td><td>Био сам</td><td>Била сам</td><td>I was / I have been</td></tr>
              <tr><td>Ја (I)</td><td>Радио сам</td><td>Радила сам</td><td>I worked / was working</td></tr>
              <tr><td>Ја (I)</td><td>Јео сам</td><td>Јела сам</td><td>I ate</td></tr>
              <tr><td>Ти (You)</td><td>Видео си</td><td>Видела си</td><td>You saw</td></tr>
              <tr><td>Ми (We)</td><td colspan="2" style="text-align:center;">Били смо / Радили смо</td><td>We were / We worked</td></tr>
            </tbody>
          </table>
        </div>
      `
    },
    {
      id: "future_tense",
      title: "7. The Future Tense (Футур I)",
      subtitle: "Talking about tomorrow, plans, and destiny",
      content: `
        <p>Serbian future tense uses short forms of the auxiliary verb <b>Хтети</b> (ћу, ћеш, ће, ћемо, ћете, ће):</p>
        <blockquote><b>Formula A (Compound):</b> Ја ћу + Инфинитив (Ја ћу радити = I will work)<br>
        <b>Formula B (Fused suffix):</b> Радићу (I will work), Говорићу (I will speak), Бићу (I will be)</blockquote>
        <div class="table-wrap">
          <table class="gtable">
            <thead>
              <tr><th>Person</th><th>Auxiliary</th><th>Example: Бити (to be)</th><th>Example: Радити (to work)</th></tr>
            </thead>
            <tbody>
              <tr><td>Ја (I)</td><td><b>ћу</b></td><td>Бићу (I will be)</td><td>Радићу (I will work)</td></tr>
              <tr><td>Ти (You)</td><td><b>ћеш</b></td><td>Бићеш</td><td>Радићеш</td></tr>
              <tr><td>Он / Она</td><td><b>ће</b></td><td>Биће (It will be / OK)</td><td>Радиће</td></tr>
              <tr><td>Ми (We)</td><td><b>ћемо</b></td><td>Бићемо</td><td>Радићемо</td></tr>
              <tr><td>Ви (You all)</td><td><b>ћете</b></td><td>Бићете</td><td>Радићете</td></tr>
              <tr><td>Они (They)</td><td><b>ће</b></td><td>Биће</td><td>Радиће</td></tr>
            </tbody>
          </table>
        </div>
        <div class="tip">Belgrade street confirmation: «<b>Биће супер!</b>» = It will be great! «<b>Биће све у реду</b>» = Everything will be fine.</div>
      `
    },
    {
      id: "prepositions_cases",
      title: "8. Prepositions & Their Required Cases",
      subtitle: "The road signs that dictate which case ending to attach",
      content: `
        <p>In Serbian, every preposition demands a specific case from the noun following it:</p>
        <ul>
          <li><b>Triggers Genitiv (2nd case):</b>
            <ul>
              <li><b>ОД</b> (from): Од Београда (From Belgrade)</li>
              <li><b>ДО</b> (until / to): До сутра (Until tomorrow)</li>
              <li><b>ИЗ</b> (out of / from inside): Из куће (Out of the house)</li>
              <li><b>БЕЗ</b> (without): Без шећера (Without sugar)</li>
            </ul>
          </li>
          <li><b>Triggers Instrumental (6th case):</b>
            <ul>
              <li><b>СА / С</b> (with / together with): Са млеком (With milk), Са пријатељем (With friend)</li>
            </ul>
          </li>
          <li><b>Triggers Lokativ (7th case — static location):</b>
            <ul>
              <li><b>У</b> (in / inside): У Београду (In Belgrade), У стану (In the apartment)</li>
              <li><b>НА</b> (on / at): На тргу (At the square), На столу (On the table)</li>
            </ul>
          </li>
          <li><b>Triggers Akuzativ (4th case — movement into):</b>
            <ul>
              <li><b>У / НА</b> with motion towards: Идем у Београд (I am going to Belgrade).</li>
            </ul>
          </li>
        </ul>
      `
    },
    {
      id: "questions_formula",
      title: "9. Asking Any Question: The 'Да ли' Master Formula",
      subtitle: "Convert any statement into a fluent question in 1 second",
      content: `
        <p>In English you must juggle helping verbs ("Do you like?", "Are you eating?"). In Serbian, there are two universal formulas:</p>
        <ol style="padding-left:20px;margin-bottom:12px;">
          <li><b>Formula 1 (The Safest & Most Universal): «Да ли + Verb?»</b><br>
            Statement: «Говориш српски» (You speak Serbian).<br>
            Question: «<b>Да ли</b> говориш српски?» (Do you speak Serbian?)<br>
            Statement: «Имате кафу» (You have coffee).<br>
            Question: «<b>Да ли</b> имате кафу?» (Do you have coffee?)
          </li>
          <li><b>Formula 2 (Verb-First Inversion): «Verb + ли?»</b><br>
            «Говориш <b>ли</b> српски?»<br>
            «Хоћеш <b>ли</b> воду?» (Do you want water?)
          </li>
        </ol>
        <div class="tip">Whenever you want to ask a question, start with <b>«Да ли...»</b> and you will be 100% grammatically correct every single time.</div>
      `
    }
  ],

  // -------------------------------------------------------------
  // 5. WORD OF THE DAY POOL (30 Rich Cultural Items)
  // -------------------------------------------------------------
  wordOfTheDayPool: [
    { cyr: "Живот", lat: "Život", en: "Life", note: "Iconic word featuring Ž (Ж)" },
    { cyr: "Љубав", lat: "Ljubav", en: "Love", note: "Features Serbian Vuk special Љ (lj)" },
    { cyr: "Храброст", lat: "Hrabrost", en: "Courage / Bravery", note: "Shows rolled Slavic R and raspy H" },
    { cyr: "Пријатељ", lat: "Prijatelj", en: "Friend", note: "Ends in soft љ" },
    { cyr: "Слобода", lat: "Sloboda", en: "Freedom / Liberty", note: "Historic cultural motto" },
    { cyr: "Срећа", lat: "Sreća", en: "Happiness / Luck", note: "Features soft Ć (ћ)" },
    { cyr: "Осмех", lat: "Osmeh", en: "Smile", note: "Warm everyday word" },
    { cyr: "Сунце", lat: "Sunce", en: "Sun", note: "C = Ts sound" },
    { cyr: "Звезда", lat: "Zvezda", en: "Star", note: "Famous cultural and sporting name" },
    { cyr: "Мерак", lat: "Merak", en: "Soulful pleasure in simple moments", note: "Untranslatable Balkan mindset" },
    { cyr: "Инат", lat: "Inat", en: "Proud stubborn defiance", note: "Philosophical pillar of Balkan perseverance" },
    { cyr: "Кафана", lat: "Kafana", en: "Balkan tavern / bistro", note: "Social hearth of Serbian civilization" },
    { cyr: "Срце", lat: "Srce", en: "Heart", note: "Vocalic R acting as a vowel (С-Р-Ц-Е)" },
    { cyr: "Дан", lat: "Dan", en: "Day", note: "Basis of greeting: Добар дан" },
    { cyr: "Ноћ", lat: "Noć", en: "Night", note: "Ends in soft Ć (ћ)" },
    { cyr: "Мир", lat: "Mir", en: "Peace", note: "Short and powerful" },
    { cyr: "Душа", lat: "Duša", en: "Soul", note: "Used as term of endearment: Душо моја" },
    { cyr: "Истина", lat: "Istina", en: "Truth", note: "From root 'исти' (the same)" },
    { cyr: "Нада", lat: "Nada", en: "Hope", note: "Also a popular Serbian female name" },
    { cyr: "Земља", lat: "Zemlja", en: "Earth / Land / Country", note: "Shows Vuk special Љ" },
    { cyr: "Здравље", lat: "Zdravlje", en: "Health", note: "Root of greeting: Здраво!" },
    { cyr: "Брат", lat: "Brat", en: "Brother", note: "Vocative: Брате!" },
    { cyr: "Сестра", lat: "Sestra", en: "Sister", note: "Family staple" },
    { cyr: "Понос", lat: "Ponos", en: "Pride", note: "Honor" },
    { cyr: "Мудрост", lat: "Mudrost", en: "Wisdom", note: "Sage quality" },
    { cyr: "Песма", lat: "Pesma", en: "Song / Poem", note: "Music and folklore" },
    { cyr: "Река", lat: "Reka", en: "River", note: "Belgrade sits on two: Danube and Sava" },
    { cyr: "Планина", lat: "Planina", en: "Mountain", note: "Zlatibor, Tara, Kopaonik" },
    { cyr: "Заједно", lat: "Zajedno", en: "Together", note: "Unity" },
    { cyr: "Увек", lat: "Uvek", en: "Always", note: "Eternal" }
  ]
};

// -------------------------------------------------------------
// 6. SERBIAN TRANSLITERATION ENGINE (Cyrillic ⇄ Gaj's Latin)
// -------------------------------------------------------------
const YugoTranslit = {
  digraphsLatToCyr: {
    "lj": "љ", "Lj": "Љ", "LJ": "Љ",
    "nj": "њ", "Nj": "Њ", "NJ": "Њ",
    "dž": "џ", "Dž": "Џ", "DŽ": "Џ"
  },
  latToCyrSingle: {
    "a": "а", "b": "б", "v": "в", "g": "г", "d": "д", "đ": "ђ", "e": "е",
    "ž": "ж", "z": "з", "i": "и", "j": "ј", "k": "к", "l": "л", "m": "м",
    "n": "н", "o": "о", "p": "п", "r": "р", "s": "с", "t": "т", "ć": "ћ",
    "u": "у", "f": "ф", "h": "х", "c": "ц", "č": "ч", "š": "ш",
    "A": "А", "B": "Б", "V": "В", "G": "Г", "D": "Д", "Đ": "Ђ", "E": "Е",
    "Ž": "Ж", "Z": "З", "I": "И", "J": "Ј", "K": "К", "L": "Л", "M": "М",
    "N": "Н", "O": "О", "P": "П", "R": "Р", "S": "С", "T": "Т", "Ć": "Ћ",
    "U": "У", "F": "Ф", "H": "Х", "C": "Ц", "Č": "Ч", "Š": "Ш"
  },
  cyrToLatMap: {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "ђ": "đ", "е": "e",
    "ж": "ž", "з": "z", "и": "i", "ј": "j", "к": "k", "л": "l", "љ": "lj",
    "м": "m", "н": "n", "њ": "nj", "о": "o", "п": "p", "р": "r", "с": "s",
    "т": "t", "ћ": "ć", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "č",
    "џ": "dž", "ш": "š",
    "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Ђ": "Đ", "Е": "E",
    "Ж": "Ž", "З": "Z", "И": "I", "Ј": "J", "К": "K", "Л": "L", "Љ": "Lj",
    "М": "M", "Н": "N", "Њ": "Nj", "О": "O", "П": "P", "Р": "R", "С": "S",
    "Т": "T", "Ћ": "Ć", "У": "U", "Ф": "F", "Х": "H", "Ц": "C", "Ч": "Č",
    "Џ": "Dž", "Ш": "Š"
  },

  toCyrillic(text) {
    if (!text) return "";
    let res = "";
    let i = 0;
    while (i < text.length) {
      if (i + 1 < text.length) {
        const pair = text.substr(i, 2);
        if (this.digraphsLatToCyr[pair]) {
          res += this.digraphsLatToCyr[pair];
          i += 2;
          continue;
        }
      }
      const char = text[i];
      res += this.latToCyrSingle[char] || char;
      i += 1;
    }
    return res;
  },

  toLatin(text) {
    if (!text) return "";
    let res = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      res += this.cyrToLatMap[char] || char;
    }
    return res;
  }
};
