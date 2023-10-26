FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM php:8.2-fpm-alpine3.17

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

COPY backend/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY backend/docker/nginx.conf /etc/nginx/http.d/default.conf

COPY backend /var/www
RUN cd /var/www && composer install --optimize-autoloader --no-interaction --no-progress --no-suggest
RUN cd /var/www && php artisan optimize:clear && rm -rf bootstrap/cache/* && rm -rf storage/framework/cache/* && \
    rm -rf storage/framework/views/* && rm -rf storage/framework/sessions/* && rm -rf storage/logs/*
COPY docker-compose.yaml /
COPY metadata.json /
COPY docker.svg /
COPY --from=client-builder /ui/build /ui

RUN chown -R www-data:www-data /var/www

LABEL org.opencontainers.image.title="PHP Dumper" \
    org.opencontainers.image.description="This extension allows you to call well-known 'dd' and 'dump' functions in your application and see the output in a clean and structured format directly within the extension." \
    org.opencontainers.image.vendor="Artifision Co." \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots='[{"alt":"Dump Example", "url":"https://raw.githubusercontent.com/artifision/php-dumper-docker-extension/main/ui/public/screenshot_1.png"}, {"alt":"Multiple Dumps Example", "url":"https://raw.githubusercontent.com/artifision/php-dumper-docker-extension/main/ui/public/screenshot_2.png"}, {"alt":"Dumps Diff", "url":"https://raw.githubusercontent.com/artifision/php-dumper-docker-extension/main/ui/public/screenshot_3.png"}]' \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/artifision/php-dumper-docker-extension/main/ui/public/logo.png" \
    com.docker.extension.detailed-description="<p>The <strong>PHP Dumper</strong> Docker Extension is a valuable tool for PHP developers seeking to streamline the debugging process in their applications. This powerful extension enables you to utilize Symfony var dumper functions, including the widely-used <code>dd</code> and <code>dump</code>, without the need for your application to be running within a Docker environment.</p><p>One of the standout features of this extension is its ability to redirect the output of these functions away from the console or web page, providing a clean, distraction-free environment for debugging, all while your application runs on your preferred setup.</p><p>What's more, the setup is incredibly easy. Just add the following line to your <code>.env</code> file: <code>VAR_DUMPER_FORMAT=server</code>, and you're ready to enjoy a streamlined debugging experience.</p><p>In addition to enhancing debugging simplicity, the PHP Dumper Docker Extension also offers an advanced 'dumps compare' feature. This allows you to perform side-by-side comparisons of variable data, making it a powerful asset for pinpointing differences and troubleshooting issues effectively.</p>" \
    com.docker.extension.publisher-url="https://artifision.com" \
    com.docker.extension.additional-urls='[{"title":"GitHub","url":"https://github.com/artifision/php-dumper-docker-extension"}, {"title":"Docker Hub","url":"https://hub.docker.com/r/artifision/php-dumper-docker-extension"}]' \
    com.docker.extension.categories="tools,utility-tools" \
    com.docker.extension.changelog="This is the first release of the extension."

EXPOSE 9912 9913

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]