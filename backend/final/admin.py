from django.contrib import admin
from .models import (
    CustomUser,
    Project,
    ProjectEvaluation,
    ProjectComment,
    ProjectMeeting,
    SubmissionFile
)

# Register your models here
admin.site.register(CustomUser)
admin.site.register(Project)
admin.site.register(ProjectEvaluation)
admin.site.register(ProjectComment)
admin.site.register(ProjectMeeting)
admin.site.register(SubmissionFile)
