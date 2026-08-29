<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashierClosing extends Model
{
    protected $fillable = [
        'closing_number',
        'shift_id',
        'cashier_id',
        'opening_cash_float',
        'system_cash_sales',
        'system_non_cash_sales',
        'actual_physical_cash',
        'cash_variance',
        'total_transactions',
        'status',
        'verified_by',
        'audited_by',
    ];

    protected $casts = [
        'opening_cash_float' => 'float',
        'system_cash_sales' => 'float',
        'system_non_cash_sales' => 'float',
        'actual_physical_cash' => 'float',
        'cash_variance' => 'float',
        'total_transactions' => 'integer',
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function cashier()
    {
        return $this->belongsTo(Employee::class, 'cashier_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(Employee::class, 'verified_by');
    }
}
