CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    provider VARCHAR(20),
    provider_id VARCHAR(50),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT unique_provider_user UNIQUE (provider, provider_id)
);

CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    title TEXT,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    click_count INTEGER NOT NULL DEFAULT 0,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expire_at TIMESTAMP WITH TIME ZONE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS url_visits (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    referrer TEXT,
    country VARCHAR(50),
    region VARCHAR(50),
    city VARCHAR(50),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);