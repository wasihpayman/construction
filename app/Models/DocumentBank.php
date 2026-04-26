<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentBank extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_name',
        'phone',
        'description',
        'zip_file_path',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getZipFileUrlAttribute()
    {
        return $this->zip_file_path ? asset('storage/' . $this->zip_file_path) : null;
    }

    public function getFileNameAttribute()
    {
        return $this->zip_file_path ? basename($this->zip_file_path) : null;
    }

    public function getFileSizeAttribute()
    {
        if (!$this->zip_file_path) return null;
        
        $filePath = storage_path('app/public/' . $this->zip_file_path);
        if (file_exists($filePath)) {
            return $this->formatBytes(filesize($filePath));
        }
        
        return null;
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
