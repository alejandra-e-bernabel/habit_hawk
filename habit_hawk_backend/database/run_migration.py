"""
Run the user profile fields migration.
"""
import sqlite3
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(os.path.dirname(script_dir), 'habit_hawk.db')
migration_path = os.path.join(script_dir, 'add_user_profile_fields_migration.sql')

# Read migration SQL
with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Connect and execute
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Execute each statement separately
for statement in migration_sql.split(';'):
    statement = statement.strip()
    if statement:
        try:
            cursor.execute(statement)
            print(f"Executed: {statement[:50]}...")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column already exists (skipping): {statement[:50]}...")
            else:
                raise

conn.commit()
conn.close()

print("\nMigration completed successfully!")
