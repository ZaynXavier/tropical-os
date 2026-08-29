<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecipeIngredient extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'recipe_id',
        'inventory_item_id',
        'quantity',
        'unit',
        'yield_percentage',
        'cost_allocation',
    ];

    protected $casts = [
        'quantity' => 'float',
        'yield_percentage' => 'float',
        'cost_allocation' => 'float',
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
