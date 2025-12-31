import sqlite3

DB_NAME = "calculator.db"


def get_conn():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        result TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        pattern_key TEXT UNIQUE NOT NULL,
        template TEXT NOT NULL,
        variable_count INTEGER NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    print("✅ DB initialized")


# ---------------- HISTORY ----------------
def save_history(expression, result):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO history (expression, result) VALUES (?, ?)",
        (expression, result)
    )

    conn.commit()
    conn.close()
    print("📝 History saved:", expression, result)


def get_history():
    conn = get_conn()
    cur = conn.cursor()

    rows = cur.execute(
        "SELECT id, expression, result FROM history ORDER BY id DESC"
    ).fetchall()

    conn.close()
    return rows


# ---------------- PATTERNS ----------------
def save_pattern(name, pattern_key, template, variable_count):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT OR IGNORE INTO patterns
        (name, pattern_key, template, variable_count)
        VALUES (?, ?, ?, ?)
        """,
        (name, pattern_key, template, variable_count)
    )

    conn.commit()
    conn.close()
    print("💾 Pattern saved:", name)


def get_patterns():
    conn = get_conn()
    cur = conn.cursor()

    rows = cur.execute(
        "SELECT id, name, template, variable_count FROM patterns ORDER BY id DESC"
    ).fetchall()

    conn.close()
    return rows
