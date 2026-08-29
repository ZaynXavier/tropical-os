<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationalStation extends Model
{
    protected $fillable = [
        'area_id',
        'station_code',
        'name',
        'min_staff',
        'recommended_staff',
        'status',
    ];

    public function area()
    {
        return $this->belongsTo(OperationalArea::class, 'area_id');
    }

    public function checklistTemplates()
    {
        return $this->hasMany(ChecklistTemplate::class, 'station_id');
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'station_id');
    }
}
