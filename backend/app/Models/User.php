<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_BUYER = 'buyer';
    public const ROLE_SELLER = 'seller';
    public const ROLE_ADMIN = 'admin';

    public const SELLER_STATUS_PENDING = 'pending';
    public const SELLER_STATUS_APPROVED = 'approved';
    public const SELLER_STATUS_REJECTED = 'rejected';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'password',
        'role',
        'seller_status',
        'bio',
        'profile_image_path',
        'notification_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'notification_preferences' => 'array',
    ];

    protected $appends = [
        'profile_image_url',
    ];

    public function isBuyer(): bool
    {
        return $this->role === self::ROLE_BUYER;
    }

    public function isSeller(): bool
    {
        return $this->role === self::ROLE_SELLER;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function store()
    {
        return $this->hasOne(Store::class, 'seller_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'buyer_id');
    }

    public function withdrawalRequests()
    {
        return $this->hasMany(WithdrawalRequest::class, 'seller_id');
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        $path = $this->profile_image_path;

        if (! $path) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $path) === 1) {
            return $path;
        }

        $baseUrl = request()
            ? rtrim(request()->getSchemeAndHttpHost(), '/')
            : rtrim((string) config('app.url'), '/');

        if (str_starts_with($path, '/storage/')) {
            return $baseUrl . $path;
        }

        return $baseUrl . Storage::disk('public')->url($path);
    }
}
