# /backend/websocket_routing.py
# WebSocket routing configuration for A-DIENYNAS
# CHANGE: Created WebSocket routing for real-time updates
# PURPOSE: Define WebSocket URL patterns and routing
# UPDATES: Initial setup with schedule WebSocket routing

from django.urls import re_path
from . import websocket_consumers

websocket_urlpatterns = [
    re_path(r'ws/schedule/$', websocket_consumers.ScheduleConsumer.as_asgi()),
]
