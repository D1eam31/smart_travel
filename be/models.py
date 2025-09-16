from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class wxuserModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    open_id = models.CharField('open_id',max_length=255)
    session_key = models.CharField('session_key',max_length=255)

    def __str__(self):
        return self.open_id

    @receiver(post_save, sender=User)
    def create_save_receiver(sender, instance,created ,**kwargs):
        if created:
            wxuserModel.objects.create(user=instance)  
        