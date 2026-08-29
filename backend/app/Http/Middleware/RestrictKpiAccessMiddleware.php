<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictKpiAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Only OWNER, MANAGER, or FINANCE division are authorized to view executive KPIs
        $isAuthorized = (
            $user->role === 'OWNER' ||
            $user->role === 'MANAGER' ||
            strtoupper($user->division ?? '') === 'FINANCE'
        );

        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Executive KPI metrics are restricted to Owner, Manager, and Finance.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'division' => $user->division,
                ]
            ], 403);
        }

        return $next($request);
    }
}
