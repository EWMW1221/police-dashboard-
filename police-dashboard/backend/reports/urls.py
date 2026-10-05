from django.urls import path

from . import views

urlpatterns = [
    path('dashboard-stats', views.dashboard_stats, name='dashboard-stats'),
    path('crime-analytics', views.crime_analytics, name='crime-analytics'),
    path('reports/', views.reports, name='reports'),
    path('reports/<int:report_id>/status/', views.update_report_status, name='report-status-update'),
    path('reports/<int:report_id>/additional-information/', views.additional_information, name='additional-information'),
    path('reports/<int:report_id>/', views.report_detail, name='report-detail'),
    path('auth/dashboard/', views.dashboard_auth, name='dashboard-auth'),
    path('officers/', views.officers, name='officers'),
    path('officers/<int:officer_id>/', views.officer_detail, name='officer-detail'),
]
