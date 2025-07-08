import os

# Always resolves based on the script's directory
base_dir = os.path.dirname(os.path.abspath(__file__))
schema_path = os.path.join(base_dir, '..', 'db', 'schema.sql')
db_path = os.path.join(base_dir, '..', 'db', 'database.db')

import sqlite3

connection = sqlite3.connect(db_path)

with open(schema_path, 'r') as f:
    connection.executescript(f.read())

connection.commit()
connection.close()

print("Database initialized successfully.")
