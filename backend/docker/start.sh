#!/usr/bin/env bash
set -e

php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan migrate --force || true
php artisan storage:link || true

apache2-foreground
