from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    CustomUser,
    Project,
    SubmissionFile,
    ProjectEvaluation,
    ProjectComment,
    ProjectMeeting,
)
from .models import Degree
# ------------------ Token Serializer ------------------
class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        # expose tokens explicitly
        token = self.get_token(self.user)
        data["refresh"] = str(token)
        data["access"] = str(token.access_token)
        # attach minimal user payload
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "username": self.user.username,
            "role": self.user.role,
            "full_name": self.user.full_name,
            "department": self.user.department,
            "registration_id": self.user.registration_id,
            "program": self.user.program,
        }
        return data


# ------------------ Register Serializer ------------------
# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = [
#             "email",
#             "password",
#             "role",
#             "full_name",
#             "department",
#             "registration_id",
#             "program",
#             "username",
#         ]
#     # password stays write_only; username optional
#         extra_kwargs = {"password": {"write_only": True}, "username": {"required": False}}

#     def validate(self, attrs):
#         # Email domain policy
#         role = attrs.get("role")
#         email = (attrs.get("email") or "").lower()

#         if role == "student" and not email.endswith("@student.uol.edu.pk"):
#             raise serializers.ValidationError({"email": "Student email must be @student.uol.edu.pk"})
#         if role == "supervisor" and not email.endswith("@supervisor.uol.edu.pk"):
#             raise serializers.ValidationError({"email": "Supervisor email must be @supervisor.uol.edu.pk"})
#         if role in ["admin", "dept_admin"] and not email.endswith("@admin.uol.edu.pk"):
#             raise serializers.ValidationError({"email": "Admin/Dept Admin email must be @admin.uol.edu.pk"})

#         return attrs

#     def create(self, validated_data):
#         if not validated_data.get("username"):
#             validated_data["username"] = validated_data["email"].split("@")[0]
#         # uses AbstractUser manager create_user (hashes password)
#         return CustomUser.objects.create_user(**validated_data)


# serializers.py (RegisterSerializer only)

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "email", "password", "role", "full_name",
            "department", "registration_id", "program", "username",
        ]
        extra_kwargs = {"password": {"write_only": True}, "username": {"required": False}}

    def validate(self, attrs):
        role = attrs.get("role")
        email = (attrs.get("email") or "").lower()

        if role == "student" and not email.endswith("@student.uol.edu.pk"):
            raise serializers.ValidationError({"email": "Student email must be @student.uol.edu.pk"})
        if role == "supervisor" and not email.endswith("@supervisor.uol.edu.pk"):
            raise serializers.ValidationError({"email": "Supervisor email must be @supervisor.uol.edu.pk"})
        if role == "admin" and not email.endswith("@admin.uol.edu.pk"):
            raise serializers.ValidationError({"email": "Admin email must be @admin.uol.edu.pk"})

        return attrs

    def create(self, validated_data):
        if not validated_data.get("username"):
            validated_data["username"] = validated_data["email"].split("@")[0]
        return CustomUser.objects.create_user(**validated_data)

# ------------------ User Serializers ------------------
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "role",
            "full_name",
            "registration_id",
            "department",
            "program",
        ]


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ["id", "username", "email", "role", "first_name", "last_name"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "role",
            "first_name",
            "last_name",
            "department",
            "program",
            "registration_id",  # <-- include registration_id
            "full_name",
        ]
class StudentInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "registration_id", "email", "role", "department"]


class CustomUserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "email", "registration_id", "program"]


# ------------------ Project Serializers ------------------
# class ProjectSerializer(serializers.ModelSerializer):
#     supervisor_name = serializers.CharField(source="supervisor.get_full_name", default="N/A")
#     supervisor_email = serializers.EmailField(source="supervisor.email", default="N/A")

#     group_member_1_email = serializers.EmailField(source="group_member_1.email", default="N/A")
#     group_member_2_email = serializers.EmailField(source="group_member_2.email", default="N/A")
#     group_member_3_email = serializers.EmailField(source="group_member_3.email", default="N/A")

#     class Meta:
#         model = Project
#         fields = [
#             "id",
#             "project_title",
#             "supervisor_name",
#             "supervisor_email",
#             "co_supervisor_email",
#             "group_member_1_email",
#             "group_member_2_email",
#             "group_member_3_email",
#         ]

class ProjectSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.CharField(source="supervisor.get_full_name", default="N/A", read_only=True)
    supervisor_email = serializers.EmailField(source="supervisor.email", default="N/A", read_only=True)

    group_member_1_email = serializers.EmailField(source="group_member_1.email", default="N/A", read_only=True)
    group_member_2_email = serializers.EmailField(source="group_member_2.email", default="N/A", read_only=True)
    group_member_3_email = serializers.EmailField(source="group_member_3.email", default="N/A", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "project_title",
            "supervisor_name",
            "supervisor_email",
            "co_supervisor_email",
            "group_member_1_email",
            "group_member_2_email",
            "group_member_3_email",
        ]
        read_only_fields = fields 

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "project_title",
            "co_supervisor_email",
            "group_member_1",
            "group_member_2",
            "group_member_3",
            "supervisor", 
        ]

    def create(self, validated_data):
        """
        Override create to handle supervisor automatically (from request).
        """
        # Supervisor request se ayega (views.py me set hoga)
        return Project.objects.create(**validated_data)  # pylint: disable=no-member


class ProjectEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name  = serializers.SerializerMethodField()
    evaluator_email = serializers.SerializerMethodField()

    # SAFE output fields (model me naam different ho tab bhi crash na ho)
    proposal_marks                 = serializers.SerializerMethodField()
    proposal_decision              = serializers.SerializerMethodField()
    proposal_remarks               = serializers.SerializerMethodField()
    mid_presentation_marks         = serializers.SerializerMethodField()
    mid_presentation_decision      = serializers.SerializerMethodField()
    mid_presentation_remarks       = serializers.SerializerMethodField()
    final_presentation_marks       = serializers.SerializerMethodField()
    final_presentation_decision    = serializers.SerializerMethodField()
    final_presentation_remarks     = serializers.SerializerMethodField()

    class Meta:
        model  = ProjectEvaluation
        fields = [
            "id", "evaluator", "evaluator_name", "evaluator_email", "assigned_at",
            "proposal_marks", "proposal_decision", "proposal_remarks",
            "mid_presentation_marks", "mid_presentation_decision", "mid_presentation_remarks",
            "final_presentation_marks", "final_presentation_decision", "final_presentation_remarks",
        ]

    # ---------- helpers ----------
    def _g(self, obj, *names, default=None):
        """getattr with fallbacks, so unknown field names won't crash"""
        for n in names:
            if hasattr(obj, n):
                return getattr(obj, n)
        return default

    # evaluator meta
    def get_evaluator_name(self, obj):
        u = getattr(obj, "evaluator", None)
        return getattr(u, "full_name", None) or getattr(u, "username", None)

    def get_evaluator_email(self, obj):
        u = getattr(obj, "evaluator", None)
        return getattr(u, "email", None)

    # proposal
    def get_proposal_marks(self, obj):
        return self._g(obj, "proposal_marks", "proposal_presentation_marks", "proposal_score", "proposal_mark", default=0)

    def get_proposal_decision(self, obj):
        return self._g(obj, "proposal_decision", "proposal_presentation_decision", "proposal_status", default="pass")

    def get_proposal_remarks(self, obj):
        return self._g(obj, "proposal_remarks", "proposal_presentation_remarks", "proposal_comment", default="")

    # mid
    def get_mid_presentation_marks(self, obj):
        return self._g(obj, "mid_presentation_marks", "mid_marks", "mid_score", default=0)

    def get_mid_presentation_decision(self, obj):
        return self._g(obj, "mid_presentation_decision", "mid_decision", "mid_status", default="pass")

    def get_mid_presentation_remarks(self, obj):
        return self._g(obj, "mid_presentation_remarks", "mid_remarks", "mid_comment", default="")

    # final
    def get_final_presentation_marks(self, obj):
        return self._g(obj, "final_presentation_marks", "final_marks", "final_score", default=0)

    def get_final_presentation_decision(self, obj):
        return self._g(obj, "final_presentation_decision", "final_decision", "final_status", default="pass")

    def get_final_presentation_remarks(self, obj):
        return self._g(obj, "final_presentation_remarks", "final_remarks", "final_comment", default="")
# serializers.py
class ProjectDetailSerializer(serializers.ModelSerializer):
    supervisor       = serializers.SerializerMethodField()
    group_member_1   = serializers.SerializerMethodField()
    group_member_2   = serializers.SerializerMethodField()
    group_member_3   = serializers.SerializerMethodField()

    # 3 x place/at (methods so missing columns won't crash)
    proposal_presentation_place = serializers.SerializerMethodField()
    proposal_presentation_at    = serializers.SerializerMethodField()
    mid_presentation_place      = serializers.SerializerMethodField()
    mid_presentation_at         = serializers.SerializerMethodField()
    final_presentation_place    = serializers.SerializerMethodField()
    final_presentation_at       = serializers.SerializerMethodField()

    # optionally include nested current evaluation (list view me dikhta hai)
    evaluation = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = [
            "id", "project_title", "created_at",
            "supervisor", "group_member_1", "group_member_2", "group_member_3",
            "co_supervisor_email",
            "proposal_presentation_place", "proposal_presentation_at",
            "mid_presentation_place", "mid_presentation_at",
            "final_presentation_place", "final_presentation_at",
            "evaluation",
        ]

    # ---- helpers ----
    def _user_meta(self, u):
        if not u: return None
        return {
            "id": u.id,
            "full_name": getattr(u, "full_name", None),
            "email": getattr(u, "email", None),
            "registration_id": getattr(u, "registration_id", None),
        }

    def get_supervisor(self, obj):     return self._user_meta(getattr(obj, "supervisor", None))
    def get_group_member_1(self, obj): return self._user_meta(getattr(obj, "group_member_1", None))
    def get_group_member_2(self, obj): return self._user_meta(getattr(obj, "group_member_2", None))
    def get_group_member_3(self, obj): return self._user_meta(getattr(obj, "group_member_3", None))

    # presentations – getattr safe
    def get_proposal_presentation_place(self, obj): return getattr(obj, "proposal_presentation_place", None)
    def get_proposal_presentation_at(self, obj):    return getattr(obj, "proposal_presentation_at", None)
    def get_mid_presentation_place(self, obj):      return getattr(obj, "mid_presentation_place", None)
    def get_mid_presentation_at(self, obj):         return getattr(obj, "mid_presentation_at", None)
    def get_final_presentation_place(self, obj):    return getattr(obj, "final_presentation_place", None)
    def get_final_presentation_at(self, obj):       return getattr(obj, "final_presentation_at", None)

    def get_evaluation(self, obj):
    # Pylint ko samajh nahi aata ke Django metaclass 'objects' add karta hai
        ev = ProjectEvaluation.objects.filter(project=obj).select_related("evaluator").first()  # pylint: disable=no-member
        return ProjectEvaluationSerializer(ev).data if ev else None

class ProjectCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectComment
        fields = ["id", "text", "created_at", "author_name"]

    def get_author_name(self, obj):
        return getattr(obj.author, "full_name", None) or obj.author.email


class ProjectMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMeeting
        fields = ["id", "title", "starts_at", "ends_at", "location", "notes", "created_at"]


class SubmissionFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionFile
        fields = ["id", "step", "file_name", "file_url", "uploaded_at"]

    def get_file_url(self, obj):
        req = self.context.get("request")
        return req.build_absolute_uri(obj.file.url) if obj.file and req else None


class DegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Degree
        fields = ["id", "department", "program"]