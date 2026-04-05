<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSellerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'profile_image' => ['nullable', 'image', 'max:5120'],
            'notification_preferences' => ['nullable', 'array'],
            'notification_preferences.order_updates' => ['nullable', 'boolean'],
            'notification_preferences.review_updates' => ['nullable', 'boolean'],
            'notification_preferences.marketing_updates' => ['nullable', 'boolean'],
        ];
    }
}
