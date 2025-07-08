CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    oauth_provider TEXT,
    oauth_id TEXT,
    subscription TEXT DEFAULT 'free',
    mfa_enabled BOOLEAN DEFAULT 0,
    theme TEXT DEFAULT 'light'
);

CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    stars INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
