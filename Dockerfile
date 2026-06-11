FROM composer:2 AS deps

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache \
    && echo "APP_KEY=base64:$(php -r 'echo base64_encode(random_bytes(32));')" > .env \
    && php artisan wayfinder:generate --with-form \
    && rm .env


FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts tsconfig.json ./
COPY --from=deps /app/resources/js/actions ./resources/js/actions
COPY --from=deps /app/resources/js/routes ./resources/js/routes
COPY --from=deps /app/vendor/laravel/wayfinder/resources/js/wayfinder.ts ./resources/js/wayfinder.ts

RUN WAYFINDER_COMMAND=true npm run build


FROM php:8.5-fpm-alpine AS final

WORKDIR /var/www/html

RUN apk add --no-cache \
        sqlite \
        sqlite-dev \
        libxml2-dev \
        curl-dev \
        zip \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-install \
        mbstring \
        xml \
        curl \
        zip \
        bcmath \
    && echo "expose_php = Off" > /usr/local/etc/php/conf.d/security.ini

COPY --from=deps /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY . .

RUN mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache \
    && chown -R root:www-data /var/www/html \
    && chmod -R 750 /var/www/html \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 770 storage bootstrap/cache

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]


FROM nginx:1.27-alpine AS nginx-final

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=assets /app/public /var/www/html/public
