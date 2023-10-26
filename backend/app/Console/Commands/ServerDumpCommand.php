<?php

namespace App\Console\Commands;

use App\Descriptors\HtmlDumpDescriptor;
use App\Dumpers\HtmlCustomDumper;
use App\Outputs\RedisOutput;
use Illuminate\Console\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\VarDumper\Cloner\Data;
use Symfony\Component\VarDumper\Server\DumpServer;

class ServerDumpCommand extends Command
{
    protected $signature = 'app:server-dump-command';
    protected $description = 'Dump Server';

    public function handle(RedisOutput $redisOutput): int
    {
        $htmlDumper = new HtmlCustomDumper();
        $htmlDumper->setDisplayOptions(['maxDepth' => 0]);
        $descriptor = new HtmlDumpDescriptor($htmlDumper);
        $io = new SymfonyStyle($this->input, $redisOutput);
        $server = new DumpServer('0.0.0.0:9912');
        $server->start();

        $server->listen(function (Data $data, array $context, int $clientId) use ($descriptor, $io) {
            $descriptor->describe($io, $data, $context, $clientId);
        });

        return 0;
    }
}
