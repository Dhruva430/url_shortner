-- name: GetOriginalURL :one
SELECT * FROM urls
WHERE short_code = $1
LIMIT 1;

-- name: IncrementClickCount :exec
UPDATE urls
SET click_count = click_count + 1
WHERE short_code = $1;

-- name: CreateUser :one
INSERT INTO users (username, email, password_hash, ip_address)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreateOAuthUser :one
INSERT INTO users (username, email, ip_address, provider, provider_id, image)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1
LIMIT 1;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = $1
LIMIT 1;

-- name: DeleteURLByShortCode :exec
DELETE FROM urls
WHERE short_code = $1;

-- name: GetUrlsByUserID :many
SELECT 
  id,
  original_url,
  title,
  short_code,
  thumbnail,
  click_count,
  password_hash,
  created_at,
  expire_at,
  user_id
FROM urls
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: UpdateShortURL :one
UPDATE urls
SET 
  original_url = $1,
  title = $2,
  expire_at = $3,
  password_hash = $4
WHERE short_code = $5
RETURNING *;

-- name: GetUserByProvider :one
SELECT * FROM users
WHERE provider = $1 AND provider_id = $2
LIMIT 1;

-- name: CreateShortURL :one
INSERT INTO urls (
  original_url,
  short_code,
  title,
  password_hash,
  expire_at,
  user_id,
  thumbnail,
  click_count
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, 0
)
RETURNING *;

-- name: GetUserByProviderID :one
SELECT * FROM users
WHERE provider = $1 AND provider_id = $2
LIMIT 1;

-- name: LogURLVisit :exec
INSERT INTO url_visits (
  url_id,
  user_id,
  ip_address,
  device_type,
  user_agent,
  referrer,
  country,
  region,
  city
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
);

-- name: GetURLVisits :many
SELECT * FROM url_visits
WHERE url_id = $1
ORDER BY clicked_at DESC;

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
JOIN url_visits v ON u.id = v.url_id
WHERE u.short_code = $1
ORDER BY v.clicked_at DESC;

-- name: CountDeviceTypes :many
SELECT
  COALESCE(device_type, 'unknown') AS device_type,
  COUNT(*) AS count
FROM url_visits
WHERE url_id = (SELECT id FROM urls WHERE short_code = $1)
GROUP BY device_type;

-- name: GetDeviceTypeStatsByShortCode :many
SELECT
  COALESCE(device_type, 'unknown') AS device_type,
  COUNT(*) AS count
FROM url_visits v
JOIN urls u ON u.id = v.url_id
WHERE u.short_code = $1
GROUP BY device_type;

-- name: GetDeviceTypeStatsGlobal :many
SELECT
  COALESCE(device_type, 'unknown') AS device_type,
  COUNT(*) AS count
FROM url_visits
GROUP BY device_type;

-- name: GetDailyClicksAndLinksGlobal :many
SELECT
  d::date AS date,
  COALESCE(clicks.count, 0) AS clicks,
  COALESCE(links.count, 0) AS links
FROM generate_series(
         CURRENT_DATE - INTERVAL '6 days',
         CURRENT_DATE,
         INTERVAL '1 day'
     ) AS d
LEFT JOIN (
    SELECT clicked_at::date AS date, COUNT(*) AS count
    FROM url_visits
    GROUP BY clicked_at::date
) AS clicks ON clicks.date = d
LEFT JOIN (
    SELECT created_at::date AS date, COUNT(*) AS count
    FROM urls
    GROUP BY created_at::date
) AS links ON links.date = d
ORDER BY d;

-- name: GetMonthlyClicksGlobal :many
SELECT
    to_char(month, 'Mon')   AS month,   -- "Jan", "Feb", …
    COALESCE(c.count, 0)    AS clicks
FROM generate_series(
         date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
         date_trunc('month', CURRENT_DATE),
         INTERVAL '1 month'
     ) AS month
LEFT JOIN (
    SELECT date_trunc('month', clicked_at) AS m, COUNT(*) AS count
    FROM url_visits
    GROUP BY m
) AS c ON c.m = month
ORDER BY month;

-- name: GetCountryVisitCounts :many
SELECT
  COALESCE(country, '') AS country,   
  COUNT(*)              AS clicks
FROM url_visits
WHERE clicked_at >= NOW() - ($1 * interval '1 day')
GROUP BY country
ORDER BY clicks DESC;

-- name: GetDashboardSummary :one
SELECT
  COUNT(*) AS total_links,
  COALESCE(SUM(click_count), 0)::BIGINT AS total_clicks,
  COUNT(*) FILTER (
    WHERE expire_at IS NULL OR expire_at > now()
  ) AS active_links,
  COUNT(*) FILTER (
    WHERE expire_at IS NOT NULL AND expire_at <= now()
  ) AS expired_links
FROM urls;
