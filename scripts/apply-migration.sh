#!/bin/bash
# Apply a specific migration to Supabase.
# Usage: ./scripts/apply-migration.sh <migration_file>
# Example: ./scripts/apply-migration.sh supabase/migrations/004_protocol_favorites.sql
#
# Requires: SUPABASE_DB_URL environment variable
# Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)

set -euo pipefail

MIGRATION_FILE="${1:?Usage: $0 <migration_file>}"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set."
  echo ""
  echo "Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)"
  echo "Then run: SUPABASE_DB_URL='postgresql://...' $0 $MIGRATION_FILE"
  exit 1
fi

echo "Applying migration: $MIGRATION_FILE"
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"
echo "Migration applied successfully."
