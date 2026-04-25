<?php

namespace App\Http\Requests\Product;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'image_files' => ['nullable', 'array', 'max:5'],
            'image_files.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/quicktime,video/webm', 'max:20480'],
            'status' => ['sometimes', 'required', 'string', Rule::in([
                Product::STATUS_ACTIVE,
                Product::STATUS_INACTIVE,
            ])],
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
