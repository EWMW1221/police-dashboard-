from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0007_alter_crimereport_table'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdditionalInformationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_id', models.BigIntegerField(db_index=True)),
                ('request_message', models.TextField()),
                ('citizen_response', models.TextField(blank=True, default='')),
                ('response_evidence', models.JSONField(blank=True, default=list)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'reports_additionalinformationrequest',
                'ordering': ['-created_at'],
            },
        ),
    ]
