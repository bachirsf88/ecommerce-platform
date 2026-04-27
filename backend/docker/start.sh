#!/usr/bin/env bash
set -e

echo "=== Laravel optimize clear ==="
php artisan optimize:clear || true

echo "=== Laravel route list products ==="
php artisan route:list --path=products || true

echo "=== Laravel route list api ==="
php artisan route:list --path=api || true

echo "=== Apache config test ==="
apache2ctl -S || true

echo "=== Run migrations ==="
php artisan migrate --force || true

echo "=== Storage link ==="
php artisan storage:link || true

echo "=== Starting Apache ==="
apache2-foreground
