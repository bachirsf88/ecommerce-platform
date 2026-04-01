<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function getAll(): Collection;

    public function findById(int|string $id);

    public function search(?string $keyword): Collection;

    public function filter(array $filters): Collection;

    public function create(array $data);

    public function update($product, array $data);

    public function delete($product): bool;
}
