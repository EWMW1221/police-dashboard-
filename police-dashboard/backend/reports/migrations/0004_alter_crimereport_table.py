from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0003_alter_crimereport_options'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterModelTable(
                    name='crimereport',
                    table='reports_report',
                ),
            ],
            database_operations=[],
        ),
    ]
