<?php

namespace App\Descriptors;

use App\Dumpers\HtmlCustomDumper;
use Symfony\Component\VarDumper\Cloner\Data;

class HtmlDumpDescriptor
{
    public function __construct(protected HtmlCustomDumper $dumper)
    {
    }

    public function setTheme(string $theme): void
    {
        $this->dumper->setTheme($theme);
    }

    public function setMaxDepth(int $depth): void
    {
        $this->dumper->setDisplayOptions(['maxDepth' => $depth]);
    }

    public function describe(Data $data, array $context): array
    {
        if ($controller = $context['request']['controller'] ?? null) {
            $context['request']['controller_html'] = $this->dumper->dump($controller, true, ['maxDepth' => 0]);
        }

        return [
            'uid' => uniqid('dump-', true),
            'timestamp' => (float)($context['timestamp'] ?: microtime(true)),
            'context' => $context,
            'html' => $this->dumper->dump($data, true),
        ];
    }
}
