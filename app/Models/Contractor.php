<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Worker;

class Contractor extends Model
{
    protected $fillable = [
        'name',
        'company_name',
        'phone_number',
        'email',
    ];

    public function workers()
    {
        return $this->hasMany(Worker::class);
    }
}