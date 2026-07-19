"""
Migration script to add icon_name column to habits table.
Run this once to update existing database.
"""

import sqlite3
import os

def migrate():
    # Get the database path (relative to this script)
    db_path = os.path.join(os.path.dirname(__file__), '..', 'habit_hawk.db')

    print(f"Connecting to database: {db_path}")

    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(habits)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'icon_name' in columns:
            print("[OK] Column 'icon_name' already exists. No migration needed.")
        else:
            # Add the column
            cursor.execute("ALTER TABLE habits ADD COLUMN icon_name VARCHAR(50)")
            conn.commit()
            print("[OK] Successfully added 'icon_name' column to habits table")

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
