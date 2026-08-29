<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistTemplate extends Model
{
    protected $fillable = [
        'station_id',
        'template_code',
        'title',
        'shift_type',
        'category',
        'requires_verification',
        'is_active',
    ];

    protected $casts = [
        'requires_verification' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function station()
    {
        return $this->belongsTo(OperationalStation::class, 'station_id');
    }

    public function items()
    {
        return $this->hasMany(ChecklistTemplateItem::class, 'checklist_template_id')->orderBy('sequence');
    }

    public function executions()
    {
        return $this->hasMany(ChecklistExecution::class);
    }
}
