"""
Seeder script to populate yugolearn.db with all 30 letters and vocab items.
"""
import re
import json
from pathlib import Path
from database import init_db, get_connection
from intelligence import to_latin
from datetime import datetime

init_db()

# Read data.js
data_js = Path(__file__).resolve().parent.parent / "js" / "data.js"
content = data_js.read_text(encoding="utf-8")

# Extract alphabet array
conn = get_connection()
cur = conn.cursor()
now_iso = datetime.now().isoformat()

# Seed letters
letters = [
    ("А", "A", "Short or long 'a' like father", "Identical"),
    ("Б", "B", "True 'B' as in Belgrade or book", "Cyrillic Classic"),
    ("В", "V", "Sounds like English 'V'! NOT 'B'!", "False Friend"),
    ("Г", "G", "Always hard 'G' as in go", "Cyrillic Classic"),
    ("Д", "D", "Firm 'D' as in day", "Cyrillic Classic"),
    ("Ђ", "Đ", "Soft 'dj' sound, like 'dew' (Vuk gem)", "Serbian Special"),
    ("Е", "E", "Clean open 'e' like bed or pet", "Identical"),
    ("Ж", "Ž", "Sound of 's' in treasure or measure", "Cyrillic Classic"),
    ("З", "Z", "Buzzing 'Z' as in zebra or zoo", "Cyrillic Classic"),
    ("И", "I", "Pure 'ee' sound as in meet or machine", "Cyrillic Classic"),
    ("Ј", "J", "Sounds like English 'Y' in yes", "Identical"),
    ("К", "K", "Crisp 'k' as in kite or coffee", "Identical"),
    ("Л", "L", "Clean 'L' as in lemon", "Cyrillic Classic"),
    ("Љ", "Lj", "Soft 'ly' sound like million or Italian gli", "Serbian Special"),
    ("М", "M", "'m' as in mother or moon", "Identical"),
    ("Н", "N", "Sounds like English 'N'! NOT 'H'!", "False Friend"),
    ("Њ", "Nj", "Soft 'ny' sound like canyon or Spanish ñ", "Serbian Special"),
    ("О", "O", "Pure round 'o' as in orbit", "Identical"),
    ("П", "P", "'P' as in park or paper (NOT P=R!)", "Cyrillic Classic"),
    ("Р", "R", "Rolled / trilled 'R'! NOT Latin 'P'!", "False Friend"),
    ("С", "S", "Sharp 'S' as in sun! NOT 'C'!", "False Friend"),
    ("Т", "T", "Dental 't' with tongue touching teeth", "Identical"),
    ("Ћ", "Ć", "Soft 'ch' sound in British tune", "Serbian Special"),
    ("У", "U", "Sounds like 'oo' in boot! NOT 'Y'!", "False Friend"),
    ("Ф", "F", "'F' as in film or friend", "Cyrillic Classic"),
    ("Х", "H", "Raspy 'h' in loch! NOT 'X'!", "False Friend"),
    ("Ц", "C", "Sound 'ts' as in tsunami or cats", "Cyrillic Classic"),
    ("Ч", "Č", "Hard 'ch' as in chocolate", "Cyrillic Classic"),
    ("Џ", "Dž", "Hard 'j' as in jeep or jam", "Serbian Special"),
    ("Ш", "Š", "Sound 'sh' as in shoe", "Cyrillic Classic")
]

for cyr, lat, sound, grp in letters:
    cur.execute("""
    INSERT OR REPLACE INTO srs_items 
    (id, item_type, deck_id, front_cyr, front_lat, back_en, hint, sound_guide, next_due)
    VALUES (?, 'letter', 'alphabet', ?, ?, ?, ?, ?, ?)
    """, (f"letter_{cyr}", cyr, lat, f"Letter {cyr} ({lat})", grp, sound, now_iso))

# Core vocabulary
words = [
    ("Да", "Da", "Yes", "essentials", "Short affirmative"),
    ("Не", "Ne", "No", "essentials", "Simple negation"),
    ("Молим", "Molim", "Please / Excuse me / You're welcome", "essentials", "Magic polite word"),
    ("Хвала", "Hvala", "Thank you", "essentials", "Remember: X = H"),
    ("Изволите", "Izvolite", "Here you go / How can I help?", "essentials", "Common in shops"),
    ("Здраво", "Zdravo", "Hello / Hi", "essentials", "Friendly informal greeting"),
    ("Довиђења", "Doviđenja", "Goodbye", "essentials", "Formal farewell"),
    ("Ћао", "Ćao", "Ciao / Hi / Bye", "essentials", "Very common informal"),
    ("Добро", "Dobro", "Good / Okay", "essentials", "Universal agreement"),
    ("Лоше", "Loše", "Bad", "essentials", "Opposite of dobro"),
    ("Добро јутро", "Dobro jutro", "Good morning", "essentials", "Morning greeting"),
    ("Добар дан", "Dobar dan", "Good day", "essentials", "Daytime greeting"),
    ("Добро вече", "Dobro veče", "Good evening", "essentials", "Evening greeting"),
    ("Лаку ноћ", "Laku noć", "Good night", "essentials", "Before sleep"),
    ("Како си?", "Kako si?", "How are you? (informal)", "essentials", "Friendly check-in"),
    ("Добро сам", "Dobro sam", "I am good", "essentials", "Standard reply"),
    ("Шта", "Šta", "What", "essentials", "Question word"),
    ("Ко", "Ko", "Who", "essentials", "Question word"),
    ("Где", "Gde", "Where", "essentials", "Navigation word"),
    ("Када", "Kada", "When", "essentials", "Time question"),
    ("Зашто", "Zašto", "Why", "essentials", "Reason question"),
    ("Колико кошта?", "Koliko košta?", "How much does it cost?", "essentials", "Crucial for market/store"),
    ("Рачун, молим", "Račun, molim", "The check/bill, please", "essentials", "At kafana/restaurant"),
    ("Један", "Jedan", "One (1)", "numbers", "Number 1"),
    ("Два", "Dva", "Two (2)", "numbers", "Number 2"),
    ("Три", "Tri", "Three (3)", "numbers", "Number 3"),
    ("Четири", "Četiri", "Four (4)", "numbers", "Number 4"),
    ("Пет", "Pet", "Five (5)", "numbers", "Number 5"),
    ("Десет", "Deset", "Ten (10)", "numbers", "Number 10"),
    ("Сто", "Sto", "One hundred (100) / Table", "numbers", "Number 100"),
    ("Кафа", "Kafa", "Coffee", "food", "Traditional beverage"),
    ("Вода", "Voda", "Water", "food", "Essential drink"),
    ("Пиво", "Pivo", "Beer", "food", "Cold beverage"),
    ("Хлеб", "Hleb", "Bread", "food", "Fresh bread"),
    ("Ћевапи", "Ćevapi", "Ćevapi (minced meat sausages)", "food", "Iconic Balkan dish"),
    ("Пљескавица", "Pljeskavica", "Serbian gourmet burger patty", "food", "Iconic Balkan food"),
    ("Кајмак", "Kajmak", "Clotted cream spread", "food", "Traditional dairy delight"),
    ("Сир", "Sir", "Cheese", "food", "Fresh cheese"),
    ("Ракија", "Rakija", "Fruit brandy (plum/quince)", "food", "National spirit")
]

for cyr, lat, en, cat, note in words:
    cur.execute("""
    INSERT OR REPLACE INTO srs_items 
    (id, item_type, deck_id, front_cyr, front_lat, back_en, hint, sound_guide, next_due)
    VALUES (?, 'word', ?, ?, ?, ?, ?, ?, ?)
    """, (f"word_{cyr}", cat, cyr, lat, en, note, cat.capitalize(), now_iso))

    cur.execute("""
    INSERT OR REPLACE INTO vocab_bank (cyr, lat, en, category, notes, is_custom)
    VALUES (?, ?, ?, ?, ?, 0)
    """, (cyr, lat, en, cat, note))

conn.commit()
conn.close()
print(f"Seeded {len(letters)} letters and {len(words)} core vocabulary into SQLite persistent memory!")
