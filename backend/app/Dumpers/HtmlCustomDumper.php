<?php

namespace App\Dumpers;


use Symfony\Component\VarDumper\Dumper\HtmlDumper;

class HtmlCustomDumper extends HtmlDumper
{
    protected static $themes = [
        'dark' => [
            'default' => 'background-color:#263238; color:#FFFFFF; line-height:1.2em; font:14px Menlo, Monaco, Consolas, monospace; word-wrap: break-word; white-space: pre-wrap; position:relative; z-index:99999; word-break: break-all',
            'num' => 'font-weight:bold; color:#93c5fd',
            'const' => 'font-weight:bold',
            'str' => 'font-weight:bold; color:#7FA9FF',
            'note' => 'color:#C792EA',
            'ref' => 'color:#A0A0A0',
            'public' => 'color:#22c55e',
            'protected' => 'color:#fde047',
            'private' => 'color:#ef4444',
            'meta' => 'color:#818cf8',
            'key' => 'color:#F78C6C',
            'index' => 'color:#93c5fd',
            'ellipsis' => 'color:#e879f9',
            'ns' => 'user-select:none;',
        ],

        'light' => [
            'default' => 'background-color:#F9F9F9; color:#6b7280; font-weight:bold; line-height:1.2em; font:14px Menlo, Monaco, Consolas, monospace; word-wrap: break-word; white-space: pre-wrap; position:relative; z-index:99999; word-break: break-all',
            'num' => 'font-weight:bold; color:#60a5fa',
            'const' => 'font-weight:bold',
            'str' => 'font-weight:bold; color:#3b82f6',
            'note' => 'color:#7c3aed',
            'ref' => 'color:#6E6E6E',
            'public' => 'font-weight:bold; color:#15803d',
            'protected' => 'font-weight:bold; color:#f9a825',
            'private' => 'font-weight:bold; color:#dc2626',
            'meta' => 'color:#d946ef',
            'key' => 'color:#64748b',
            'index' => 'color:#60a5fa',
            'ellipsis' => 'color:#CC7832',
            'ns' => 'user-select:none;',
        ],
    ];
}
