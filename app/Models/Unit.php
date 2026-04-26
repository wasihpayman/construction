<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Project;
use App\Models\UnitSale;

class Unit extends Model
{
    protected $fillable = [
        'project_id',
        'unit_number',
        'floor',
        'area',
        'price',
        'status',
        'seller_name',
        'buyer_name',
        'sale_price',
        'sold_date',
        'sale_description',
    ];

    protected $casts = [
        'area' => 'decimal:2',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'sold_date' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function sale()
    {
        return $this->hasOne(UnitSale::class);
    }

    // Helper methods for status
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    public function isSold()
    {
        return $this->status === 'sold';
    }

    // Scope for available units
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    // Scope for sold units
    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    // Scope for floor-based filtering
    public function scopeByFloor($query, $floor)
    {
        return $query->where('floor', $floor);
    }

    // Scope for units in a project with floor grouping
    public function scopeByProjectWithFloors($query, $projectId)
    {
        return $query->where('project_id', $projectId)
                    ->orderBy('floor')
                    ->orderBy('unit_number');
    }

    // Accessor for formatted status
    public function getFormattedStatusAttribute()
    {
        return ucfirst($this->status);
    }

    // Accessor for full unit identifier
    public function getFullIdentifierAttribute()
    {
        return "Floor {$this->floor}, Unit {$this->unit_number}";
    }
}