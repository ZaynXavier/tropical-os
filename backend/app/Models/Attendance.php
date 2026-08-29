<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'uuid',
        'employee_id',
        'shift_id',
        'date',
        'clock_in_time',
        'clock_out_time',
        'status',
        'late_duration_minutes',
        'clock_in_latitude',
        'clock_in_longitude',
        'clock_in_distance_meters',
        'clock_in_photo_url',
        'clock_out_latitude',
        'clock_out_longitude',
        'clock_out_photo_url',
        'location_status',
        'face_verified',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in_time' => 'datetime',
        'clock_out_time' => 'datetime',
        'clock_in_latitude' => 'float',
        'clock_in_longitude' => 'float',
        'clock_in_distance_meters' => 'float',
        'face_verified' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function breaks()
    {
        return $this->hasMany(BreakLog::class);
    }
}
