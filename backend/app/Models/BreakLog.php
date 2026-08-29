<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BreakLog extends Model
{
    protected $table = 'breaks';

    protected $fillable = [
        'attendance_id',
        'employee_id',
        'break_type',
        'start_time',
        'end_time',
        'duration_minutes',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
