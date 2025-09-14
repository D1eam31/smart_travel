from .models import *
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.HyperlinkedIdentityField):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        write_only_fields = ['password']

class wxuserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = wxuserModel
        fields = '__all__'
        extra_kwargs =  {   
                            'openId': {'write_only': True}, 
                            'session_key': {'write_only': True}, 
                            'unionId': {'write_only': True}      
                        }
