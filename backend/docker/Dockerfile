FROM php:8.2-fpm-alpine3.17

WORKDIR /var/www

# source: https://github.com/lorisleiva/laravel-docker/blob/main/8.2/Dockerfile

# Add docker-php-extension-installer script
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install dependencies
RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    g++ \
    gcc \
    gcompat \
    icu-dev \
    icu-libs \
    libc-dev \
    libzip-dev \
    make \
    oniguruma-dev \
    openssh-client \
    rsync \
    zlib-dev \
    nginx \
    supervisor

# Install php extensions
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions \
    @composer \
    xdebug-stable \
    bcmath \
    calendar \
    exif \
    intl \
    pcntl \
    soap \
    zip

# Add local and global vendor bin to PATH.
ENV PATH ./vendor/bin:/composer/vendor/bin:/root/.composer/vendor/bin:/usr/local/bin:$PATH

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 9912 9913

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
