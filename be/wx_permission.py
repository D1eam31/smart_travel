from rest_framework import permissions

ALLOW_METHODS = ('GET', 'HEAD', 'POST','OPTIONS')

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
        允许没有权限的用户查看表单
        有权限的用户可以任意操作
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.owner == request.user

class IsOwnerOrPostOnly(permissions.BasePermission):
    """
        允许没有权限的用户查看和提交表单
        有权限的用户可以任意操作
    """
    def has_object_permission(self, request, view, obj):
        if request.method in ALLOW_METHODS:
            return True
        
        return obj.owner == request.user

class NoPermisson(permissions.BasePermission):

    def has_permission(self, request, view):
        return False