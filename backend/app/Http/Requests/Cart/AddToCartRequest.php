<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('product_id')) {
            $this->merge([
                'product_id' => (string) $this->input('product_id'),
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
