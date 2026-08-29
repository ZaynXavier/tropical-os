<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'uuid',
        'reservation_code',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'company_name',
        'type',
        'date',
        'time',
        'area',
        'pax',
        'estimated_value',
        'down_payment',
        'payment_status',
        'status',
        'special_requests',
        'notes',
        'pic_id',
        'menu_package',
    ];

    protected $casts = [
        'date' => 'date',
        'pax' => 'integer',
        'estimated_value' => 'float',
        'down_payment' => 'float',
        'special_requests' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pic()
    {
        return $this->belongsTo(Employee::class, 'pic_id');
    }
}
