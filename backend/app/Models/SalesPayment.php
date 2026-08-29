<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesPayment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sales_order_id',
        'payment_method',
        'amount_paid',
        'change_amount',
        'reference_no',
        'created_at',
    ];

    protected $casts = [
        'amount_paid' => 'float',
        'change_amount' => 'float',
        'created_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }
}
