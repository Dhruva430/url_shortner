#!/usr/bin/env sh
set -eu

PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-url}"
PGPASSWORD="${PGPASSWORD:-url}"
PGDATABASE="${PGDATABASE:-postgres}"

export PGPASSWORD

echo "Waiting for Postgres at ${PGHOST}:${PGPORT}..."
until pg_isready -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" >/dev/null 2>&1; do
  sleep 1
done

echo "Resetting database schema..."
psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS public CASCADE;"
psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -v ON_ERROR_STOP=1 -c "CREATE SCHEMA public;"

echo "Applying schema (migrate up)..."
psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -v ON_ERROR_STOP=1 -f ./db/schema/schema.sql

echo "Generating sqlc code..."
sqlc generate -f ./db/sqlc.yaml

echo "Starting API server..."
exec air
