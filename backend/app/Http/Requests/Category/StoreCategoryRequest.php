<?php

namespace App\Http\Requests\Category;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slugSource = $this->input('slug') ?: $this->input('name');

        if (is_string($slugSource) && trim($slugSource) !== '') {
            $this->merge([
                'slug' => Str::slug($slugSource),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'max:6144'],
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'status' => ['required', 'string', Rule::in(Category::STATUSES)],
        ];
    }
}
