from django.db import migrations

def seed_pedagogy_levels(apps, schema_editor):
    PedagogyLevel = apps.get_model('core', 'PedagogyLevel')
    levels = [
        (1, "Clear learning intention"),
        (2, "Connect learning"),
        (3, "Chunk and sequence learning"),
        (4, "Check for understanding"),
        (5, "Affirmative and corrective feedback"),
        (6, "Opportunity to practise & review"),
    ]
    for level, title in levels:
        PedagogyLevel.objects.update_or_create(
            level=level,
            defaults={'title': title}
        )

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0012_pedagogylevel'),
    ]
    operations = [
        migrations.RunPython(seed_pedagogy_levels),
    ]
