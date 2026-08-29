<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistExecution extends Model
{
    protected $fillable = [
        'checklist_template_id',
        'checklist_template_item_id',
        'employee_id',
        'date',
        'status',
        'numeric_value',
        'note',
        'evidence_photo_url',
        'completed_at',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'date' => 'date',
        'numeric_value' => 'float',
        'completed_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(ChecklistTemplate::class, 'checklist_template_id');
    }

    public function item()
    {
        return $this->belongsTo(ChecklistTemplateItem::class, 'checklist_template_item_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(Employee::class, 'verified_by');
    }
}
