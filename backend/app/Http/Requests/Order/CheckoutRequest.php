<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'country' => ['required', 'string'],
            'state' => ['required', 'string'],
            'municipality' => ['required', 'string'],
            'neighborhood' => ['required', 'string'],
            'street_address' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'shipping_method' => ['required', 'string', Rule::in([
                'home_delivery',
                'office_pickup',
            ])],
            'payment_method' => ['required', 'string', Rule::in([
                'cash_on_delivery',
                'card',
            ])],
        ];
    }
}
