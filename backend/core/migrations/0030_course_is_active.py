from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0029_seed_courses_and_materials'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Jika False, course tidak ditampilkan ke student'),
        ),
    ]
