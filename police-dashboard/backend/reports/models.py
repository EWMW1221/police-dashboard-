from django.db import models


class CrimeReport(models.Model):
    report_type = models.CharField(max_length=80)
    language = models.CharField(max_length=10, default='en')
    anonymous_email = models.EmailField(blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    sex = models.CharField(max_length=30, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    subcity = models.CharField(max_length=100, blank=True, null=True)
    kebele = models.CharField(max_length=100, blank=True, null=True)
    incident_type = models.CharField(max_length=150, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    reporter_details = models.JSONField(default=dict, blank=True)
    incident_details = models.JSONField(default=dict, blank=True)
    supporting_details = models.JSONField(default=dict, blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    evidence = models.JSONField(default=list, blank=True)
    source_am = models.JSONField(default=dict, blank=True)
    source_en = models.JSONField(default=dict, blank=True)
    question_answers = models.JSONField(default=list, blank=True)
    tracking_number_en = models.CharField(max_length=40, blank=True, null=True)
    tracking_number_am = models.CharField(max_length=40, blank=True, null=True)
    status = models.CharField(max_length=30, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports_report'
        ordering = ['-created_at']
        managed = False

    @property
    def tracking_number(self):
        return self.tracking_number_en or self.tracking_number_am

    def __str__(self):
        return f'{self.report_type} - {self.subcity}'


class ReportSubmission(models.Model):
    id = models.BigAutoField(primary_key=True)
    report_id = models.BigIntegerField()
    reporting_mode = models.CharField(max_length=30)
    personal_information = models.JSONField(default=dict)
    incident_information = models.JSONField(default=dict)
    question_answers = models.JSONField(default=list)
    yes_no_answers = models.JSONField(default=list)
    supporting_information = models.JSONField(default=dict)
    raw_form_data = models.JSONField(default=dict)
    evidence = models.JSONField(default=list)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'reports_reportsubmission'
        managed = False


class ReportAttachment(models.Model):
    id = models.BigAutoField(primary_key=True)
    report_id = models.BigIntegerField(db_index=True)
    file = models.CharField(max_length=500)
    field_name = models.CharField(max_length=255)
    language = models.CharField(max_length=20)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=255)
    size = models.BigIntegerField()
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'reports_reportattachment'
        managed = False


class ReportStatusHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    status = models.CharField(max_length=50)
    message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField()
    report_id = models.BigIntegerField(db_index=True)

    class Meta:
        db_table = 'reports_reportstatushistory'
        managed = False
        ordering = ['created_at']

class AdditionalInformationRequest(models.Model):
    report_id = models.BigIntegerField(db_index=True)
    request_message = models.TextField(db_column='message')
    citizen_response = models.TextField(db_column='response', blank=True, default='')
    response_evidence = models.JSONField(default=list, blank=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    requested_by = models.CharField(max_length=150, blank=True, default='')
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.CharField(max_length=150, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports_additionalinformationrequest'
        ordering = ['-created_at']


class Officer(models.Model):
    name = models.CharField(max_length=150)
    password = models.CharField(max_length=255)
    unique_number = models.CharField(max_length=50, blank=True, null=True)
    subcity = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'officers'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
