<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function streamResponse(callable $callback): StreamedResponse
    {
        return response()->stream($callback, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    protected function sendEvent(mixed $data): void
    {
        echo 'data: ' . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }
}
