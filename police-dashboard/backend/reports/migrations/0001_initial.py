from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CrimeReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(default='General report', max_length=150)),
                ('incident_type', models.CharField(blank=True, default='', max_length=150)),
                ('subcity', models.CharField(db_index=True, max_length=150)),
                ('kebele', models.CharField(blank=True, default='', max_length=150)),
                ('status', models.CharField(db_index=True, default='new', max_length=50)),
                ('description', models.TextField(blank=True, default='')),
                ('reporter_details', models.JSONField(blank=True, default=dict)),
                ('incident_details', models.JSONField(blank=True, default=dict)),
                ('supporting_details', models.JSONField(blank=True, default=dict)),
                ('raw_payload', models.JSONField(blank=True, default=dict)),
                ('evidence', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'crime_reports', 'ordering': ['-created_at']},
        ),
    ]
