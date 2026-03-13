"""
Fix script: restore archetype_name yang benar + set tactics_image, tactics, tactics_description.
Hanya gunakan update_fields agar field lain (description, dll.) tidak tersentuh.

Run: python fix_archetypes_image_only.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import ProfilingArchetype

LOREM = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
    "Nullam vitae risus justo. Sed nec ultricies ipsum. "
    "Praesent sit amet sapien at nibh dictum faucibus."
)

# Data yang benar sesuai tabel dari user
ARCHETYPE_DATA = {
    "PAR": {"archetype_name": "Architect",  "tactics_image": "/images/traits/PAR 2.png", "tactics": ["Step-by-Step", "Planner"]},
    "PAI": {"archetype_name": "Creator",    "tactics_image": "/images/traits/PAI 2.png", "tactics": ["Detail-Oriented", "Logical"]},
    "TAR": {"archetype_name": "Scholar",    "tactics_image": "/images/traits/TAR 2.png", "tactics": ["Structured", "Goal-Oriented"]},
    "PGR": {"archetype_name": "Explorer",   "tactics_image": "/images/traits/PGR 2.png", "tactics": ["Big Picture", "Systematic"]},
    "PGI": {"archetype_name": "Artist",     "tactics_image": "/images/traits/PGI 2.png", "tactics": ["Creative", "Adaptive"]},
    "TAI": {"archetype_name": "Editor",     "tactics_image": "/images/traits/TAI 2.png", "tactics": ["Intuitive", "Fast Learner"]},
    "TGI": {"archetype_name": "Scout",      "tactics_image": "/images/traits/TGI 2.png", "tactics": ["Flexible", "Explorative"]},
    "TGR": {"archetype_name": "Strategist", "tactics_image": "/images/traits/TGR 2.png", "tactics": ["Methodical", "Consistent"]},
}

for code, fields in ARCHETYPE_DATA.items():
    try:
        obj = ProfilingArchetype.objects.get(code=code)
    except ProfilingArchetype.DoesNotExist:
        print(f"[SKIP] {code} - tidak ada di DB.")
        continue

    obj.archetype_name      = fields["archetype_name"]
    obj.tactics_image       = fields["tactics_image"]
    obj.tactics             = fields["tactics"]
    obj.tactics_description = LOREM

    obj.save(update_fields=["archetype_name", "tactics_image", "tactics", "tactics_description"])
    print(f"[OK] {code} -> {fields['archetype_name']} | img: {fields['tactics_image']} | tactics: {fields['tactics']}")

print("\nDone! description dan field lainnya tidak diubah.")
