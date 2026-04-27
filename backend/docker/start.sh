#!/usr/bin/env bash
set -e

php artisan optimize:clear || true

php artisan migrate --force || true
php artisan storage:link || true

apache2-foreground
