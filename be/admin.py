from django.contrib import admin
from .models import *

# Register your models here.

class WxuserAdmin(admin.ModelAdmin):
    fields = ['user','open_id','session_key']

    #list_display = 'user_id'



admin.site.register(wxuserModel,WxuserAdmin)
