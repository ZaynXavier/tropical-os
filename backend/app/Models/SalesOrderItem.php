<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesOrderItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sales_order_id',
        'recipe_id',
        'quantity',
        'unit_price',
        'unit_cost',
        'subtotal_price',
        'subtotal_cost',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'float',
        'unit_cost' => 'float',
        'subtotal_price' => 'float',
        'subtotal_cost' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class, 'recipe_id');
    }
}
