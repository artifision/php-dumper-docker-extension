<?php

namespace App\Http\Controllers;

use App\Descriptors\HtmlDumpDescriptor;
use App\Services\Healthcheck;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\VarDumper\Cloner\Data;
use Symfony\Component\VarDumper\Server\DumpServer;

class DumpsController extends Controller
{
    public function stream(HtmlDumpDescriptor $descriptor): StreamedResponse
    {
        $descriptor->setTheme(request('theme', 'dark'));
        $descriptor->setMaxDepth(request('depth', 1));

        return $this->streamResponse(function () use ($descriptor) {
            $server = new DumpServer('0.0.0.0:9912');
            $server->start();

            $server->listen(function (Data $data, array $context, int $clientId) use ($descriptor) {
                if ($data->getValue() === Healthcheck::STOP_SERVER_KEY) {
                    throw new \Exception('Stopping dump server...');
                }

                $this->sendEvent(['dump' => json_encode($descriptor->describe($data, $context))]);
            });
        });
    }

    public function ping(Healthcheck $healthcheck): string
    {
        $healthcheck->ping();

        return 'pong';
    }

    public function stop(Healthcheck $healthcheck): string
    {
        $healthcheck->sendStopSignal();

        return 'stopped';
    }

    public function dump(): string
    {
        dump(request());

        return 'dumped';
    }
}
