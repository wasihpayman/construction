<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Project;
use App\Models\Material;

class MaterialPurchase extends Model
{
    protected $fillable = [
        'project_id',
        'material_id',
        'quantity',
        'unit_price',
        'total_price',
        'supplier_name',
        'purchase_date',
        'description',
      //  'authorized_by',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}