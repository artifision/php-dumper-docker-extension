<?php

namespace App\Services;

use Illuminate\Cache\Repository;

class Healthcheck
{
    public const PING_CHECK_INTERVAL = 3;
    public const OK_PING_INTERVAL = 10;
    public const STOP_SERVER_KEY = 'stop-var-dumper-f7bfde71-8ab4-4286-9f56-a2424421f447';
    protected const PING_CACHE_KEY = 'healthcheck';

    public function __construct(protected Repository $cache)
    {
    }

    public function ping(): void
    {
        $this->cache->put(static::PING_CACHE_KEY, time(), static::OK_PING_INTERVAL);
    }

    public function pingOk(): bool
    {
        return (bool)$this->cache->get(static::PING_CACHE_KEY);
    }

    public function sendStopSignal(): void
    {
        ob_start();
        dump(static::STOP_SERVER_KEY);
        ob_get_clean();
    }
}
