<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormEntry extends Model
{
    protected $fillable = [
        'category_id',
        'data',
        'created_by',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
