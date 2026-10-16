<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_key',
        'target_group',
        'category',
        'title_ar',
        'description_ar',
        'severity',
        'is_active',
        'channels_in_app',
        'channels_browser',
        'channels_email',
        'target_roles',
        'target_user_ids',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'channels_in_app' => 'boolean',
        'channels_browser' => 'boolean',
        'channels_email' => 'boolean',
        'target_roles' => 'array',
        'target_user_ids' => 'array',
    ];
}
