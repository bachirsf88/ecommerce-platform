<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
            'role' => ['required', 'string', Rule::in(['buyer', 'seller'])],
            'store_name' => ['required_if:role,seller', 'string', 'max:255'],
            'store_address' => ['required_if:role,seller', 'string'],
            'postal_code' => ['required_if:role,seller', 'string', 'max:255'],
        ];
    }
}
