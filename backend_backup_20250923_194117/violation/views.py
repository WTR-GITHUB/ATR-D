# backend/violation/views.py

# Violation management views for A-DIENYNAS system
# Defines API views for violation CRUD operations, bulk actions, and statistics with role-based access control
# CHANGE: Created comprehensive views for violation system with penalty logic and role-based permissions

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model

from .models import ViolationCategory, ViolationRange, Violation
from .serializers import (
    ViolationCategorySerializer, ViolationRangeSerializer,
    ViolationSerializer, ViolationCreateSerializer, ViolationUpdateSerializer,
    ViolationBulkActionSerializer, ViolationStatsSerializer, ViolationCategoryStatsSerializer
)

User = get_user_model()


class ViolationCategoryViewSet(viewsets.ModelViewSet):
    """
    Pažeidimų kategorijų viewset - valdo kategorijų CRUD operacijas
    """
    queryset = ViolationCategory.objects.all()
    serializer_class = ViolationCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Grąžina aktyvias kategorijas"""
        return ViolationCategory.objects.filter(is_active=True).order_by('name')

    def get_permissions(self):
        """Nustato leidimus pagal veiksmą"""
        if self.action in ['list', 'retrieve']:
            # Visi autentifikuoti vartotojai gali peržiūrėti kategorijas
            permission_classes = [IsAuthenticated]
        else:
            # Tik mentoriai, kuratoriai ir vadovai gali redaguoti kategorijas
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Sukuria naują kategoriją"""
        # Tik mentoriai, kuratoriai ir vadovai gali kurti kategorijas
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių kurti kategorijas.")
        serializer.save()

    def perform_update(self, serializer):
        """Atnaujina kategoriją"""
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių redaguoti kategorijas.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ištrina kategoriją (soft delete)"""
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių trinti kategorijas.")
        instance.is_active = False
        instance.save()




class ViolationRangeViewSet(viewsets.ModelViewSet):
    """
    Pažeidimų rėžių viewset - valdo mokesčių rėžių CRUD operacijas
    """
    queryset = ViolationRange.objects.all()
    serializer_class = ViolationRangeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Grąžina aktyvius rėžius"""
        return ViolationRange.objects.filter(is_active=True).order_by('min_violations')

    def get_permissions(self):
        """Nustato leidimus pagal veiksmą"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            # Tik vadovai gali valdyti mokesčių rėžius
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Sukuria naują rėžį"""
        if not self.request.user.has_role('manager'):
            raise permissions.PermissionDenied("Tik vadovai gali kurti mokesčių rėžius.")
        serializer.save()

    def perform_update(self, serializer):
        """Atnaujina rėžį"""
        if not self.request.user.has_role('manager'):
            raise permissions.PermissionDenied("Tik vadovai gali redaguoti mokesčių rėžius.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ištrina rėžį (soft delete)"""
        if not self.request.user.has_role('manager'):
            raise permissions.PermissionDenied("Tik vadovai gali trinti mokesčių rėžius.")
        instance.is_active = False
        instance.save()


class ViolationViewSet(viewsets.ModelViewSet):
    """
    Pagrindinis pažeidimų viewset - valdo pažeidimų CRUD operacijas su role-based access
    """
    queryset = Violation.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Grąžina tinkamą serializerį pagal veiksmą"""
        if self.action == 'create':
            return ViolationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ViolationUpdateSerializer
        return ViolationSerializer

    def get_queryset(self):
        """Grąžina pažeidimus pagal vartotojo dabartinę rolę"""
        user = self.request.user
        
        # CHANGE: Pirmiausia patikrinti X-Current-Role header iš frontend
        current_role = self.request.headers.get('X-Current-Role')
        
        # Jei nėra header, naudoti default_role
        if not current_role:
            current_role = user.default_role
        
        if current_role == 'manager':
            # Vadovai mato visus pažeidimus
            return Violation.objects.all().order_by('-created_at')
        
        elif current_role == 'curator':
            # Kuratoriai mato visus pažeidimus
            return Violation.objects.all().order_by('-created_at')
        
        elif current_role == 'mentor':
            # Mentoriai mato tik savo sukurtus pažeidimus
            return Violation.objects.filter(created_by=user).order_by('-created_at')
        
        elif current_role == 'parent':
            # Tėvai mato tik savo vaikų pažeidimus
            from crm.models import StudentParent
            child_ids = StudentParent.objects.filter(parent=user).values_list('student_id', flat=True)
            return Violation.objects.filter(student_id__in=child_ids).order_by('-created_at')
        
        elif current_role == 'student':
            # Mokiniai mato tik savo pažeidimus
            return Violation.objects.filter(student=user).order_by('-created_at')
        
        return Violation.objects.none()

    def get_permissions(self):
        """Nustato leidimus pagal veiksmą"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Sukuria naują pažeidimą"""
        # Tik mentoriai, kuratoriai ir vadovai gali kurti pažeidimus
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių kurti pažeidimus.")
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        """Atnaujina pažeidimą"""
        # Tik mentoriai, kuratoriai ir vadovai gali redaguoti pažeidimus
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių redaguoti pažeidimus.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ištrina pažeidimą"""
        # Tik mentoriai, kuratoriai ir vadovai gali trinti pažeidimus
        if not (self.request.user.has_role('mentor') or 
                self.request.user.has_role('curator') or 
                self.request.user.has_role('manager')):
            raise permissions.PermissionDenied("Neturite teisių trinti pažeidimus.")
        instance.delete()

    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Masiniai veiksmai su pažeidimais"""
        if not (request.user.has_role('mentor') or 
                request.user.has_role('curator') or 
                request.user.has_role('manager')):
            return Response(
                {'error': 'Neturite teisių atlikti masinius veiksmus.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ViolationBulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action_type = serializer.validated_data['action']
        violation_ids = serializer.validated_data['violation_ids']
        violations = Violation.objects.filter(id__in=violation_ids)

        if action_type == 'mark_completed':
            violations.update(status=Violation.Status.COMPLETED)
            message = f'Sėkmingai pažymėta {violations.count()} pažeidimų kaip atliktų.'
        
        elif action_type == 'mark_penalty_paid':
            violations.update(penalty_status=Violation.PenaltyStatus.PAID)
            message = f'Sėkmingai pažymėta {violations.count()} mokesčių kaip apmokėtų.'
        
        elif action_type == 'recalculate_penalties':
            for violation in violations:
                violation.recalculate_penalty()
            message = f'Sėkmingai perskaičiuota {violations.count()} pažeidimų mokesčiai.'
        
        elif action_type == 'delete':
            count = violations.count()
            violations.delete()
            message = f'Sėkmingai ištrinta {count} pažeidimų.'

        return Response({'message': message}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Pažymi pažeidimą kaip atliktą"""
        violation = self.get_object()
        if not (request.user.has_role('mentor') or 
                request.user.has_role('curator') or 
                request.user.has_role('manager')):
            return Response(
                {'error': 'Neturite teisių keisti pažeidimų statusą.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        violation.mark_as_completed()
        return Response({'message': 'Pažeidimas pažymėtas kaip atliktas.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_penalty_paid(self, request, pk=None):
        """Pažymi mokestį kaip apmokėtą"""
        violation = self.get_object()
        if not (request.user.has_role('mentor') or 
                request.user.has_role('curator') or 
                request.user.has_role('manager')):
            return Response(
                {'error': 'Neturite teisių keisti mokesčių statusą.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        violation.mark_penalty_as_paid()
        return Response({'message': 'Mokestis pažymėtas kaip apmokėtas.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def recalculate_penalty(self, request, pk=None):
        """Perskaičiuoja mokesčio dydį"""
        violation = self.get_object()
        if not (request.user.has_role('mentor') or 
                request.user.has_role('curator') or 
                request.user.has_role('manager')):
            return Response(
                {'error': 'Neturite teisių perskaičiuoti mokesčius.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        violation.recalculate_penalty()
        return Response({'message': 'Mokestis perskaičiuotas.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def violation_stats(request):
    """
    Pažeidimų statistika - grąžina bendrą statistiką apie pažeidimus
    """
    # Tik mentoriai, kuratoriai ir vadovai gali matyti statistiką
    if not (request.user.has_role('mentor') or 
            request.user.has_role('curator') or 
            request.user.has_role('manager')):
        return Response(
            {'error': 'Neturite teisių matyti statistiką.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    # Filtravimas pagal parametrus
    year = request.query_params.get('year')
    month = request.query_params.get('month')
    week = request.query_params.get('week')

    queryset = Violation.objects.all()

    if year:
        queryset = queryset.filter(created_at__year=year)
    if month:
        queryset = queryset.filter(created_at__month=month)
    if week:
        # Apskaičiuoja savaitės pradžią
        week_start = timezone.now() - timedelta(weeks=int(week))
        queryset = queryset.filter(created_at__gte=week_start)

    # Bendroji statistika
    total_violations = queryset.count()
    completed_violations = queryset.filter(status=Violation.Status.COMPLETED).count()
    pending_violations = queryset.filter(status=Violation.Status.PENDING).count()
    
    total_penalty_amount = queryset.aggregate(total=Sum('penalty_amount'))['total'] or 0
    paid_penalty_amount = queryset.filter(penalty_status=Violation.PenaltyStatus.PAID).aggregate(total=Sum('penalty_amount'))['total'] or 0
    unpaid_penalty_amount = total_penalty_amount - paid_penalty_amount
    
    completion_rate = (completed_violations / total_violations * 100) if total_violations > 0 else 0
    penalty_payment_rate = (paid_penalty_amount / total_penalty_amount * 100) if total_penalty_amount > 0 else 0

    # Kategorijų statistika
    category_stats = {}
    categories = ViolationCategory.objects.filter(is_active=True)
    for category in categories:
        category_violations = queryset.filter(category=category.name)
        category_stats[category.name] = {
            'total': category_violations.count(),
            'completed': category_violations.filter(status=Violation.Status.COMPLETED).count(),
            'pending': category_violations.filter(status=Violation.Status.PENDING).count(),
            'color_type': category.color_type,
            'penalty_amount': category_violations.aggregate(total=Sum('penalty_amount'))['total'] or 0
        }

    # Mėnesio statistika (paskutiniai 12 mėnesių)
    monthly_stats = {}
    for i in range(12):
        month_date = timezone.now() - timedelta(days=30*i)
        month_violations = queryset.filter(
            created_at__year=month_date.year,
            created_at__month=month_date.month
        )
        month_key = f"{month_date.year}-{month_date.month:02d}"
        monthly_stats[month_key] = {
            'total': month_violations.count(),
            'completed': month_violations.filter(status=Violation.Status.COMPLETED).count(),
            'penalty_amount': month_violations.aggregate(total=Sum('penalty_amount'))['total'] or 0
        }

    stats_data = {
        'total_violations': total_violations,
        'completed_violations': completed_violations,
        'pending_violations': pending_violations,
        'total_penalty_amount': total_penalty_amount,
        'paid_penalty_amount': paid_penalty_amount,
        'unpaid_penalty_amount': unpaid_penalty_amount,
        'completion_rate': round(completion_rate, 2),
        'penalty_payment_rate': round(penalty_payment_rate, 2),
        'category_stats': category_stats,
        'monthly_stats': monthly_stats
    }

    serializer = ViolationStatsSerializer(stats_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def violation_category_stats(request):
    """
    Kategorijų statistika - grąžina detalią statistiką pagal kategorijas
    """
    if not (request.user.has_role('mentor') or 
            request.user.has_role('curator') or 
            request.user.has_role('manager')):
        return Response(
            {'error': 'Neturite teisių matyti statistiką.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    # Filtravimas pagal parametrus
    year = request.query_params.get('year')
    month = request.query_params.get('month')

    queryset = Violation.objects.all()
    if year:
        queryset = queryset.filter(created_at__year=year)
    if month:
        queryset = queryset.filter(created_at__month=month)

    categories = ViolationCategory.objects.filter(is_active=True)
    category_stats = []

    for category in categories:
        category_violations = queryset.filter(category=category.name)
        total_count = category_violations.count()
        completed_count = category_violations.filter(status=Violation.Status.COMPLETED).count()
        pending_count = total_count - completed_count
        
        completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0
        penalty_amount = category_violations.aggregate(total=Sum('penalty_amount'))['total'] or 0

        category_stats.append({
            'category_name': category.name,
            'color_type': category.color_type,
            'total_count': total_count,
            'completed_count': completed_count,
            'pending_count': pending_count,
            'completion_rate': round(completion_rate, 2),
            'penalty_amount': penalty_amount
        })

    serializer = ViolationCategoryStatsSerializer(category_stats, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

