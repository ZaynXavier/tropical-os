<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'recipe_code',
        'name',
        'category',
        'station_id',
        'serving_portion',
        'selling_price',
        'theoretical_cost',
        'food_cost_percentage',
        'target_food_cost_percentage',
        'is_active',
    ];

    protected $casts = [
        'selling_price' => 'float',
        'theoretical_cost' => 'float',
        'food_cost_percentage' => 'float',
        'target_food_cost_percentage' => 'float',
        'is_active' => 'boolean',
    ];

    public function station()
    {
        return $this->belongsTo(OperationalStation::class, 'station_id');
    }

    public function ingredients()
    {
        return $this->hasMany(RecipeIngredient::class, 'recipe_id');
    }

    public function salesOrderItems()
    {
        return $this->hasMany(SalesOrderItem::class, 'recipe_id');
    }
}
