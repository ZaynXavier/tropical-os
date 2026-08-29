<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    protected $fillable = [
        'uuid',
        'order_number',
        'table_number',
        'guest_count',
        'subtotal_amount',
        'discount_amount',
        'service_charge_amount',
        'tax_amount',
        'total_amount',
        'order_type',
        'status',
        'cashier_id',
    ];

    protected $casts = [
        'subtotal_amount' => 'float',
        'discount_amount' => 'float',
        'service_charge_amount' => 'float',
        'tax_amount' => 'float',
        'total_amount' => 'float',
    ];

    public function cashier()
    {
        return $this->belongsTo(Employee::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalesPayment::class);
    }
}
