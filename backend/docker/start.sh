#!/usr/bin/env bash
set -e

php artisan optimize:clear || true

php artisan migrate --force || true

if [ "$SEED_PRODUCTION_ADMIN" = "true" ]; then
    php artisan db:seed --class=ProductionAdminSeeder --force || true
fi

php artisan storage:link || true

apache2-foreground
