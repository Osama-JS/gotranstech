<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_key',
        'title',
        'message',
        'action_url',
        'severity',
        'data',
        'is_read',
        'read_at',
        'is_browser_delivered',
        'is_email_sent',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_browser_delivered' => 'boolean',
        'is_email_sent' => 'boolean',
    ];

    protected $appends = [
        'body',
        'created_at_human',
    ];

    public function getBodyAttribute(): string
    {
        return $this->message ?? '';
    }

    public function getCreatedAtHumanAttribute(): string
    {
        return $this->created_at ? $this->created_at->diffForHumans() : '';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
