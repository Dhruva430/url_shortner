-- name: CreateShortURL :one
INSERT INTO urls (original_url, short_code, click_count)
VALUES ($1, $2, 0)
RETURNING *;

-- name: GetOriginalURL :one
SELECT * FROM urls
WHERE short_code = $1;

-- name: IncrementClickCount :exec
UPDATE urls
SET click_count = click_count + 1
WHERE short_code = $1;

-- name: CreateUser :one
INSERT INTO users (username, email, password_hash,ip_address)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

