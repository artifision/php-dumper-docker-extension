<?php

namespace App\Outputs;

use Illuminate\Support\Facades\Redis;
use Symfony\Component\Console\Formatter\OutputFormatter;
use Symfony\Component\Console\Formatter\OutputFormatterInterface;

class RedisOutput implements \Symfony\Component\Console\Output\OutputInterface
{
    private OutputFormatterInterface $formatter;
    private int $verbosity;

    public function write(iterable|string $messages, bool $newline = false, int $options = 0)
    {
        Redis::publish('dump-channel', $messages);
    }

    public function writeln(iterable|string $messages, int $options = 0)
    {
        $this->write($messages, true, $options);
    }

    public function setVerbosity(int $level)
    {
        $this->verbosity = $level;
    }

    public function getVerbosity(): int
    {
        return $this->verbosity ?? self::VERBOSITY_NORMAL;
    }

    public function isQuiet(): bool
    {
        return false;
    }

    public function isVerbose(): bool
    {
        return false;
    }

    public function isVeryVerbose(): bool
    {
        return false;
    }

    public function isDebug(): bool
    {
        return false;
    }

    public function setDecorated(bool $decorated)
    {

    }

    public function isDecorated(): bool
    {
        return false;
    }

    public function setFormatter(\Symfony\Component\Console\Formatter\OutputFormatterInterface $formatter)
    {
        $this->formatter = $formatter;
    }

    public function getFormatter(): \Symfony\Component\Console\Formatter\OutputFormatterInterface
    {
        return $this->formatter ?? new OutputFormatter();
    }
}
