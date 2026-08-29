<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationalIssue extends Model
{
    protected $fillable = [
        'uuid',
        'issue_number',
        'title',
        'description',
        'area_id',
        'station_id',
        'category',
        'severity',
        'status',
        'sla_minutes',
        'sla_deadline',
        'is_sla_breached',
        'reported_by',
        'assigned_to',
        'resolution',
        'resolved_by',
        'resolved_at',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'sla_deadline' => 'datetime',
        'resolved_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_sla_breached' => 'boolean',
    ];

    public function area()
    {
        return $this->belongsTo(OperationalArea::class, 'area_id');
    }

    public function station()
    {
        return $this->belongsTo(OperationalStation::class, 'station_id');
    }

    public function reporter()
    {
        return $this->belongsTo(Employee::class, 'reported_by');
    }

    public function assignee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    public function resolver()
    {
        return $this->belongsTo(Employee::class, 'resolved_by');
    }
}
