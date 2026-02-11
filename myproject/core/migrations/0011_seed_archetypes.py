from django.db import migrations

def seed_archetypes(apps, schema_editor):
    ProfilingArchetype = apps.get_model('core', 'ProfilingArchetype')
    archetypes = [
        ("PAR", "Architect", "Sees the tiny details in every picture and builds a plan with careful precision"),
        ("PAI", "Creator", "Loves visual tools and jumps straight into building by learning through quick and hands-on trial"),
        ("TAR", "Scholar", "Dives deep into the fine print and takes time to process every word before moving forward"),
        ("PGR", "Explorer", "Looks at the big picture through charts and maps, preferring to observe the whole landscape first"),
        ("PGI", "Artist", "Grasps the vibe and the overall visual goal instantly, reacting quickly to what they see"),
        ("TAI", "Editor", "Skims the text for specific facts and makes rapid-fire decisions based on the details"),
        ("TGI", "Scout", "Scans the headlines for the main idea and moves fast, focusing on the \"what\" rather than the \"how\""),
        ("TGR", "Strategist", "Reads between the lines to understand the big picture, weighing all options before taking a step"),
    ]
    for code, name, description in archetypes:
        ProfilingArchetype.objects.update_or_create(
            code=code,
            defaults={'archetype_name': name, 'description': description}
        )

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0010_profilingarchetype'),
    ]
    operations = [
        migrations.RunPython(seed_archetypes),
    ]
