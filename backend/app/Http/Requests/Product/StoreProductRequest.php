<?php

namespace App\Http\Requests\Product;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'category' => ['prohibited'],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('status', Category::STATUS_ACTIVE)),
            ],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'image_files' => ['nullable', 'array', 'max:5'],
            'image_files.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'status' => ['prohibited'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $imageFiles = $this->file('image_files', []);
            $legacyImage = $this->file('image_file');
            $imageCount = count(is_array($imageFiles) ? $imageFiles : []) + ($legacyImage ? 1 : 0);

            if ($imageCount > 5) {
                $validator->errors()->add('image_files', 'You may upload up to 5 product images.');
            }
        });
    }
}
