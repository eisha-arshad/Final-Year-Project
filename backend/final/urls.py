from django.urls import path
from .views import (
    RegisterView,
    RoleView,
    MyTokenView,
    FilteredUserList,
    StudentInfoAPIView,
    CreateProjectView,
    CreateUserView,
    CoSupervisorsListAPIView,
    SupervisorProjectAPIView,
    StudentProjectView,
    SupervisorListView,
    UserListByRoleView,
    AllProjectsAPIView,
    AssignEvaluationView,
    EvaluationsAssignedToMe,
    ProjectCommentsView,    # ✅ Add this
    ProjectMeetingsView,  # ✅ And this
    StudentSubmissionListCreate,      # 👈 Add
    StudentSubmissionDownload,        # 👈 Add
    ProjectSubmissionsForSupervisor   # 👈 Add
)
from .views import SaveEvaluationView
from .views import AdminProjectUpdateView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CoSupervisorProjectsAPIView
from .views import DegreeListView
# from .views import StudentSubmissionDetailAPIView
# from .views import SupervisorListView
# from .views import UserListByRoleView
# from .views import SupervisorDashboardStudentSubmissionsView
# from .views import FileSubmissionView
# from .views import StudentFileSubmissionsAPIView 
# from .views import (
#     AllProjectsView, AssignEvaluationView, SupervisorEvaluationListView)
from .views import ProjectEvaluationView 
from .views import AllProjectsAPIView
urlpatterns = [
    path('token/', MyTokenView.as_view(), name='token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('get-role/', RoleView.as_view(), name='get-role'),
    path('create-user/', CreateUserView.as_view(), name='create-user'),
     path('users/', UserListByRoleView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('manage-users/', FilteredUserList.as_view(), name='manage-users'),
    path('manage-users/<int:user_id>/', FilteredUserList.as_view(), name='delete-user'),
    path('student-info/<str:sap_id>/', StudentInfoAPIView.as_view(), name='student-info'),
    path('create-project/', CreateProjectView.as_view(), name='create-project'),
    path('supervisor-project/', SupervisorProjectAPIView.as_view(), name='supervisor-project'),
    path('student-project/', StudentProjectView.as_view(), name='student-project-detail'),
    path('co-supervisors/', CoSupervisorsListAPIView.as_view(), name='co-supervisors'),
    path('supervisors/', SupervisorListView.as_view(), name='supervisor-list'),
    # path('student-submission/', StudentSubmissionDetailAPIView.as_view(), name='student-submission'),
    path("all-projects/", AllProjectsAPIView.as_view(), name="all-projects"),
      path("assign-evaluation/", AssignEvaluationView.as_view(), name="assign-evaluation"),
      path("evaluations/assigned-to-me/", EvaluationsAssignedToMe.as_view(), name="evaluations-assigned-to-me"),
      path("projects/<int:pk>/comments/", ProjectCommentsView.as_view(), name="project-comments"),
      path("projects/<int:pk>/meetings/", ProjectMeetingsView.as_view(), name="project-meetings"),
      path("student/submissions/", StudentSubmissionListCreate.as_view(), name="student-submissions"),
      path("student/submissions/download/<int:pk>/", StudentSubmissionDownload.as_view()),
      path("projects/<int:pk>/submissions/", ProjectSubmissionsForSupervisor.as_view()),
    #   path('projects/<int:project_id>/evaluation/', SaveEvaluationView.as_view(), name='save-evaluation'),
    path('projects/<int:pk>/evaluation/', ProjectEvaluationView.as_view(), name='project-evaluation'),
    path("projects/<int:pk>/admin/", AdminProjectUpdateView.as_view(), name="project-admin-update"),
    path('co-supervisor-projects/', CoSupervisorProjectsAPIView.as_view(), name='co-supervisor-projects'),
    path("degrees/", DegreeListView.as_view(), name="degree-list"),



]
