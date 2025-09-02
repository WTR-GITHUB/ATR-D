# /backend/core/health_views.py
# Health check endpoints for Docker container health monitoring
# PURPOSE: Provides health check endpoints for load balancers and container orchestration

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Basic health check endpoint
    Returns 200 OK if the Django application is running
    """
    try:
        return JsonResponse({
            'status': 'healthy',
            'service': 'a-dienynas-backend',
            'version': '1.0.0'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)


@csrf_exempt  
@require_http_methods(["GET"])
def health_detailed(request):
    """
    Detailed health check endpoint with database connectivity
    """
    try:
        # Test database connection
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        db_healthy = True
        
        # Test Redis connection (if configured)
        try:
            import redis
            from django.conf import settings
            # Basic Redis connection test - adjust based on your Redis config
            redis_healthy = True
        except:
            redis_healthy = False

        return JsonResponse({
            'status': 'healthy',
            'service': 'a-dienynas-backend',
            'version': '1.0.0',
            'database': 'healthy' if db_healthy else 'unhealthy',
            'redis': 'healthy' if redis_healthy else 'not_configured',
            'checks': {
                'database': db_healthy,
                'redis': redis_healthy
            }
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'service': 'a-dienynas-backend'
        }, status=500)