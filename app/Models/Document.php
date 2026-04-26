<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'category',
        'filename',
        'original_name',
        'path',
        'mime_type',
        'size'
    ];

    /**
     * Get the sale that owns the document.
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Get the file URL for the document.
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }

    /**
     * Get the file size in human readable format.
     */
    public function getFormattedSizeAttribute()
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
