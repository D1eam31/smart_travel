from django.shortcuts import render,get_object_or_404
from login.models import *
from login.serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions,viewsets,authentication
from rest_framework.decorators import action
from login.wx_permission import *
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
import requests
from login.config import *
from django.contrib.auth.models import User
import random
import string

def get_wechat_login_code_url(code):
        return f"https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type={grant_type}"

# Create your views here.
class WeChatLoginAPIView(APIView):
    '''
        Mini Program Login
        @params:
        str:code
    '''
    permission_classes = []

    def post(self, request):
        code = request.data.get('code', None)
        if not code:
            return Response({"code": "This field is required"}, status=status.HTTP_400_BAD_REQUEST)
        url = get_wechat_login_code_url(code)
        resp = requests.get(url)

        openid = None
        session_key = None
        unionid = None
        if resp.status_code != 200:
            return Response({"error": "WeChat server return error, please try again later"})
        else:
            json = resp.json()
            if "errcode" in json:
                return Response({"error": json["errmsg"]})
            else:
                openid = json['openid']
                session_key = json['session_key']

            if "unionid" in json:
                unionid = json['unionid']

        if not session_key:
            return Response({"error": "WeChat server doesn't return session key"})
        if not openid:
            return Response({"error": "WeChat server doesn't return openid"})

        user = User.objects.filter(username=openid).first()
        if not user:
            user = User()
            user.username = openid
            password = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(10))
            user.set_password(password)
            user.save()

        user.wxusermodel.session_key = session_key
        user.wxusermodel.open_id = openid
        user.wxusermodel.save()
        user.save()
        
        token, created = Token.objects.get_or_create(user=user)
        if created:

            return Response({
                'token': token.key,
                'user_id': user.id
            })
        else:
            Token.objects.get(user=user).delete()
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'token': token.key,
                'user_id': user.id
            })


class UserViewset(viewsets.ModelViewSet):
    '''
        所有用户视图，root用户权限
        '''
    authentication_classes = (authentication.BasicAuthentication,)
    permission_classes = (NoPermisson,)
    serializer_class = UserSerializer
    queryset  = User.objects.all()


class WxuserViewset(viewsets.ModelViewSet):
    '''
        wx用户的视图，管理员查看权限
        '''
    authentication_classes = (authentication.BasicAuthentication,)
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = wxuserSerializer
    queryset  = wxuserModel.objects.all()