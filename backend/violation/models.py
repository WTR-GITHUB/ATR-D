# backend/violation/models.py

# Violation models for A-DIENYNAS system
# Defines violation management models for tracking student debts and violations with penalty fee logic
# CHANGE: Updated violation application with penalty fee logic and violation ranges configuration

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class ViolationCategory(models.Model):
    """
    Kategorijos modelis skolų ir pažeidimų klasifikavimui
    Pvz.: "Mokestis", "Bauda", "Inventorius", "Uniforma"
    """
    name = models.CharField(
        max_length=50, 
        unique=True,
        verbose_name="Kategorijos pavadinimas"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Aprašymas"
    )
    color_type = models.CharField(
        max_length=20,
        choices=[
            ('DEFAULT', 'Default'),
            ('RED', 'Raudona'),
            ('BLUE', 'Mėlyna'),
            ('YELLOW', 'Geltona'),
            ('ORANGE', 'Oranžinė'),
            ('PURPLE', 'Violetinė'),
            ('GREEN', 'Žalia'),
            ('DARK_GREEN', 'Tamsiai žalia'),
            ('AMBER', 'Geltona-oranžinė'),
            ('DARK_RED', 'Tamsiai raudona'),
        ],
        default='DEFAULT',
        help_text="Spalvos tipas kategorijai. Naudojama lentelės eilutėms spalvinti.",
        verbose_name="Spalvos tipas"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Aktyvi"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Sukurta"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atnaujinta"
    )

    class Meta:
        verbose_name = "Pažeidimo kategorija"
        verbose_name_plural = "Pažeidimo kategorijos"
        ordering = ['name']

    def __str__(self):
        return self.name


class ViolationType(models.Model):
    """
    Pažeidimo tipo modelis konkrečiam pažeidimui aprašyti
    Pvz.: "Pavėlavimas", "Namų darbų neatlikimas", "Elgesio pažeidimas"
    """
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Tipo pavadinimas"
    )
    category = models.ForeignKey(
        ViolationCategory,
        on_delete=models.CASCADE,
        related_name='violation_types',
        verbose_name="Kategorija"
    )
    default_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Numatytoji suma"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Aprašymas"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Aktyvi"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Sukurta"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atnaujinta"
    )

    class Meta:
        verbose_name = "Pažeidimo tipas"
        verbose_name_plural = "Pažeidimo tipai"
        ordering = ['category__name', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class ViolationRange(models.Model):
    """
    Pažeidimų rėžių modelis mokesčių skaičiavimui
    Nustato nuo kurio pažeidimo skaičiaus priskirti piniginę sumą
    Pvz.: 1-7 pažeidimai = 0€, 8+ pažeidimai = 1€
    """
    name = models.CharField(
        max_length=100,
        verbose_name="Rėžio pavadinimas"
    )
    min_violations = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Minimalus pažeidimų skaičius"
    )
    max_violations = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Maksimalus pažeidimų skaičius (palikti tuščią jei neribotas)"
    )
    penalty_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Mokesčio dydis (€)"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Aktyvus"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Sukurta"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atnaujinta"
    )

    class Meta:
        verbose_name = "Pažeidimų rėžis"
        verbose_name_plural = "Pažeidimų rėžiai"
        ordering = ['min_violations']
        constraints = [
            models.CheckConstraint(
                check=models.Q(max_violations__isnull=True) | models.Q(max_violations__gte=models.F('min_violations')),
                name='max_violations_gte_min_violations'
            )
        ]

    def __str__(self):
        if self.max_violations:
            return f"{self.name}: {self.min_violations}-{self.max_violations} pažeidimai = {self.penalty_amount}€"
        else:
            return f"{self.name}: {self.min_violations}+ pažeidimai = {self.penalty_amount}€"

    def matches_violation_count(self, count):
        """
        Patikrina ar pažeidimų skaičius atitinka šį rėžį
        """
        if count < self.min_violations:
            return False
        if self.max_violations and count > self.max_violations:
            return False
        return True

    @classmethod
    def get_penalty_for_violation_count(cls, count):
        """
        Grąžina mokesčio dydį pagal pažeidimų skaičių
        """
        try:
            range_obj = cls.objects.filter(
                is_active=True,
                min_violations__lte=count
            ).filter(
                models.Q(max_violations__isnull=True) | models.Q(max_violations__gte=count)
            ).order_by('-min_violations').first()
            
            return range_obj.penalty_amount if range_obj else 0
        except cls.DoesNotExist:
            return 0


class Violation(models.Model):
    """
    Pagrindinis pažeidimo/skolos modelis
    Saugo informaciją apie mokinių skolas ir pažeidimus su mokesčių logika
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Neatlikta'
        COMPLETED = 'completed', 'Skola išpirkta'

    class PenaltyStatus(models.TextChoices):
        UNPAID = 'unpaid', 'Neapmokėta'
        PAID = 'paid', 'Apmokėta'

    # Pagrindinė informacija
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='violations',
        verbose_name="Mokinys"
    )
    violation_type = models.CharField(
        max_length=50,
        verbose_name="Pažeidimo tipas"
    )
    description = models.TextField(
        verbose_name="Aprašymas"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Suma"
    )
    currency = models.CharField(
        max_length=3,
        default='EUR',
        verbose_name="Valiuta"
    )
    
    # Statusas ir datos
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Užduoties statusas"
    )
    penalty_status = models.CharField(
        max_length=20,
        choices=PenaltyStatus.choices,
        default=PenaltyStatus.UNPAID,
        verbose_name="Mokesčio statusas"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Sukurta"
    )
    task_completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Užduotis atlikta"
    )
    penalty_paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Mokestis apmokėtas"
    )
    
    # Kategorijos
    category = models.CharField(
        max_length=50,
        verbose_name="Kategorija"
    )
    
    # Pažeidimų skaičiavimas
    violation_count = models.PositiveIntegerField(
        default=1,
        verbose_name="Pažeidimų skaičius mokiniui"
    )
    penalty_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Mokesčio dydis (€)"
    )
    
    # Papildoma informacija
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_violations',
        verbose_name="Sukūrė"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Papildomi komentarai"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atnaujinta"
    )

    class Meta:
        verbose_name = "Pažeidimas/Skola"
        verbose_name_plural = "Pažeidimai/Skolos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['student', 'penalty_status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['violation_count']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.category} ({self.amount} {self.currency})"

    def save(self, *args, **kwargs):
        """
        Automatiškai atnaujina task_completed_at laukus ir mokesčio logiką
        """
        from django.utils import timezone
        
        # Atnaujina task_completed_at lauką kai statusas keičiamas į 'completed'
        if self.status == self.Status.COMPLETED and not self.task_completed_at:
            self.task_completed_at = timezone.now()
        elif self.status != self.Status.COMPLETED:
            self.task_completed_at = None
            
        # Atnaujina penalty_paid_at lauką kai mokesčio statusas keičiamas į 'paid'
        if self.penalty_status == self.PenaltyStatus.PAID and not self.penalty_paid_at:
            self.penalty_paid_at = timezone.now()
        elif self.penalty_status != self.PenaltyStatus.PAID:
            self.penalty_paid_at = None
            
        # Automatiškai nustato mokesčio statusą jei mokesčio dydis 0€
        if self.penalty_amount == 0:
            self.penalty_status = self.PenaltyStatus.PAID
            
        # Skaičiuoja pažeidimų skaičių mokiniui
        if not self.pk:  # Jei naujas įrašas
            self.violation_count = self.get_student_violation_count()
            self.penalty_amount = ViolationRange.get_penalty_for_violation_count(self.violation_count)
            
        super().save(*args, **kwargs)

    def get_student_violation_count(self):
        """
        Grąžina mokinio pažeidimų skaičių
        """
        return Violation.objects.filter(
            student=self.student,
            status__in=[self.Status.PENDING, self.Status.COMPLETED]
        ).count() + 1  # +1 nes įskaitome ir šį pažeidimą

    @property
    def is_overdue(self):
        """
        Patikrina ar užduotis pavėluota (nebenaudojama, bet paliekama suderinamumui)
        """
        return False  # Nebėra due_date lauko

    @property
    def is_fully_paid(self):
        """
        Patikrina ar skola visiškai išpirkta (ir užduotis atlikta ir mokestis apmokėtas)
        """
        return (self.status == self.Status.COMPLETED and 
                self.penalty_status == self.PenaltyStatus.PAID)

    def mark_as_completed(self):
        """
        Pažymi užduotį kaip atliktą (skola išpirkta)
        """
        self.status = self.Status.COMPLETED
        self.save()

    def mark_penalty_as_paid(self):
        """
        Pažymi mokestį kaip apmokėtą
        """
        self.penalty_status = self.PenaltyStatus.PAID
        self.save()

    def recalculate_penalty(self):
        """
        Perskaičiuoja mokesčio dydį pagal dabartinį pažeidimų skaičių
        """
        self.violation_count = self.get_student_violation_count()
        self.penalty_amount = ViolationRange.get_penalty_for_violation_count(self.violation_count)
        self.save()