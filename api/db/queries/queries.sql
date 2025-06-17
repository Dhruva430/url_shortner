-- name: CreateShortURL :one
INSERT INTO urls (original_url, short_code, user_id, click_count)
VALUES ($1, $2, $3, 0)
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

-- name: GetUserByProvider :one
SELECT * FROM users
WHERE provider = $1 AND provider_id = $2;

-- name: CreateOAuthUser :one
INSERT INTO users (username,email, ip_address, provider, provider_id, image)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;


-- name: GetUserByProviderID :one
SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1;



 -- name: LogURLVisit :exec
INSERT INTO url_visits (
  url_id, user_id, ip_address, user_agent, referrer, country, region, city
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
);

-- name: GetURLVisits :many
SELECT * FROM url_visits
WHERE url_id = $1;

-- name: GetAnalyticsShortcode :many
SELECT 
  u.short_code, 
  u.original_url, 
  u.click_count, 
  v.clicked_at, 
  v.ip_address, 
  v.user_agent,
  v.referrer,
  v.country,
  v.region,
  v.city,
  u.user_id
FROM urls u
INNER JOIN url_visits v ON u.id = v.url_id
WHERE u.short_code = $1
ORDER BY v.clicked_at DESC;

