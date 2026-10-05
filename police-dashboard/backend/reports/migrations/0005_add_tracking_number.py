from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0004_alter_crimereport_table'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='crimereport',
                    name='tracking_number',
                    field=models.CharField(blank=True, max_length=40, null=True),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "DO $$ BEGIN "
                        "IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crime_reports') THEN "
                        "ALTER TABLE crime_reports ADD COLUMN IF NOT EXISTS tracking_number varchar(40); "
                        "UPDATE crime_reports SET tracking_number = 'CR-' || id WHERE tracking_number IS NULL OR tracking_number = ''; "
                        "ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports_report') THEN "
                        "ALTER TABLE reports_report ADD COLUMN IF NOT EXISTS tracking_number varchar(40); "
                        "UPDATE reports_report SET tracking_number = COALESCE(NULLIF(tracking_number_en, ''), NULLIF(tracking_number_am, ''), 'CR-' || id) WHERE tracking_number IS NULL OR tracking_number = ''; "
                        "END IF; END $$;"
                    ),
                    reverse_sql=(
                        "DO $$ BEGIN "
                        "IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crime_reports') THEN "
                        "ALTER TABLE crime_reports DROP COLUMN IF EXISTS tracking_number; "
                        "ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports_report') THEN "
                        "ALTER TABLE reports_report DROP COLUMN IF EXISTS tracking_number; "
                        "END IF; END $$;"
                    ),
                ),
            ],
        ),
    ]
