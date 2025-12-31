import sqlite3

# Single DB connection for desktop app
conn = sqlite3.connect("calculator.db", check_same_thread=False)
cursor = conn.cursor()


def init_db():
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        result TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_key TEXT UNIQUE NOT NULL,
        template TEXT NOT NULL,
        variable_count INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()


# ---------- HISTORY ----------
def save_history(expression, result):
    cursor.execute(
        "INSERT INTO history (expression, result) VALUES (?, ?)",
        (expression, result)
    )
    conn.commit()


def get_history():
    return cursor.execute(
        "SELECT id, expression, result FROM history ORDER BY id DESC"
    ).fetchall()


# ---------- PATTERNS ----------
def save_pattern(pattern_key, template, variable_count):
    cursor.execute(
        """
        INSERT OR IGNORE INTO patterns (pattern_key, template, variable_count)
        VALUES (?, ?, ?)
        """,
        (pattern_key, template, variable_count)
    )
    conn.commit()


def get_patterns():
    return cursor.execute(
        "SELECT id, template, variable_count FROM patterns ORDER BY id DESC"
    ).fetchall()
