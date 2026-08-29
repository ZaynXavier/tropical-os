<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'uuid',
        'customer_code',
        'name',
        'phone',
        'email',
        'tier',
        'total_visits',
        'total_spent',
        'preferences',
    ];

    protected $casts = [
        'total_visits' => 'integer',
        'total_spent' => 'float',
        'preferences' => 'array',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
