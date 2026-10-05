from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0011_additional_information_review_fields'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE reports_report
                ADD COLUMN IF NOT EXISTS language varchar(10) NOT NULL DEFAULT 'en',
                ADD COLUMN IF NOT EXISTS anonymous_email varchar(254),
                ADD COLUMN IF NOT EXISTS full_name varchar(255),
                ADD COLUMN IF NOT EXISTS email varchar(254),
                ADD COLUMN IF NOT EXISTS phone varchar(30),
                ADD COLUMN IF NOT EXISTS sex varchar(30),
                ADD COLUMN IF NOT EXISTS age integer,
                ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN IF NOT EXISTS raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
                ADD COLUMN IF NOT EXISTS incident_details jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS reporter_details jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS supporting_details jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS source_am jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS source_en jsonb NOT NULL DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS question_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
                ADD COLUMN IF NOT EXISTS tracking_number_en varchar(40),
                ADD COLUMN IF NOT EXISTS tracking_number_am varchar(40);

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'reports_reportsubmission'
                      AND column_name = 'id'
                      AND is_identity = 'YES'
                ) THEN
                    CREATE SEQUENCE IF NOT EXISTS reports_reportsubmission_id_seq;
                    PERFORM setval(
                        'reports_reportsubmission_id_seq',
                        GREATEST(COALESCE((SELECT MAX(id) FROM reports_reportsubmission), 0), 1),
                        true
                    );
                    ALTER TABLE reports_reportsubmission
                        ALTER COLUMN id SET DEFAULT nextval('reports_reportsubmission_id_seq');
                    ALTER SEQUENCE reports_reportsubmission_id_seq
                        OWNED BY reports_reportsubmission.id;
                END IF;
            END $$;

            CREATE UNIQUE INDEX IF NOT EXISTS reports_report_tracking_en_unique
                ON reports_report (tracking_number_en)
                WHERE tracking_number_en IS NOT NULL AND tracking_number_en <> '';
            CREATE UNIQUE INDEX IF NOT EXISTS reports_report_tracking_am_unique
                ON reports_report (tracking_number_am)
                WHERE tracking_number_am IS NOT NULL AND tracking_number_am <> '';
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]