<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'shift_code',
        'name',
        'start_time',
        'end_time',
        'grace_period_minutes',
        'cross_day',
        'is_active',
    ];

    protected $casts = [
        'cross_day' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function schedules()
    {
        return $this->hasMany(ShiftSchedule::class);
    }
}
