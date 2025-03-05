from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Account)
admin.site.register(JobPosting)
admin.site.register(SavedJob)
admin.site.register(JobTrends)
admin.site.register(Education)