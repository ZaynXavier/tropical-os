<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'inventory_item_id',
        'movement_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_cost' => 'float',
        'total_cost' => 'float',
        'created_at' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function creator()
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }
}
