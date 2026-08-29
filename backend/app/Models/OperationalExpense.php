<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationalExpense extends Model
{
    protected $fillable = [
        'expense_number',
        'expense_date',
        'category',
        'description',
        'amount',
        'paid_from_account',
        'receipt_photo_url',
        'paid_by',
        'approved_by',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'float',
    ];

    public function payer()
    {
        return $this->belongsTo(Employee::class, 'paid_by');
    }

    public function approver()
    {
        return $this->belongsTo(Employee::class, 'approved_by');
    }
}
