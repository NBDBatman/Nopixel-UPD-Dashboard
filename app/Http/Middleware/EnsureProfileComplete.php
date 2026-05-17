<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureProfileComplete
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && ! auth()->user()->profile_complete) {
            return redirect()->route('profile.setup');
        }

        return $next($request);
    }
}
