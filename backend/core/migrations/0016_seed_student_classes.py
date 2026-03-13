from django.db import migrations

def seed_student_classes(apps, schema_editor):
    StudentClass = apps.get_model('core', 'StudentClass')
    classes = []
    
    # INT classes (only 1)
    for ct in ['INTSE', 'INTSS', 'INTST']:
        classes.append({'class_type': ct, 'class_number': 1})
    
    # SE (1-7)
    for i in range(1, 8):
        classes.append({'class_type': 'SE', 'class_number': i})
        
    # SS (1-24)
    for i in range(1, 25):
        classes.append({'class_type': 'SS', 'class_number': i})
        
    # ST (1-24)
    for i in range(1, 25):
        classes.append({'class_type': 'ST', 'class_number': i})

    for cls_data in classes:
        StudentClass.objects.update_or_create(
            class_type=cls_data['class_type'],
            class_number=cls_data['class_number']
        )

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0015_studentclass'),
    ]
    operations = [
        migrations.RunPython(seed_student_classes),
    ]
