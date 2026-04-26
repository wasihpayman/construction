<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'bill_number',
        'bill_date',
        'file_path',
        'description',
        'created_by',
    ];

    protected $casts = [
        'bill_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(MaterialCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFileTypeAttribute()
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));
        return in_array($extension, ['pdf']) ? 'pdf' : 'image';
    }
}
