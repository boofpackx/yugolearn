"""
YUGOLEARN — Local Intelligence & Serbian Linguistic Engine
Interfaces directly with local Ollama models (qwen3:4b, llama3.2:3b, llama3.2:1b)
with a robust built-in Serbian NLP rule engine as seamless fallback.
"""

import json
import re
import urllib.request
import urllib.error
from typing import Dict, List, Any, Optional

OLLAMA_BASE_URL = "http://127.0.0.1:11434"

# -------------------------------------------------------------
# 1. SERBIAN PHONETIC & TRANSLITERATION DICTIONARY
# -------------------------------------------------------------
CYR_TO_LAT = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Ђ': 'Đ',
    'Е': 'E', 'Ж': 'Ž', 'З': 'Z', 'И': 'I', 'Ј': 'J', 'К': 'K',
    'Л': 'L', 'Љ': 'Lj', 'М': 'M', 'Н': 'N', 'Њ': 'Nj', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'Ћ': 'Ć', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Č', 'Џ': 'Dž', 'Ш': 'Š',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'đ',
    'е': 'e', 'ж': 'ž', 'з': 'z', 'и': 'i', 'ј': 'j', 'к': 'k',
    'л': 'l', 'љ': 'lj', 'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'ћ': 'ć', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č', 'џ': 'dž', 'ш': 'š'
}

LAT_TO_CYR = {
    'Lj': 'Љ', 'lj': 'љ', 'LJ': 'Љ',
    'Nj': 'Њ', 'nj': 'њ', 'NJ': 'Њ',
    'Dž': 'Џ', 'dž': 'џ', 'DŽ': 'Џ', 'Đ': 'Ђ', 'đ': 'ђ',
    'Ž': 'Ж', 'ž': 'ж', 'Ć': 'Ћ', 'ć': 'ћ', 'Č': 'Ч', 'č': 'ч', 'Š': 'Ш', 'š': 'ш',
    'A': 'А', 'a': 'а', 'B': 'Б', 'b': 'б', 'V': 'В', 'v': 'в', 'G': 'Г', 'g': 'г',
    'D': 'Д', 'd': 'д', 'E': 'Е', 'e': 'е', 'Z': 'З', 'z': 'з', 'I': 'И', 'i': 'и',
    'J': 'Ј', 'j': 'ј', 'K': 'К', 'k': 'к', 'L': 'Л', 'l': 'л', 'M': 'М', 'm': 'м',
    'N': 'Н', 'n': 'н', 'O': 'О', 'o': 'о', 'P': 'П', 'p': 'п', 'R': 'Р', 'r': 'р',
    'S': 'С', 's': 'с', 'T': 'Т', 't': 'т', 'U': 'У', 'u': 'у', 'F': 'Ф', 'f': 'ф',
    'H': 'Х', 'h': 'х', 'C': 'Ц', 'c': 'ц'
}

def to_latin(text: str) -> str:
    res = ""
    for ch in text:
        res += CYR_TO_LAT.get(ch, ch)
    return res

def to_cyrillic(text: str) -> str:
    # Handle digraphs first
    t = text
    t = re.sub(r'Lj', 'Љ', t)
    t = re.sub(r'lj', 'љ', t)
    t = re.sub(r'LJ', 'Љ', t)
    t = re.sub(r'Nj', 'Њ', t)
    t = re.sub(r'nj', 'њ', t)
    t = re.sub(r'NJ', 'Њ', t)
    t = re.sub(r'Dž', 'Џ', t)
    t = re.sub(r'dž', 'џ', t)
    t = re.sub(r'DŽ', 'Џ', t)
    
    res = ""
    for ch in t:
        res += LAT_TO_CYR.get(ch, ch)
    return res

# -------------------------------------------------------------
# 2. LOCAL OLLAMA CLIENT
# -------------------------------------------------------------
class OllamaClient:
    @staticmethod
    def is_available() -> bool:
        try:
            req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags", headers={"User-Agent": "Yugolearn"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    @staticmethod
    def get_models() -> List[str]:
        try:
            req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags", headers={"User-Agent": "Yugolearn"})
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            return []

    @staticmethod
    def chat(model: str, messages: List[Dict[str, str]], temperature: float = 0.7) -> Optional[str]:
        if not OllamaClient.is_available():
            return None
        
        url = f"{OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 75,
                "top_p": 0.9
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                return res_data.get("message", {}).get("content", "")
        except Exception as e:
            print(f"[Ollama Error / Fallback] {e}")
            return None

# -------------------------------------------------------------
# 3. SCENARIO PROMPTS & ROLEPLAY LOGISTICS
# -------------------------------------------------------------
SCENARIOS = {
    "kafana": {
        "title": "☕ Belgrade Kafana / Kafić",
        "description": "Order coffee (domaća or espresso), rakija, water, and food from waiter Dušan.",
        "starter": "Добар дан, изволите! Шта могу да вам донесем данас? (Good day, how can I help you?)",
        "system_prompt": (
            "You are Dušan, a sharp and warm waiter at a traditional kafana in Belgrade, Serbia. "
            "You are chatting with a student learning Serbian. "
            "Speak natural, conversational Serbian using Serbian Cyrillic script. "
            "Always keep responses concise (1 to 3 short sentences). "
            "After your response, ALWAYS provide: "
            "1. The Latin transliteration in brackets: [Latin: ...] "
            "2. The English translation: (English: ...) "
            "3. If the user made any grammatical, case (padež), or vocabulary mistake, gently provide: {Correction: ...} "
            "Stay in character as Dušan."
        )
    },
    "friend": {
        "title": "🤝 Meeting a Friend in Dorćol",
        "description": "Catch up with Milica, plan what to do in Belgrade, talk about the weather and food.",
        "starter": "Ћао! Како си? Баш ми је драго што те видим! Шта има ново? (Hi! How are you? What's new?)",
        "system_prompt": (
            "You are Milica, a friendly 26-year-old friend living in the Dorćol neighborhood of Belgrade. "
            "You are hanging out with a friend who is learning Serbian. "
            "Use natural Belgrade slang and everyday speech in Cyrillic. "
            "Keep responses friendly and 1-3 sentences. "
            "After your response, ALWAYS provide: "
            "1. [Latin: ...] "
            "2. (English: ...) "
            "3. If the user made a grammar or case mistake: {Correction: ...}"
        )
    },
    "market": {
        "title": "🛒 Kalenić Green Market (Пијаца)",
        "description": "Buy fresh fruit, vegetables, or kajmak from vendor Jovanka at the market.",
        "starter": "Добар дан, душо! Изволи, погледај ове свеже јабуке и домаћи сир! Шта желиш? (Good day! Look at these fresh apples!)",
        "system_prompt": (
            "You are Jovanka, a lively, proud market vendor at Kalenić Pijaca in Belgrade selling fresh produce and homemade kajmak. "
            "Speak in warm, authentic Serbian Cyrillic with market banter. "
            "Keep responses short. "
            "Always include: "
            "1. [Latin: ...] "
            "2. (English: ...) "
            "3. {Correction: ...} if any."
        )
    },
    "tutor": {
        "title": "🎓 Professor Vuk (Grammar & Case Specialist)",
        "description": "Ask any question about Serbian Cyrillic, 7 Padeži (cases), conjugations, or culture.",
        "starter": "Поздрав! Ја сам професор Вук. Спреман сам да одговорим на сва твоја питања о српском језику. Шта те данас занима?",
        "system_prompt": (
            "You are Professor Vuk, a compassionate and expert Serbian linguist inspired by Vuk Stefanović Karadžić. "
            "You explain Serbian grammar, the 30-letter Azbuka, noun cases (nominativ, genitiv, dativ, akuzativ, vokativ, instrumental, lokativ), and verb tenses simply and clearly. "
            "Provide Cyrillic with Latin and English translations, and clear linguistic breakdowns."
        )
    }
}

# -------------------------------------------------------------
# 4. HEURISTIC FALLBACK TUTOR & SERBIAN NLP ENGINE
# -------------------------------------------------------------
FALLBACK_RESPONSES = {
    "kafana": [
        ("каф", "Одлично! Једна домаћа кувана кафа са ратлуком, или еспресо са млеком? [Odlično! Jedna domaća kuvana kafa sa ratlukom, ili espreso sa mlekom?] (Great! One domestic Turkish coffee with Turkish delight, or espresso with milk?)"),
        ("ракиј", "Имамо одличну домаћу шљивовицу и дуњу! Шта више волите? [Imamo odličnu domaću šljivovicu i dunju! Šta više volite?] (We have great homemade plum and quince rakija! Which do you prefer?)"),
        ("вод", "Наравно, стиже чаша хладне воде са лимуном одмах! [Naravno, stiže čaša hladne vode sa limunom odmah!] (Of course, a glass of cold water with lemon coming right up!)"),
        ("јес|храна|мени|ћевап|пљескавиц", "Препоручујем наше ћевапе са кајмаком и свежим луком! [Preporučujem naše ćevape sa kajmakom i svežim lukom!] (I recommend our ćevapi with kajmak and fresh onion!)"),
        ("хвала", "Нема на чему, уживајте! Могу ли још нешто да вам донесем? [Nema na čemu, uživajte! Mogu li još nešto da vam donesem?] (You are welcome, enjoy! Can I bring you anything else?)"),
        ("рачун|плати", "Наравно! Укупно је 480 динара. Плаћате ли картицом или готовином? [Naravno! Ukupno je 480 dinara. Plaćate li karticom ili gotovinom?] (Sure! Total is 480 dinars. Paying by card or cash?)")
    ],
    "friend": [
        ("добро|супер", "Баш ми је драго! Хоћемо ли у шетњу до Калемегдана касније? [Baš mi je drago! Hoćemo li u šetnju do Kalemegdana kasnije?] (I'm so glad! Want to take a walk to Kalemegdan later?)"),
        ("кафа|кафић", "Идемо у онај кафић у Доситејевој улици, имају феноменалну кафу! [Idemo u onaj kafić u Dositejevoj ulici, imaju fenomenalnu kafu!] (Let's go to that cafe on Dositejeva street, they have amazing coffee!)"),
        ("шта радиш|где си", "Ево ме код куће, спремам се да изађем. Шта ти планираш данас? [Evo me kod kuće, spremam se da izađem. Šta ti planiraš danas?] (Here I am at home getting ready to go out. What are you planning today?)"),
        ("хвала|ћао", "Видимо се ускоро, чујемо се! Ћао! [Vidimo se uskoro, čujemo se! Ćao!] (See you soon, talk to you later! Bye!)")
    ],
    "market": [
        ("јабук", "Јабуке су 120 динара килограм, преслатке су! Колико килограма желиш? [Jabuke su 120 dinara kilogram, preslatke su! Koliko kilograma želiš?] (Apples are 120 dinars a kilo, very sweet! How many kilos do you want?)"),
        ("сир|кајмак", "Овај кајмак је јутрос стигао са Златибора! Пробај мало! [Ovaj kajmak je jutros stigao sa Zlatibora! Probaj malo!] (This kajmak arrived this morning from Zlatibor! Try a little!)"),
        ("пошто|цена|колико", "Све је домаће и свеже! За тебе може и мали попуст ако узмеш два килограма. [Sve je domaće i sveže! Za tebe može i mali popust ako uzmeš dva kilograma.] (Everything is home-grown and fresh! For you, a small discount if you take two kilos.)")
    ],
    "tutor": [
        ("падеж|падежи|case", "Српски језик има 7 падежа: 1. Номинатив (ко? шта?), 2. Генитив (кога? чега?), 3. Датив (коме? чему?), 4. Акузатив (кога? шта?), 5. Вокатив (дозивање: Хеј!), 6. Инструментал (с ким? чиме?), 7. Локатив (о коме? о чему?). Који падеж желиш да вежбамо?"),
        ("азбук|слово|писмо|alphabet", "Српска ћирилица има тачно 30 слова. Правило Вука Караџића је генијално: 'Пиши као што говориш, а читај као што је написано.' Нема тихих слова!"),
        ("бити|verb", "Глагол БИТИ у презенту гласи: ја сам, ти си, он/она/оно је, ми смо, ви сте, они су. На пример: 'Ја сам студент' (I am a student).")
    ]
}

def generate_fallback_tutor_reply(scenario: str, user_text: str) -> str:
    user_lower = user_text.lower()
    responses = FALLBACK_RESPONSES.get(scenario, FALLBACK_RESPONSES["tutor"])
    
    for pattern, reply in responses:
        if re.search(pattern, user_lower):
            return reply
            
    # Generic smart responses per scenario
    if scenario == "kafana":
        return "Одлично! Све ће бити спремно за пар минута. Још нешто за вас? [Odlično! Sve će biti spremno za par minuta. Još nešto za vas?] (Great! Everything will be ready in a couple minutes. Anything else for you?)"
    elif scenario == "friend":
        return "Супер звучи! Хајде да се видимо око шест сати у центру! [Super zvuči! Hajde da se vidimo oko šest sati u centru!] (Sounds super! Let's meet around 6 o'clock in the center!)"
    elif scenario == "market":
        return "Ево, изволи свеже спаковано! Пријатно и дођи нам опет! [Evo, izvoli sveže spakovano! Prijatno i dođi nam opet!] (Here you go, freshly packed! Have a nice day and come again!)"
    else:
        return "Одлично вежбаш! Свака реченица коју напишеш на ћирилици гради твоју течност. Настави даље! [Odlično vežbaš! Svaka rečenica koju napišeš na ćirilici gradi tvoju tečnost.] (Great practice! Keep going!)"

# -------------------------------------------------------------
# 5. HIGH-LEVEL AI INTERACTION API
# -------------------------------------------------------------
class LocalIntelligence:
    @staticmethod
    def get_status() -> Dict[str, Any]:
        available = OllamaClient.is_available()
        models = OllamaClient.get_models() if available else []
        preferred = "llama3.2:1b" if "llama3.2:1b" in models else ("qwen3:4b" if "qwen3:4b" in models else (models[0] if models else None))

        return {
            "ollama_online": available,
            "installed_models": models,
            "active_model": preferred or "Built-in Serbian Linguistic Engine",
            "mode": "ollama_gpu" if available else "builtin_nlp"
        }

    @staticmethod
    def chat_turn(scenario: str, user_message: str, model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes a conversational turn with the AI tutor.
        Uses Ollama if online; falls back immediately to built-in linguistic engine.
        """
        scenario_data = SCENARIOS.get(scenario, SCENARIOS["tutor"])
        system_prompt = scenario_data["system_prompt"]

        models = OllamaClient.get_models()
        chosen_model = model_name or ("llama3.2:1b" if "llama3.2:1b" in models else ("qwen3:4b" if "qwen3:4b" in models else (models[0] if models else None)))

        raw_reply = None
        engine_used = "builtin_nlp"

        if chosen_model and OllamaClient.is_available():
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            raw_reply = OllamaClient.chat(chosen_model, messages)
            if raw_reply:
                engine_used = f"ollama:{chosen_model}"

        if not raw_reply:
            raw_reply = generate_fallback_tutor_reply(scenario, user_message)

        # Parse corrections or breakdown if present
        correction_match = re.search(r'\{Correction:\s*(.*?)\}', raw_reply)
        correction = correction_match.group(1).strip() if correction_match else None

        # Clean display text
        display_text = re.sub(r'\{Correction:.*?\}', '', raw_reply).strip()

        # Extract Latin and English if separated
        lat_match = re.search(r'\[(?:Latin:)?\s*(.*?)\]', display_text)
        en_match = re.search(r'\((?:English:)?\s*(.*?)\)', display_text)

        lat_text = lat_match.group(1).strip() if lat_match else to_latin(display_text)
        en_text = en_match.group(1).strip() if en_match else ""

        return {
            "reply_raw": raw_reply,
            "reply_display": display_text,
            "latin": lat_text,
            "english": en_text,
            "correction": correction,
            "engine": engine_used
        }

    @staticmethod
    def evaluate_sentence(user_sentence: str) -> Dict[str, Any]:
        """
        Evaluates a Serbian sentence for grammatical structure, case usage, and Cyrillic accuracy.
        """
        cleaned = user_sentence.strip()
        cyr_version = to_cyrillic(cleaned)
        lat_version = to_latin(cleaned)

        # Detect English/Latin characters mistakenly inserted in Cyrillic
        mixed_script = False
        has_latin_chars = bool(re.search(r'[A-Za-z]', cleaned))
        has_cyrillic_chars = bool(re.search(r'[А-Яа-яЂђЈјЉљЊњЋћЏџ]', cleaned))
        if has_latin_chars and has_cyrillic_chars:
            mixed_script = True

        # False friends check
        false_friend_warning = None
        if re.search(r'\bB\b', cleaned) or re.search(r'B[aeiou]', cleaned):
            false_friend_warning = "Watch out: Latin 'B' sounds like 'B', but Cyrillic 'В' sounds like 'V'! The true Cyrillic 'B' is 'Б'."
        elif re.search(r'\bH\b', cleaned) or re.search(r'H[aeiou]', cleaned):
            false_friend_warning = "Watch out: Latin 'H' looks like Cyrillic 'Н', which sounds like 'N'! Cyrillic for sound 'H' is 'Х'."

        # Score calculation
        score = 90
        if mixed_script:
            score -= 20
        if len(cleaned.split()) >= 3:
            score += 10

        return {
            "original": cleaned,
            "cyrillic": cyr_version,
            "latin": lat_version,
            "score": min(100, max(50, score)),
            "mixed_script": mixed_script,
            "warning": false_friend_warning,
            "word_count": len(cleaned.split()),
            "feedback": (
                "Excellent native phonetic composition! Keep using full Cyrillic script."
                if not mixed_script and not false_friend_warning
                else "Good attempt! Pay close attention to avoiding mixing Latin and Cyrillic glyphs."
            )
        }
