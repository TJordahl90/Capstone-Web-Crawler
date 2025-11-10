from django.urls import path
from .views import (
    CreateUserView, UserProfileView, CreateVerificationView, LoginView, LogoutView,
    CsrfTokenView, AccountView, JobMatchingView, JobSearchingView, AllJobsView, DocumentView, 
    InterviewPrepChatBotView, InterviewSummaryView, BookmarkJobView, ApplicationStatusView, 
    JobStatisticsView, DeleteUserView, ResetPasswordView, KeywordsView, DashboardView, update_email_notifications
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
    path('job_searching/', AllJobsView, name='job_searching'),
    path("all_jobs/", AllJobsView, name='all_jobs'),
    path('keywords/', KeywordsView.as_view(), name="keywords"),
    path("bookmark_jobs/", BookmarkJobView.as_view(), name="bookmark_jobs_list"),
    path("bookmark_jobs/<int:job_id>/", BookmarkJobView.as_view(), name="bookmark_jobs"),
    path("documents/", DocumentView.as_view(), name="documents"),
    path("chatbot_interview/", InterviewPrepChatBotView.as_view(), name="chatbot_interview"),
    path("chatbot_summary/", InterviewSummaryView.as_view(), name="chatbot_grade"),
    path("ai_chatbot/", InterviewPrepChatBotView.as_view(), name="ai_chatbot"),
    path("application_status/<int:job_id>/", ApplicationStatusView.as_view(), name="apply"),
    path('job_statistics/', JobStatisticsView.as_view(), name='job_statistics'),
    path('delete_user/', DeleteUserView.as_view(), name="delete_user"),
    path('reset_password/', ResetPasswordView.as_view(), name='reset_password'),
    path('dashboard/', DashboardView.as_view(), name='user_dashboard'),
    path("user/notifications/email/", update_email_notifications, name="update_email_notifications")
]
