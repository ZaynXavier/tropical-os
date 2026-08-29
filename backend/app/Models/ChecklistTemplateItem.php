<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistTemplateItem extends Model
{
    protected $fillable = [
        'checklist_template_id',
        'sequence',
        'task_name',
        'standard_description',
        'is_required',
        'requires_photo',
        'requires_numeric_value',
        'unit',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'requires_photo' => 'boolean',
        'requires_numeric_value' => 'boolean',
    ];

    public function template()
    {
        return $this->belongsTo(ChecklistTemplate::class, 'checklist_template_id');
    }

    public function executions()
    {
        return $this->hasMany(ChecklistExecution::class, 'checklist_template_item_id');
    }
}
