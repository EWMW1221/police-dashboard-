from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0008_additional_information_request'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'request_message'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'message'
                ) THEN
                    ALTER TABLE reports_additionalinformationrequest
                    RENAME COLUMN request_message TO message;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'citizen_response'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'response'
                ) THEN
                    ALTER TABLE reports_additionalinformationrequest
                    RENAME COLUMN citizen_response TO response;
                END IF;
            END $$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'message'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'request_message'
                ) THEN
                    ALTER TABLE reports_additionalinformationrequest
                    RENAME COLUMN message TO request_message;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'response'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_additionalinformationrequest'
                      AND column_name = 'citizen_response'
                ) THEN
                    ALTER TABLE reports_additionalinformationrequest
                    RENAME COLUMN response TO citizen_response;
                END IF;
            END $$;
            """,
        ),
    ]
