<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\MaterialPurchase;

class Material extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'price_per_unit',
        'description',
        'project_id',
    ];

    public function purchases()
    {
        return $this->hasMany(MaterialPurchase::class);
    }
}