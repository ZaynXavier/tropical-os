<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'sku',
        'name',
        'category',
        'unit',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
        'reorder_point',
        'average_cost',
        'last_purchase_cost',
        'storage_location',
        'is_active',
    ];

    protected $casts = [
        'current_stock' => 'float',
        'minimum_stock' => 'float',
        'maximum_stock' => 'float',
        'reorder_point' => 'float',
        'average_cost' => 'float',
        'last_purchase_cost' => 'float',
        'is_active' => 'boolean',
    ];

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function recipeIngredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}
