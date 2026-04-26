<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'project_id',
        'created_by',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::observe(\App\Observers\MaterialCategoryObserver::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function forms()
    {
        return $this->hasMany(Form::class, 'category_id')->orderBy('order');
    }

    public function categoryForm()
    {
        return $this->hasOne(CategoryForm::class, 'category_id');
    }

    public function entries()
    {
        return $this->hasMany(FormEntry::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function rebarMaterials()
    {
        return $this->hasMany(RebarMaterial::class);
    }

    public function gravelMaterials()
    {
        return $this->hasMany(GravelMaterial::class);
    }

    public function sandMaterials()
    {
        return $this->hasMany(SandMaterial::class);
    }

    public function stoneMaterials()
    {
        return $this->hasMany(StoneMaterial::class);
    }

    public function brickMaterials()
    {
        return $this->hasMany(BrickMaterial::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class, 'category_id');
    }
}
