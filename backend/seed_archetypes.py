"""
Run with:
  python manage.py shell < seed_archetypes.py
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

ARCHETYPES = [
    {
        "code": "PAR",
        "archetype_name": "Architect",
        "tactics_image": "/images/traits/PAR 2.png",
        "tactics": ["Step-by-Step", "Planner"],
    },
    {
        "code": "PAI",
        "archetype_name": "Analyst",
        "tactics_image": "/images/traits/PAI 2.png",
        "tactics": ["Detail-Oriented", "Logical"],
    },
    {
        "code": "PGR",
        "archetype_name": "Strategist",
        "tactics_image": "/images/traits/PGR 2.png",
        "tactics": ["Big Picture", "Systematic"],
    },
    {
        "code": "PGI",
        "archetype_name": "Explorer",
        "tactics_image": "/images/traits/PGI 2.png",
        "tactics": ["Creative", "Adaptive"],
    },
    {
        "code": "TAR",
        "archetype_name": "Planner",
        "tactics_image": "/images/traits/TAR 2.png",
        "tactics": ["Structured", "Goal-Oriented"],
    },
    {
        "code": "TAI",
        "archetype_name": "Innovator",
        "tactics_image": "/images/traits/TAI 2.png",
        "tactics": ["Intuitive", "Fast Learner"],
    },
    {
        "code": "TGR",
        "archetype_name": "Organizer",
        "tactics_image": "/images/traits/TGR 2.png",
        "tactics": ["Methodical", "Consistent"],
    },
    {
        "code": "TGI",
        "archetype_name": "Creator",
        "tactics_image": "/images/traits/TGI 2.png",
        "tactics": ["Flexible", "Explorative"],
    },
]

for arc in ARCHETYPES:
    obj, created = ProfilingArchetype.objects.get_or_create(code=arc["code"])
    obj.archetype_name     = arc["archetype_name"]
    obj.tactics_image      = arc["tactics_image"]
    obj.tactics            = arc["tactics"]
    obj.tactics_description = LOREM
    # Only set description / cognitive_description if currently empty
    if not obj.description:
        obj.description = LOREM
    if not obj.cognitive_description:
        obj.cognitive_description = LOREM
    obj.save()
    status = "CREATED" if created else "UPDATED"
    print(f"[{status}] {obj.code} - {obj.archetype_name}  | image: {obj.tactics_image}")

print("\nDone! All archetypes seeded.")
