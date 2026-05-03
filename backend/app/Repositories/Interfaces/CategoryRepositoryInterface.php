<?php

namespace App\Repositories\Interfaces;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    public function getActive(): Collection;

    public function getAll(): Collection;

    public function findById(int|string $id): ?Category;

    public function findActiveById(int|string $id): ?Category;

    public function findBySlug(string $slug): ?Category;

    public function findActiveBySlug(string $slug): ?Category;

    public function create(array $data): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): bool;
}
