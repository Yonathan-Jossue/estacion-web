from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/ultima/", views.api_ultima, name="api_ultima"),
    path("api/historial/", views.api_historial, name="api_historial"),
]
