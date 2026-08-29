<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'employee_code',
        'full_name',
        'nickname',
        'email',
        'phone',
        'gender',
        'employment_status',
        'join_date',
        'department',
        'primary_position',
        'access_level',
        'additional_responsibilities',
        'supervisor_id',
        'manager_id',
        'avatar_url',
        'status',
        'emergency_contact',
        'notes',
    ];

    protected $casts = [
        'join_date' => 'date',
        'additional_responsibilities' => 'array',
        'emergency_contact' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'supervisor_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function shiftSchedules()
    {
        return $this->hasMany(ShiftSchedule::class);
    }

    public function checklistExecutions()
    {
        return $this->hasMany(ChecklistExecution::class);
    }

    public function reportedIssues()
    {
        return $this->hasMany(OperationalIssue::class, 'reported_by');
    }
}
