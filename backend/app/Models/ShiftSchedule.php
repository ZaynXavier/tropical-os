<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftSchedule extends Model
{
    protected $fillable = [
        'employee_id',
        'shift_id',
        'date',
        'status',
        'swapped_with_employee_id',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function swappedWith()
    {
        return $this->belongsTo(Employee::class, 'swapped_with_employee_id');
    }
}
