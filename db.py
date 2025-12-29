import sqlite3

DB_NAME = "CourseBridge.db"

def get_db():
    return sqlite3.connect(DB_NAME)

def create_table():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

create_table()