from django.urls import path
from .views import (
    CreateUserView, UserProfileView, CreateVerificationView, LoginView, LogoutView,
    CsrfTokenView, AccountView, JobMatchingView, JobSearchingView, AllJobsView, DocumentView, 
    InterviewPrepChatBotView, InterviewGradeView, BookmarkJobView, ApplicationStatusView, 
    JobStatisticsView, DeleteUserView
)

urlpatterns = [
    path('register/', CreateUserView.as_view(), name="create_user"),
    path('login/', LoginView.as_view(), name='login_account'),
    path('logout/', LogoutView.as_view(), name='logout_account'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path("verification/", CreateVerificationView.as_view(), name="verification"),
    path('csrf/', CsrfTokenView, name='csrf'),
    path('account/', AccountView.as_view(), name='account'),
    path('job_matching/', JobMatchingView, name="job_matching"),
    path('job_searching/', JobSearchingView, name='job_searching'),
    path("all_jobs/", AllJobsView, name='all_jobs'),
    path("bookmark_jobs/", BookmarkJobView.as_view(), name="bookmark_jobs_list"),
    path("bookmark_jobs/<int:job_id>/", BookmarkJobView.as_view(), name="bookmark_jobs"),
    path("documents/", DocumentView.as_view(), name="documents"),
    path("chatbot_interview/", InterviewPrepChatBotView.as_view(), name="chatbot_interview"),
    path("chatbot_grade/", InterviewGradeView.as_view(), name="chatbot_grade"),
    path("ai_chatbot/", InterviewPrepChatBotView.as_view(), name="ai_chatbot"),
    path("application_status/<int:job_id>/", ApplicationStatusView.as_view(), name="apply"),
    path('job_statistics/', JobStatisticsView.as_view(), name='job_statistics'),
    path('delete_user/', DeleteUserView.as_view(), name="delete_user")
]
