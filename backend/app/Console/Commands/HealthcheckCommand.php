<?php

namespace App\Console\Commands;

use App\Services\Healthcheck;
use Illuminate\Console\Command;

class HealthcheckCommand extends Command
{
    protected $signature = 'app:healthcheck-command';
    protected $description = 'Healthcheck Command';

    public function handle(Healthcheck $healthcheck)
    {
        while (true) {
            if (!$healthcheck->pingOk()) {
                $healthcheck->sendStopSignal();
            }

            sleep(Healthcheck::PING_CHECK_INTERVAL);
        }
    }
}
