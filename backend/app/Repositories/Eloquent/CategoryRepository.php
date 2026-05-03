<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getActive(): Collection
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->orderBy('name'),
            ])
            ->where('status', Category::STATUS_ACTIVE)
            ->orderBy('name')
            ->get();
    }

    public function getAll(): Collection
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->orderBy('name'),
            ])
            ->orderBy('name')
            ->get();
    }

    public function findById(int|string $id): ?Category
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->orderBy('name'),
            ])
            ->find($id);
    }

    public function findActiveById(int|string $id): ?Category
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->orderBy('name'),
            ])
            ->where('status', Category::STATUS_ACTIVE)
            ->find($id);
    }

    public function findBySlug(string $slug): ?Category
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->orderBy('name'),
            ])
            ->where('slug', $slug)
            ->first();
    }

    public function findActiveBySlug(string $slug): ?Category
    {
        return Category::query()
            ->with([
                'parent',
                'children' => fn ($query) => $query->where('status', Category::STATUS_ACTIVE)->orderBy('name'),
            ])
            ->where('slug', $slug)
            ->where('status', Category::STATUS_ACTIVE)
            ->first();
    }

    public function create(array $data): Category
    {
        return Category::create($data)->fresh(['parent', 'children']);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh(['parent', 'children']);
    }

    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }
}
