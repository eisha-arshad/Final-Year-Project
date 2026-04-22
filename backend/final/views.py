# from django.shortcuts import render
# from django.contrib.auth.models import User
# from rest_framework import generics



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework import status
# from .models import CustomUser
# from .serializers import RegisterSerializer, CustomTokenObtainSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .serializers import ProjectCreateSerializer


# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator

# @method_decorator(csrf_exempt, name='dispatch')
# class MyTokenView(TokenObtainPairView):
#     pass



# class RegisterView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             return Response({'message': 'User created successfully'}, status=201)
#         else:
#             print("❌ Serializer Errors:", serializer.errors)  # <--- Add this line
#             return Response(serializer.errors, status=400)

# class CustomTokenView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainSerializer

# # class RoleView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         return Response({"role": request.user.role})
# class RoleView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         role = None
#         email = user.email

#         if email.endswith('@student.uol.edu.pk'):
#             role = 'student'
#         elif email.endswith('@supervisor.uol.edu.pk'):
#             role = 'supervisor'
#         elif email.endswith('@admin.uol.edu.pk'):
#             role = 'admin'

#         full_name = f"{user.first_name} {user.last_name}".strip()
#         if not full_name:
#             full_name = None

#         return Response({
#             "role": role,
#             "email": email,
#             "name": user.username,
#             "full_name": full_name  # ✅ add this
#         })




# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .models import CustomUser
# from .models import Project

# from .serializers import RegisterSerializer
# from rest_framework import status
# from .serializers import StudentInfoSerializer
# from .serializers import UserListSerializer  # Import new serializer

# class CreateUserView(APIView):
#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def get(self, request):
#         return Response({'detail': 'GET not allowed on this endpoint'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
# class FilteredUserList(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         current_user = request.user

#         if current_user.role != "admin":
#             return Response({"error": "Only admins can view users."}, status=status.HTTP_403_FORBIDDEN)

#         users = CustomUser.objects.exclude(role="admin")
#         serialized = UserListSerializer(users, many=True)
#         return Response(serialized.data, status=status.HTTP_200_OK)

# class StudentInfoAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, sap_id):
#         try:
#             student = CustomUser.objects.get(registration_id=sap_id, role='student')
#             serializer = StudentInfoSerializer(student)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except CustomUser.DoesNotExist:  # pylint: disable=no-member
#             return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

# class CreateProjectAPIView(APIView):
#     def post(self, request):
#         try:
#             project_title = request.data.get('project_title')
#             supervisor_name = request.data.get('supervisor_name')
#             co_supervisor_email = request.data.get('co_supervisor_email')
#             group_members = request.data.get('group_members')

#             print("💬 Incoming data:", request.data)

#             # Make sure all required fields are present
#             if not all([project_title, supervisor_name, group_members]):
#                 return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

#             # Create and save your project
#             project = Project.objects.create(
#                 title=project_title,
#                 supervisor_name=supervisor_name,
#                 co_supervisor_email=co_supervisor_email,
#                 group_members=group_members
#             )

#             return Response({"message": "Project created!"}, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print("❌ Internal Server Error:", str(e))
#             return Response({"error": "Internal Server Error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# class CoSupervisorsListAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         if user.role != "supervisor":
#             return Response({"error": "Only supervisors can access this."}, status=status.HTTP_403_FORBIDDEN)

#         co_supervisors = CustomUser.objects.filter(
#             role='supervisor',
#             department=user.department
#         ).exclude(id=user.id)

#         serializer = UserListSerializer(co_supervisors, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# from django.shortcuts import render
# from django.contrib.auth.models import User
# from rest_framework import generics


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework import status
# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator

# from .models import CustomUser, Project
# from .serializers import (
#     RegisterSerializer,
#     CustomTokenObtainSerializer,
#     StudentInfoSerializer,
#     UserListSerializer,
#     ProjectSerializer
# )
# from .serializers import ProjectDetailSerializer

# @method_decorator(csrf_exempt, name='dispatch')
# class MyTokenView(TokenObtainPairView):
#     pass


# class RegisterView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'User created successfully'}, status=201)
#         else:
#             print("❌ Serializer Errors:", serializer.errors)
#             return Response(serializer.errors, status=400)


# class CustomTokenView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainSerializer


# class RoleView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         email = user.email
#         role = None

#         if email.endswith('@student.uol.edu.pk'):
#             role = 'student'
#         elif email.endswith('@supervisor.uol.edu.pk'):
#             role = 'supervisor'
#         elif email.endswith('@admin.uol.edu.pk'):
#             role = 'admin'

#         full_name = f"{user.first_name} {user.last_name}".strip()
#         if not full_name:
#             full_name = None

#         return Response({
#             "id": user.id,
#             "role": role,
#             "email": email,
#             "name": user.username,
#             "full_name": full_name
#         })


# class CreateUserView(APIView):
#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def get(self, request):
#         return Response({'detail': 'GET not allowed on this endpoint'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


# class CreateProjectView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             data = request.data.copy()
#             data['supervisor'] = request.user.id  # Automatically use logged-in supervisor
#             serializer = ProjectSerializer(data=data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({"message": "Project created successfully."}, status=201)
#             return Response(serializer.errors, status=400)
#         except Exception as e:
#             return Response({"error": "Internal error", "details": str(e)}, status=500)


# # class FilteredUserList(APIView):
# #     permission_classes = [IsAuthenticated]

# #     def get(self, request):
# #         current_user = request.user
# #         if current_user.role != "admin":
# #             return Response({"error": "Only admins can view users."}, status=status.HTTP_403_FORBIDDEN)

# #         users = CustomUser.objects.exclude(role="admin")
# #         serialized = UserListSerializer(users, many=True)
# #         return Response(serialized.data, status=status.HTTP_200_OK)

# class FilteredUserList(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, user_id=None):
#         if request.user.role != "admin":
#             return Response({"error": "Only admins can view users."}, status=status.HTTP_403_FORBIDDEN)

#         if user_id:
#             try:
#                 user = CustomUser.objects.get(id=user_id)
#                 serializer = RegisterSerializer(user)
#                 return Response(serializer.data, status=200)
#             except CustomUser.DoesNotExist:
#                 return Response({"error": "User not found."}, status=404)

#         users = CustomUser.objects.exclude(role="admin")
#         serializer = UserListSerializer(users, many=True)
#         return Response(serializer.data, status=200)

#     def put(self, request, user_id=None):
#         if request.user.role != "admin":
#             return Response({"error": "Only admins can update users."}, status=403)

#         try:
#             user = CustomUser.objects.get(id=user_id)
#         except CustomUser.DoesNotExist:
#             return Response({"error": "User not found."}, status=404)

#         data = request.data.copy()
#         password = data.pop("password", None)

#         serializer = RegisterSerializer(user, data=data, partial=True)
#         if serializer.is_valid():
#             user = serializer.save()
#             if password:
#                 user.set_password(password)
#                 user.save()
#             return Response({"message": "User updated successfully"}, status=200)
#         return Response(serializer.errors, status=400)

#     def delete(self, request, user_id=None):
#         if request.user.role != "admin":
#             return Response({"error": "Only admins can delete users."}, status=403)

#         try:
#             user = CustomUser.objects.get(id=user_id)
#             user.delete()
#             return Response({"message": "User deleted successfully"}, status=204)
#         except CustomUser.DoesNotExist:
#             return Response({"error": "User not found."}, status=404)


# class StudentInfoAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, sap_id):
#         try:
#             student = CustomUser.objects.get(registration_id=sap_id, role='student')
#             serializer = StudentInfoSerializer(student)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except CustomUser.DoesNotExist:
#             return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)


# class CoSupervisorsListAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         if user.role != "supervisor":
#             return Response({"error": "Only supervisors can access this."}, status=status.HTTP_403_FORBIDDEN)

#         co_supervisors = CustomUser.objects.filter(
#             role='supervisor',
#             department=user.department
#         ).exclude(id=user.id)

#         serializer = UserListSerializer(co_supervisors, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class SupervisorProjectDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         try:
#             project = Project.objects.get(supervisor=user)
#             serializer = ProjectSerializer(project)  # You can swap this for ProjectDetailSerializer if needed
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Project.DoesNotExist:
#             return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

# class SupervisorProjectAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role != "supervisor":
#             return Response({"detail": "Forbidden"}, status=403)

#         projects = Project.objects.filter(supervisor=request.user)
#         serializer = ProjectDetailSerializer(projects, many=True)
#         return Response(serializer.data)

# # views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import permissions, status
# from .models import Project
# from .serializers import ProjectSerializer
# from django.db.models import Q
# from rest_framework import generics, permissions
# from .models import ProjectSubmission
# from .serializers import ProjectSubmissionSerializer
# class StudentProjectView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         project = Project.objects.filter(
#             Q(group_member_1=user) | Q(group_member_2=user) | Q(group_member_3=user)
#         ).first()

#         if not project:
#             return Response({"error": "No project found."}, status=404)

#         serializer = ProjectSerializer(project)
#         return Response(serializer.data)


# class StudentProjectSubmissionView(generics.RetrieveUpdateAPIView):
#     serializer_class = ProjectSubmissionSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_object(self):
#         submission, created = ProjectSubmission.objects.get_or_create(student=self.request.user)
#         return submission

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import PermissionDenied
from django.utils.dateparse import parse_datetime
from .models import CustomUser, Project
from .models import Project, ProjectEvaluation, ProjectComment, ProjectMeeting
from .serializers import ProjectCommentSerializer, ProjectMeetingSerializer
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainSerializer,
    StudentInfoSerializer,
    UserListSerializer,
    ProjectSerializer,
    ProjectDetailSerializer
    # UserSerializer
)
from django.db import models
from .serializers import UserListSerializer
from .models import SubmissionFile
from .serializers import SubmissionFileSerializer
from .serializers import ProjectCreateSerializer
from .serializers import ProjectEvaluationSerializer
from .models import Degree
from .serializers import DegreeSerializer

from rest_framework.decorators import api_view, permission_classes


def is_global_admin(user):
    
    return getattr(user, "role", None) == "admin"

def is_dept_admin(user):
    return getattr(user, "is_superuser", False) or getattr(user, "role", None) == "admin"

# views.py (permissions for Co-Supervisors)
def user_can_access_project(user, project):
    # Check if user is supervisor, co-supervisor, or group member
    if project.supervisor == user or project.co_supervisor_email == user.email:
        return True
    if user.id in [project.group_member_1_id, project.group_member_2_id, project.group_member_3_id]:
        return True
    return False

@method_decorator(csrf_exempt, name='dispatch')
class MyTokenView(TokenObtainPairView):
    pass

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=201)
        return Response(serializer.errors, status=400)

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer
class RoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        # Prefer CustomUser.full_name, else Django get_full_name(), else username, else email ka prefix
        display_name = (
            (u.full_name or "") 
            or (u.get_full_name() or "") 
            or (u.username or "") 
            or (u.email.split("@")[0] if u.email else "")
        ).strip()

        return Response({
            "id": u.id,
            "role": u.role,                 # "admin" | "supervisor" | "student"
            "is_superuser": u.is_superuser,
            "email": u.email,
            "username": u.username,
            "full_name": display_name,      # <-- always a good value now
            "department": u.department,
            "program": u.program,
        })

class CreateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        creator = request.user
        data = request.data.copy()

        # SUPERUSER: can create any role in any department
        if creator.is_superuser:
            pass

        elif creator.role == "admin":
            if data.get("role") not in ["admin", "supervisor", "student"]:
                return Response({"detail": "Not allowed."}, status=403)
            # Force creator's department
            data["department"] = creator.department
            if creator.program:
                data["program"] = creator.program

        else:
            return Response({"detail": "Forbidden"}, status=403)

        ser = RegisterSerializer(data=data)
        if ser.is_valid():
            ser.save()
            return Response({"message": "User created successfully"}, status=201)
        return Response(ser.errors, status=400)

class UserListByRoleView(ListAPIView):
    """Return list of users filtered by role"""
    serializer_class = UserListSerializer

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return CustomUser.objects.filter(role=role)
        return CustomUser.objects.all()

# class CreateProjectView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if getattr(request.user, "role", None) != "supervisor":
#             return Response({"detail": "Only supervisors can create projects."}, status=403)

#         data = request.data.copy()
#         data["supervisor"] = request.user.id  

#         ser = ProjectCreateSerializer(data=data)
#         if ser.is_valid():
#             project = ser.save()
#             return Response(ProjectDetailSerializer(project).data, status=201)

#         return Response(ser.errors, status=400)
# class CreateProjectView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if getattr(request.user, "role", None) != "supervisor":
#             return Response({"detail": "Only supervisors can create projects."}, status=403)

#         data = request.data.copy()
#         data["supervisor"] = request.user.id

#         # Check for existing project membership
#         member_fields = ["group_member_1", "group_member_2", "group_member_3"]
#         for field in member_fields:
#             member_id = data.get(field)
#             if member_id:
#                 already_in_project = Project.objects.filter(
#                     Q(group_member_1_id=member_id) |
#                     Q(group_member_2_id=member_id) |
#                     Q(group_member_3_id=member_id)
#                 ).exists()
#                 if already_in_project:
#                     student = CustomUser.objects.filter(id=member_id).first()
#                     return Response(
#                         {
#                             "detail": f"Student {student.full_name if student else member_id} is already in another project."
#                         },
#                         status=400
#                     )

#         ser = ProjectCreateSerializer(data=data)
#         if ser.is_valid():
#             project = ser.save()
#             return Response(ProjectDetailSerializer(project).data, status=201)

#         return Response(ser.errors, status=400)

class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, "role", None) != "supervisor":
            return Response({"detail": "Only supervisors can create projects."}, status=403)

        data = request.data.copy()
        # ❌ remove this line, it’s ignored by serializer fields anyway
        # data["supervisor"] = request.user.id

        # membership checks stay the same
        member_fields = ["group_member_1", "group_member_2", "group_member_3"]
        for field in member_fields:
            member_id = data.get(field)
            if member_id:
                already_in_project = Project.objects.filter(
                    Q(group_member_1_id=member_id) |
                    Q(group_member_2_id=member_id) |
                    Q(group_member_3_id=member_id)
                ).exists()
                if already_in_project:
                    student = CustomUser.objects.filter(id=member_id).first()
                    return Response(
                        {
                            "detail": f"Student {student.full_name if student else member_id} is already in another project."
                        },
                        status=400
                    )

        ser = ProjectCreateSerializer(data=data)
        if ser.is_valid():
            # ✅ inject the supervisor at save-time; DRF merges kwargs into validated_data
            project = ser.save(supervisor=request.user)
            return Response(ProjectDetailSerializer(project).data, status=201)

        return Response(ser.errors, status=400)

class FilteredUserList(APIView):
    permission_classes = [IsAuthenticated]

    def _base_queryset(self, request):
        u = request.user
        role_q = request.query_params.get("role")

        if u.is_superuser:
            # Superuser can see all except admins
            qs = CustomUser.objects.exclude(role="admin")
        elif u.role == "admin":
            # Dept admin: only own department, exclude other admins
            qs = CustomUser.objects.filter(department=u.department).exclude(role="admin")
        else:
            raise PermissionDenied("You do not have permission to view users.")

        if role_q:
            qs = qs.filter(role=role_q)
        return qs

    def get(self, request, user_id=None):
        if user_id:
            u = get_object_or_404(CustomUser, pk=user_id)
            if request.user.is_superuser:
                pass
            elif request.user.role == "admin":
                if u.department != request.user.department or u.role == "admin":
                    return Response({"error": "Only your department's non-admin users are visible."}, status=403)
            else:
                return Response({"error": "Forbidden"}, status=403)
            return Response(RegisterSerializer(u).data, status=200)

        qs = self._base_queryset(request)
        return Response(UserListSerializer(qs, many=True).data, status=200)

    def put(self, request, user_id=None):
        if not user_id:
            return Response({"error": "User ID required."}, status=400)
        target = get_object_or_404(CustomUser, pk=user_id)

        if request.user.is_superuser:
            pass
        elif request.user.role == "admin":
            if target.department != request.user.department or target.role == "admin":
                return Response({"error": "Not allowed."}, status=403)
        else:
            return Response({"error": "Forbidden"}, status=403)

        data = request.data.copy()

        # Dept admin cannot move users to another department; always force own dept
        if request.user.role == "admin":
            data["department"] = request.user.department
            if request.user.program:
                data["program"] = request.user.program

        password = data.pop("password", None)
        ser = RegisterSerializer(target, data=data, partial=True)
        if ser.is_valid():
            user = ser.save()
            if password:
                user.set_password(password)
                user.save()
            return Response({"message": "User updated successfully."}, status=200)
        return Response(ser.errors, status=400)

    def delete(self, request, user_id=None):
        if not user_id:
            return Response({"error": "User ID required."}, status=400)
        target = get_object_or_404(CustomUser, pk=user_id)

        if request.user.is_superuser:
            pass
        elif request.user.role == "admin":
            if target.department != request.user.department or target.role == "admin":
                return Response({"error": "Not allowed."}, status=403)
        else:
            return Response({"error": "Forbidden"}, status=403)

        target.delete()
        return Response({"message": "User deleted successfully."}, status=200)
class StudentInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, sap_id):
        try:
            student = CustomUser.objects.get(registration_id=sap_id, role='student')
            serializer = StudentInfoSerializer(student)
            return Response(serializer.data, status=200)
        except CustomUser.DoesNotExist:
            return Response({"error": "Student not found."}, status=404)

class CoSupervisorsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "supervisor":
            return Response({"error": "Only supervisors can access this."}, status=403)

        co_supervisors = CustomUser.objects.filter(
            role='supervisor',
            department=user.department
        ).exclude(id=user.id)

        serializer = UserListSerializer(co_supervisors, many=True)
        return Response(serializer.data, status=200)

class SupervisorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        if u.is_superuser:
            qs = CustomUser.objects.filter(role="supervisor")
        elif u.role == "admin":
            qs = CustomUser.objects.filter(role="supervisor", department=u.department)
        else:
            return Response({"error": "Only admins can view supervisors."}, status=403)
        return Response(UserListSerializer(qs, many=True).data, status=200)
class SupervisorProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            project = Project.objects.get(supervisor=user)
            serializer = ProjectSerializer(project)
            return Response(serializer.data, status=200)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

class SupervisorProjectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "supervisor":
            return Response({"detail": "Forbidden"}, status=403)

        projects = Project.objects.filter(supervisor=request.user)
        serializer = ProjectDetailSerializer(projects, many=True)
        return Response(serializer.data)

class StudentProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        project = Project.objects.filter(
            Q(group_member_1=user) | Q(group_member_2=user) | Q(group_member_3=user)
        ).first()

        if not project:
            return Response({"error": "No project found."}, status=404)

        # ⬇️ IMPORTANT: include nested evaluation + nested members
        serializer = ProjectDetailSerializer(project)
        return Response(serializer.data)

class AllProjectsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        if u.is_superuser:
            projects = Project.objects.all()
        elif u.role == "admin":
            dept = u.department
            projects = Project.objects.filter(
                Q(supervisor__department=dept) |
                Q(group_member_1__department=dept) |
                Q(group_member_2__department=dept) |
                Q(group_member_3__department=dept)
            ).distinct()
        else:
            return Response({"error": "Not allowed"}, status=403)

        return Response(ProjectDetailSerializer(projects, many=True).data, status=200)

# class ProjectEvaluationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def _can_view(self, user, project):
#         try:
#             return user_can_access_project(user, project)
#         except NameError:
#             is_admin = getattr(user, "role", None) in ["admin", "dept_admin"]
#             is_owner = project.supervisor_id == user.id
#             is_member = user.id in [
#                 project.group_member_1_id,
#                 project.group_member_2_id,
#                 project.group_member_3_id,
#             ]
#             is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=user).exists()
#             return is_admin or is_owner or is_member or is_eval

#     def _can_view(self, user, project):
#         try:
#             return user_can_access_project(user, project)
#         except NameError:
#             is_admin = getattr(user, "role", None) in ["admin", "dept_admin"]
#             is_owner = project.supervisor_id == user.id
#             is_co_supervisor = project.co_supervisor_email == user.email
#             is_member = user.id in [
#             project.group_member_1_id,
#             project.group_member_2_id,
#             project.group_member_3_id,
#         ]
#         is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=user).exists()
#         return is_admin or is_owner or is_co_supervisor or is_member or is_eval


#     def get(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if not self._can_view(request.user, project):
#             return Response({"detail": "Forbidden"}, status=403)

#         ev = ProjectEvaluation.objects.filter(project=project).first()
#         if not ev:
#             # ✅ 404 ke bajay 200 + empty
#             return Response({"project": project.id, "evaluation": None}, status=200)

#         return Response(ProjectEvaluationSerializer(ev).data, status=200)

#     def post(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if not self._can_edit(request.user, project):
#             return Response({"detail": "Forbidden"}, status=403)

#         data = request.data.copy()

#         def val(keys, default=None):
#             for k in keys:
#                 if k in data and data.get(k) is not None:
#                     return data.get(k)
#             return default

#         proposal_decision = (val(["proposal_decision"], "pass") or "pass").strip().lower()
#         proposal_marks    = int(val(["proposal_marks"], 0) or 0)
#         proposal_remarks  = val(["proposal_remarks"], "") or ""

#         mid_decision = (val(["mid_presentation_decision","mid_decision"], "pass") or "pass").strip().lower()
#         mid_marks    = int(val(["mid_presentation_marks","mid_marks"], 0) or 0)
#         mid_remarks  = val(["mid_presentation_remarks","mid_remarks"], "") or ""

#         final_decision = (val(["final_presentation_decision","final_decision"], "pass") or "pass").strip().lower()
#         final_marks    = int(val(["final_presentation_marks","final_marks"], 0) or 0)
#         final_remarks  = val(["final_presentation_remarks","final_remarks"], "") or ""

#         if proposal_decision != "pass": proposal_marks = 0
#         if mid_decision != "pass":      mid_marks = 0
#         if final_decision != "pass":    final_marks = 0

#         existing = ProjectEvaluation.objects.filter(project=project).select_related("evaluator").first()
#         evaluator = existing.evaluator if (existing and existing.evaluator_id) else request.user

#         ev, created = ProjectEvaluation.objects.update_or_create(
#             project=project,
#             defaults={
#                 "evaluator": evaluator,
#                 "proposal_marks": proposal_marks,
#                 "proposal_decision": proposal_decision,
#                 "proposal_remarks": proposal_remarks,
#                 "mid_presentation_marks": mid_marks,
#                 "mid_presentation_decision": mid_decision,
#                 "mid_presentation_remarks": mid_remarks,
#                 "final_presentation_marks": final_marks,
#                 "final_presentation_decision": final_decision,
#                 "final_presentation_remarks": final_remarks,
#             },
#         )
#         return Response(
#             ProjectEvaluationSerializer(ev).data,
#             status=201 if created else 200
#         )

class ProjectEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def _can_view(self, user, project):
        """Check who can view the evaluation"""
        is_admin = getattr(user, "role", None) in ["admin", "dept_admin"] or user.is_superuser
        is_owner = project.supervisor_id == user.id
        is_co_supervisor = project.co_supervisor_email == user.email
        is_member = user.id in [
            project.group_member_1_id,
            project.group_member_2_id,
            project.group_member_3_id,
        ]
        is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=user).exists()

        return is_admin or is_owner or is_co_supervisor or is_member or is_eval

    def _can_edit(self, user, project):
        """Check who can edit/update evaluation"""
        is_admin = getattr(user, "role", None) in ["admin", "dept_admin"] or user.is_superuser
        is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=user).exists()
        return is_admin or is_eval

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        if not self._can_view(request.user, project):
            return Response({"detail": "Forbidden"}, status=403)

        ev = ProjectEvaluation.objects.filter(project=project).first()
        if not ev:
            # ✅ return empty instead of 404
            return Response({"project": project.id, "evaluation": None}, status=200)

        return Response(ProjectEvaluationSerializer(ev).data, status=200)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        if not self._can_edit(request.user, project):
            return Response({"detail": "Forbidden"}, status=403)

        data = request.data.copy()

        def val(keys, default=None):
            for k in keys:
                if k in data and data.get(k) is not None:
                    return data.get(k)
            return default

        proposal_decision = (val(["proposal_decision"], "pass") or "pass").strip().lower()
        proposal_marks    = int(val(["proposal_marks"], 0) or 0)
        proposal_remarks  = val(["proposal_remarks"], "") or ""

        mid_decision = (val(["mid_presentation_decision","mid_decision"], "pass") or "pass").strip().lower()
        mid_marks    = int(val(["mid_presentation_marks","mid_marks"], 0) or 0)
        mid_remarks  = val(["mid_presentation_remarks","mid_remarks"], "") or ""

        final_decision = (val(["final_presentation_decision","final_decision"], "pass") or "pass").strip().lower()
        final_marks    = int(val(["final_presentation_marks","final_marks"], 0) or 0)
        final_remarks  = val(["final_presentation_remarks","final_remarks"], "") or ""

        if proposal_decision != "pass": proposal_marks = 0
        if mid_decision != "pass":      mid_marks = 0
        if final_decision != "pass":    final_marks = 0

        existing = ProjectEvaluation.objects.filter(project=project).select_related("evaluator").first()
        evaluator = existing.evaluator if (existing and existing.evaluator_id) else request.user

        ev, created = ProjectEvaluation.objects.update_or_create(
            project=project,
            defaults={
                "evaluator": evaluator,
                "proposal_marks": proposal_marks,
                "proposal_decision": proposal_decision,
                "proposal_remarks": proposal_remarks,
                "mid_presentation_marks": mid_marks,
                "mid_presentation_decision": mid_decision,
                "mid_presentation_remarks": mid_remarks,
                "final_presentation_marks": final_marks,
                "final_presentation_decision": final_decision,
                "final_presentation_remarks": final_remarks,
            },
        )
        return Response(
            ProjectEvaluationSerializer(ev).data,
            status=201 if created else 200
        )

class SaveEvaluationView(APIView):
    def post(self, request, project_id):
        try:
            project_evaluation = ProjectEvaluation.objects.get(project_id=project_id)
        except ProjectEvaluation.DoesNotExist:
            return Response({"detail": "Evaluation not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the data from the request
        proposal_marks = request.data.get('proposal_marks', 0)
        proposal_decision = request.data.get('proposal_decision', 'pass')
        proposal_remarks = request.data.get('proposal_remarks', '')
        
        mid_presentation_marks = request.data.get('mid_presentation_marks', 0)
        mid_presentation_decision = request.data.get('mid_presentation_decision', 'pass')
        mid_presentation_remarks = request.data.get('mid_presentation_remarks', '')
        
        final_presentation_marks = request.data.get('final_presentation_marks', 0)
        final_presentation_decision = request.data.get('final_presentation_decision', 'pass')
        final_presentation_remarks = request.data.get('final_presentation_remarks', '')

        # Update the project evaluation with the new values
        project_evaluation.proposal_marks = proposal_marks if proposal_decision == 'pass' else 0
        project_evaluation.proposal_decision = proposal_decision
        project_evaluation.proposal_remarks = proposal_remarks

        project_evaluation.mid_presentation_marks = mid_presentation_marks if mid_presentation_decision == 'pass' else 0
        project_evaluation.mid_presentation_decision = mid_presentation_decision
        project_evaluation.mid_presentation_remarks = mid_presentation_remarks

        project_evaluation.final_presentation_marks = final_presentation_marks if final_presentation_decision == 'pass' else 0
        project_evaluation.final_presentation_decision = final_presentation_decision
        project_evaluation.final_presentation_remarks = final_presentation_remarks

        project_evaluation.save()

        return Response(ProjectEvaluationSerializer(project_evaluation).data, status=status.HTTP_200_OK)

# views.py
class AssignEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        u = request.user
        if not (u.is_superuser or u.role == "admin"):
            return Response({"detail":"Forbidden"}, status=403)

        project_id = request.data.get("project_id")
        evaluator_id = request.data.get("evaluator_id")

        try:
            project = Project.objects.select_related(
                "supervisor","group_member_1","group_member_2","group_member_3"
            ).get(id=project_id)
            evaluator = CustomUser.objects.get(id=evaluator_id, role="supervisor")
        except (Project.DoesNotExist, CustomUser.DoesNotExist):
            return Response({"detail":"Invalid project or evaluator"}, status=400)
        if u.role == "admin" and not u.is_superuser:
            same_dept = (
                (project.supervisor and project.supervisor.department == u.department) or
                (project.group_member_1 and project.group_member_1.department == u.department) or
                (project.group_member_2 and project.group_member_2.department == u.department) or
                (project.group_member_3 and project.group_member_3.department == u.department)
            )
            if not same_dept or evaluator.department != u.department:
                return Response({"detail":"Out-of-department assignment not allowed."}, status=403)

        # max 2 projects per evaluator (existing logic)
        if ProjectEvaluation.objects.filter(evaluator=evaluator).exclude(project=project).count() >= 2:
            return Response({"detail":"This evaluator already has 2 projects"}, status=400)

        ProjectEvaluation.objects.update_or_create(
            project=project,
            defaults={"evaluator": evaluator, "assigned_by": u}
        )
        return Response({"message":"Assigned"}, status=201)

    def delete(self, request, project_id):
        u = request.user
        if u.role not in ("admin", "dept_admin"):
            return Response({"detail":"Forbidden"}, status=403)

        qs = ProjectEvaluation.objects.filter(project_id=project_id)
        if u.role == "dept_admin":
            qs = qs.filter(
                Q(project__supervisor__department=u.department) |
                Q(project__group_member_1__department=u.department) |
                Q(project__group_member_2__department=u.department) |
                Q(project__group_member_3__department=u.department)
            )
        deleted, _ = qs.delete()
        if deleted:
            return Response({"message":"Evaluation removed"}, status=200)
        return Response({"detail":"No evaluation found"}, status=404)

class EvaluationsAssignedToMe(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != "supervisor":
            return Response({"detail":"Forbidden"}, status=403)
        evals = ProjectEvaluation.objects.filter(evaluator=request.user).select_related(
            "project","project__supervisor",
            "project__group_member_1","project__group_member_2","project__group_member_3"
        )
        data = []
        for e in evals:
            p = e.project
            data.append({
                "id": p.id,
                "project_title": p.project_title,
                "assigned_at": e.assigned_at,
                "supervisor": {
                    "full_name": p.supervisor.full_name if p.supervisor else None,
                    "email": p.supervisor.email if p.supervisor else None,
                },
                "members": [
                    {"full_name": getattr(p.group_member_1,"full_name",None), "email": getattr(p.group_member_1,"email",None), "registration_id": getattr(p.group_member_1,"registration_id",None)},
                    {"full_name": getattr(p.group_member_2,"full_name",None), "email": getattr(p.group_member_2,"email",None), "registration_id": getattr(p.group_member_2,"registration_id",None)},
                    {"full_name": getattr(p.group_member_3,"full_name",None), "email": getattr(p.group_member_3,"email",None), "registration_id": getattr(p.group_member_3,"registration_id",None)},
                ]
            })
        return Response(data, status=200)

# class ProjectCommentsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if not user_can_access_project(request.user, project):
#             return Response({"detail": "Forbidden"}, status=403)

#         qs = project.comments.select_related("author").order_by("-created_at")
#         data = ProjectCommentSerializer(qs, many=True).data
#         return Response(data, status=200)

#     def post(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if not user_can_access_project(request.user, project):
#             return Response({"detail": "Forbidden"}, status=403)

#         text = (request.data.get("text") or "").strip()
#         if not text:
#             return Response({"detail": "Text is required"}, status=400)

#         c = ProjectComment.objects.create(project=project, author=request.user, text=text)
#         return Response(ProjectCommentSerializer(c).data, status=201)


class ProjectCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        # ✅ Allow Admin, Supervisor, Group Members
        if request.user.role == "admin" or request.user.is_superuser:
            pass
        elif request.user == project.supervisor:
            pass
        elif request.user in [
            project.group_member_1,
            project.group_member_2,
            project.group_member_3,
        ]:
            pass
        else:
            return Response({"detail": "Forbidden"}, status=403)

        qs = project.comments.select_related("author").order_by("-created_at")
        data = ProjectCommentSerializer(qs, many=True).data
        return Response(data, status=200)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        # ✅ Only supervisor, group members, or admin can post
        if (
            request.user != project.supervisor
            and request.user not in [
                project.group_member_1,
                project.group_member_2,
                project.group_member_3,
            ]
            and request.user.role != "admin"
            and not request.user.is_superuser
        ):
            return Response({"detail": "Forbidden"}, status=403)

        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Text is required"}, status=400)

        c = ProjectComment.objects.create(project=project, author=request.user, text=text)
        return Response(ProjectCommentSerializer(c).data, status=201)

# class ProjectMeetingsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if not user_can_access_project(request.user, project):
#             return Response({"detail": "Forbidden"}, status=403)

#         qs = project.meetings.order_by("-starts_at")
#         data = ProjectMeetingSerializer(qs, many=True).data
#         return Response(data, status=200)

#     def post(self, request, pk):
#         project = get_object_or_404(Project, pk=pk)
#         if project.supervisor_id != request.user.id:
#             return Response({"detail": "Only project supervisor can create meetings."}, status=403)

#         title = (request.data.get("title") or "").strip()
#         starts_at = request.data.get("starts_at")
#         ends_at = request.data.get("ends_at")
#         location = request.data.get("location") or ""
#         notes = request.data.get("notes") or ""

#         if not title or not starts_at:
#             return Response({"detail": "title and starts_at are required"}, status=400)
#         m = ProjectMeeting.objects.create(
#             project=project,
#             title=title,
#             starts_at=starts_at,
#             ends_at=ends_at or None,
#             location=location,
#             notes=notes,
#             created_by=request.user,
#         )
#         return Response(ProjectMeetingSerializer(m).data, status=201)
    

class ProjectMeetingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        # ✅ Allow: Admin, Supervisor, Group Members
        if request.user.role == "admin":
            pass  # admin can see all
        elif request.user == project.supervisor:
            pass  # supervisor can see
        elif request.user in [
            project.group_member_1,
            project.group_member_2,
            project.group_member_3,
        ]:
            pass  # student group member can see
        else:
            return Response({"detail": "Forbidden"}, status=403)

        qs = project.meetings.order_by("-starts_at")
        data = ProjectMeetingSerializer(qs, many=True).data
        return Response(data, status=200)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        # ✅ Only Supervisor OR Admin can create meetings
        if request.user != project.supervisor and request.user.role != "admin":
            return Response(
                {"detail": "Only project supervisor or admin can create meetings."},
                status=403,
            )

        title = (request.data.get("title") or "").strip()
        starts_at = request.data.get("starts_at")
        ends_at = request.data.get("ends_at")
        location = request.data.get("location") or ""
        notes = request.data.get("notes") or ""

        if not title or not starts_at:
            return Response({"detail": "title and starts_at are required"}, status=400)

        m = ProjectMeeting.objects.create(
            project=project,
            title=title,
            starts_at=starts_at,
            ends_at=ends_at or None,
            location=location,
            notes=notes,
            created_by=request.user,
        )
        return Response(ProjectMeetingSerializer(m).data, status=201)
class StudentSubmissionListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def _student_project(self, user):
        return Project.objects.filter(
            Q(group_member_1=user) | Q(group_member_2=user) | Q(group_member_3=user)
        ).first()

    def get(self, request):
        project = self._student_project(request.user)
        if not project:
            # empty list return so UI normal lage
            return Response([], status=200)

        qs = SubmissionFile.objects.filter(project=project).order_by("uploaded_at")
        data = SubmissionFileSerializer(qs, many=True, context={"request": request}).data
        return Response(data, status=200)

    def post(self, request):
        project = self._student_project(request.user)
        if not project:
            return Response({"detail": "No project found."}, status=404)

        step = request.data.get("step")
        f = request.FILES.get("file")
        if not step or not f:
            return Response({"detail": "step and file required"}, status=400)

        obj, _ = SubmissionFile.objects.update_or_create(
            project=project,
            step=step,
            defaults={"file": f, "file_name": f.name, "uploaded_by": request.user},
        )
        return Response(SubmissionFileSerializer(obj, context={"request": request}).data, status=201)

class StudentSubmissionDownload(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # allow student on project, its supervisor, or evaluator to download
        sf = get_object_or_404(SubmissionFile, pk=pk)
        p = sf.project
        allowed = (
            request.user.id in [p.supervisor_id, p.group_member_1_id, p.group_member_2_id, p.group_member_3_id]
            or ProjectEvaluation.objects.filter(project=p, evaluator=request.user).exists()
        )
        if not allowed:
            return Response({"detail":"Forbidden"}, status=403)
        
        # Simple streaming response:
        from django.http import FileResponse
        return FileResponse(sf.file.open("rb"), as_attachment=True, filename=sf.file_name)

class ProjectSubmissionsForSupervisor(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        # allow admin/dept_admin
        if getattr(request.user, "role", None) in ["admin", "dept_admin"]:
            pass
        else:
            # is_owner = project.supervisor_id == request.user.id
            # is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=request.user).exists()
            # if not (is_owner or is_eval):
            #     return Response({"detail":"Forbidden"}, status=403)
              is_owner = project.supervisor_id == request.user.id
              is_co_supervisor = project.co_supervisor_email == request.user.email
              is_eval = ProjectEvaluation.objects.filter(project=project, evaluator=request.user).exists()

              if not (is_owner or is_co_supervisor or is_eval):
                return Response({"detail": "Forbidden"}, status=403)


        qs = SubmissionFile.objects.filter(project=project).order_by("uploaded_at")
        data = SubmissionFileSerializer(qs, many=True, context={"request": request}).data
        return Response(data, status=200)

class AdminProjectUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        u = request.user
        if not (u.is_superuser or u.role == "admin"):
            return Response({"detail":"Forbidden"}, status=403)

        project = get_object_or_404(Project, pk=pk)

        # dept admin can only touch projects linked to own department
        if u.role == "admin" and not u.is_superuser:
            in_dept = any([
                project.supervisor and project.supervisor.department == u.department,
                project.group_member_1 and project.group_member_1.department == u.department,
                project.group_member_2 and project.group_member_2.department == u.department,
                project.group_member_3 and project.group_member_3.department == u.department,
            ])
            if not in_dept:
                return Response({"detail":"Forbidden (other department)"}, status=403)

class CoSupervisorProjectsAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access this API

    def get(self, request):
        # Ensure the user is a co-supervisor
        if request.user.role != "supervisor":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # Get projects where the current user's email matches the co-supervisor email
        projects = Project.objects.filter(co_supervisor_email=request.user.email)

        # If no projects are found, return an empty list
        if not projects:
            return Response([], status=status.HTTP_200_OK)

        # Serialize the data and return it
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class DegreeListByDepartment(generics.ListAPIView):
#     serializer_class = DegreeSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         department_code = self.request.query_params.get("department")
#         if department_code:
#             return Degree.objects.filter(department__code__iexact=department_code)
#         return Degree.objects.none()

#     def list(self, request, *args, **kwargs):
#         try:
#             queryset = self.get_queryset()
#             serializer = self.get_serializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             print(f"Error fetching degrees: {e}")
#             return Response([], status=status.HTTP_200_OK)

class DegreeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department = request.query_params.get("department")
        if department:
            degrees = Degree.objects.filter(department=department)
        else:
            degrees = Degree.objects.all()

        serializer = DegreeSerializer(degrees, many=True)
        return Response(serializer.data)