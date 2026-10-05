from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0013_report_status_history'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE reports_additionalinformationrequest
                ADD COLUMN IF NOT EXISTS response_evidence jsonb NOT NULL DEFAULT '[]'::jsonb;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]