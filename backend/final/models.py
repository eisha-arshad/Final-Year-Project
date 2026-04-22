
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.conf import settings
from django.db.models.signals import post_migrate
from django.apps import apps


class CustomUserManager(UserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Ensure email is provided; auto-fill username from email if missing.
        """
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)

        # username optional in our schema; derive from email if not given
        username = extra_fields.get("username")
        if not username:
            extra_fields["username"] = email.split("@")[0]

        return super().create_user(email=email, password=password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Superuser must be staff+superuser; also force role='admin'.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        # ensure role is admin (global admin)
        extra_fields["role"] = "admin"

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return super().create_superuser(email=email, password=password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("student", "Student"),
        ("supervisor", "Supervisor"),
    )

    # Email as login
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=100, blank=True, null=True)
    program = models.CharField(max_length=100, blank=True, null=True)

    # 🔑 Registration ID ab unique hogi
    registration_id = models.CharField(max_length=100, unique=True, blank=True, null=True)

    full_name = models.CharField(max_length=255, blank=True, null=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    class Meta:
        indexes = [
            models.Index(fields=["role"]),
            models.Index(fields=["department"]),
            models.Index(fields=["program"]),
        ]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email or self.username or f"User#{self.pk}"

    def save(self, *args, **kwargs):
        if not self.username and self.email:
            self.username = self.email.split("@")[0]
        super().save(*args, **kwargs)

    @property
    def is_dept_admin(self) -> bool:
        return self.role == "admin"

    @property
    def is_global_admin(self) -> bool:
        return bool(self.is_superuser)
# -----------------------------
# Projects & related models
# -----------------------------
class Project(models.Model):
    project_title = models.CharField(max_length=255, default="Untitled Project")
    proposal_presentation_place = models.CharField(max_length=255, null=True, blank=True)
    proposal_presentation_at    = models.DateTimeField(null=True, blank=True)
    mid_presentation_place      = models.CharField(max_length=255, null=True, blank=True)
    mid_presentation_at         = models.DateTimeField(null=True, blank=True)
    final_presentation_place    = models.CharField(max_length=255, null=True, blank=True)
    final_presentation_at       = models.DateTimeField(null=True, blank=True)
    supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'supervisor'}
    )
    co_supervisor_email = models.EmailField(blank=True, null=True)

    group_member_1 = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_member_1_projects'
    )
    group_member_2 = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_member_2_projects'
    )
    group_member_3 = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_member_3_projects'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return str(self.project_title or f"Project#{self.pk}")


# models.py
class ProjectEvaluation(models.Model):
    project  = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="evaluations")  # ⬅️ drop OneToOne
    evaluator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role':'supervisor'})
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name="assigned_evaluations")
    assigned_at = models.DateTimeField(auto_now_add=True)
    # ... keep marks/decisions/remarks per evaluator ...
    class Meta:
        unique_together = ("project","evaluator")  # prevent duplicate assignment


class ProjectComment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        who = getattr(self.author, "full_name", None) or getattr(self.author, "email", None) or "User"
        return f"Comment by {who} on {self.project}"


class ProjectMeeting(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=200)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self):
        return f"{self.title} ({self.starts_at:%Y-%m-%d})"


class SubmissionFile(models.Model):
    STEP_CHOICES = [
        ("proposal", "Proposal"),
        ("proposal_report", "Proposal Report"),
        ("proposal_presentation", "Proposal Presentation"),
        ("final_report", "Final Report"),
        ("final_presentation", "Final Presentation"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="submissions")
    step = models.CharField(max_length=32, choices=STEP_CHOICES)
    file = models.FileField(upload_to="submissions/")
    file_name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "step")
        ordering = ["uploaded_at"]

    def __str__(self):
        return f"{self.project} · {self.step} · {self.file_name}"

# models.py

class Degree(models.Model):
    department = models.CharField(max_length=50)
    program = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.department} - {self.program}"


# ---- Default Data Insert ----
def create_default_degrees(sender, **kwargs):
    if sender.name != "final":   # 👈 ensure sirf 'final' app pe chale
        return

    Degree = apps.get_model('final', 'Degree')

    defaults = [
        # CS Department
        ("CS", "BSCS"),
        ("CS", "MCS"),
        ("CS", "MSCS"),
        ("CS", "PhD-CS"),

        # SE Department
        ("SE", "BSSE"),
        ("SE", "MSSE"),
        ("SE", "PhD-SE"),
        ("SE", "Diploma-SE"),

        # IT Department
        ("IT", "BSIT"),
        ("IT", "MIT"),
        ("IT", "MSIT"),
        ("IT", "PhD-IT"),

        # Technology Department
        ("Technology", "AI"),
        ("Technology", "ES"),
        ("Technology", "IET"),
        ("Technology", "Cyber Security"),
    ]

    for dept, prog in defaults:
        Degree.objects.get_or_create(department=dept, program=prog)


# ye signal har migrate ke baad chalega
post_migrate.connect(create_default_degrees)