<?php

namespace App\Traits;

trait ApiResponseTrait
{
    public function successResponse(
        string $message,
        mixed $data = null,
        int $statusCode = 200
    ) {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public function errorResponse(
        string $message,
        mixed $errors = null,
        int $statusCode = 400
    ) {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }
}
