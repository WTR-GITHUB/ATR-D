# /backend/websocket_consumers.py
# WebSocket consumers for A-DIENYNAS real-time updates
# CHANGE: Created WebSocket consumers for activity status updates
# PURPOSE: Handle real-time WebSocket connections for schedule updates
# UPDATES: Initial setup with activity status change handling

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)
User = get_user_model()

class ScheduleConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for schedule and activity updates
    Handles real-time communication for activity status changes
    """
    
    async def connect(self):
        """
        Connect to WebSocket
        Add user to schedule group for real-time updates
        """
        self.room_group_name = 'schedule_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected: {self.channel_name}")
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to A-DIENYNAS real-time updates'
        }))

    async def disconnect(self, close_code):
        """
        Disconnect from WebSocket
        Remove user from schedule group
        """
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")

    async def receive(self, text_data):
        """
        Receive message from WebSocket client
        Handle different message types
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            logger.info(f"Received WebSocket message: {message_type}")
            
            if message_type == 'activity_status_change':
                await self.handle_activity_status_change(text_data_json)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'message': 'pong'
                }))
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_activity_status_change(self, data):
        """
        Handle activity status change message
        Broadcast to all connected clients
        """
        try:
            schedule_id = data.get('data', {}).get('scheduleId')
            plan_status = data.get('data', {}).get('planStatus')
            
            if not schedule_id or not plan_status:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Missing scheduleId or planStatus'
                }))
                return
            
            # Broadcast to all clients in the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'activity_status_change',
                    'data': {
                        'scheduleId': schedule_id,
                        'planStatus': plan_status,
                        'message': f'Activity {schedule_id} status changed to {plan_status}'
                    }
                }
            )
            
            logger.info(f"Broadcasted activity status change: {schedule_id} -> {plan_status}")
            
        except Exception as e:
            logger.error(f"Error handling activity status change: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Error processing activity status change'
            }))

    async def activity_status_change(self, event):
        """
        Send activity status change to WebSocket client
        """
        await self.send(text_data=json.dumps({
            'type': 'activity_status_change',
            'data': event['data']
        }))

    async def schedule_update(self, event):
        """
        Send schedule update to WebSocket client
        """
        await self.send(text_data=json.dumps({
            'type': 'schedule_update',
            'data': event['data']
        }))

    async def error_message(self, event):
        """
        Send error message to WebSocket client
        """
        await self.send(text_data=json.dumps({
            'type': 'error',
            'data': event['data']
        }))
