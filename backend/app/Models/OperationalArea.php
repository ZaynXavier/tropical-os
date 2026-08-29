<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationalArea extends Model
{
    protected $fillable = [
        'area_code',
        'name',
        'department',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function stations()
    {
        return $this->hasMany(OperationalStation::class, 'area_id');
    }
}
