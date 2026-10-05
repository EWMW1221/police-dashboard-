from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0006_reportsubmission_officer_alter_crimereport_table'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'crime_reports'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'reports_report'
                ) THEN
                    ALTER TABLE crime_reports RENAME TO reports_report;
                END IF;
            END $$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'reports_report'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'crime_reports'
                ) THEN
                    ALTER TABLE reports_report RENAME TO crime_reports;
                END IF;
            END $$;
            """,
        ),
    ]
