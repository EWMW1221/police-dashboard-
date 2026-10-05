from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0010_align_report_state_and_tables'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='additionalinformationrequest',
                    name='requested_by',
                    field=models.CharField(blank=True, default='', max_length=150),
                ),
                migrations.AddField(
                    model_name='additionalinformationrequest',
                    name='reviewed_at',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='additionalinformationrequest',
                    name='reviewed_by',
                    field=models.CharField(blank=True, default='', max_length=150),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    ALTER TABLE reports_additionalinformationrequest
                    ADD COLUMN IF NOT EXISTS requested_by varchar(150) NOT NULL DEFAULT '';
                    ALTER TABLE reports_additionalinformationrequest
                    ADD COLUMN IF NOT EXISTS reviewed_at timestamptz NULL;
                    ALTER TABLE reports_additionalinformationrequest
                    ADD COLUMN IF NOT EXISTS reviewed_by varchar(150) NOT NULL DEFAULT '';
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
        ),
    ]
