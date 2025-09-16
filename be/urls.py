from django.conf.urls import url
from login import views
from rest_framework import routers,renderers,urlpatterns

router = routers.DefaultRouter()
router.register(r'user', views.UserViewset)
router.register(r'wxuser', views.WxuserViewset)

urlpatterns = router.urls

urlpatterns.append(url(r'^login/', views.WeChatLoginAPIView.as_view(), name="login_api"))