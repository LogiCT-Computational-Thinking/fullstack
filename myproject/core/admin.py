from django.contrib import admin
from .models import (
    User,
    Course,
    Module,
    Quiz,
    Material,
    QuizQuestion,
    QuizResult,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "role")
    search_fields = ("name", "email", "role")


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "course")
    list_filter = ("course",)
    inlines = [QuizQuestionInline]


class MaterialInline(admin.TabularInline):
    model = Material
    extra = 1

class QuizInline(admin.StackedInline):
    model = Quiz
    extra = 0

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)
    inlines = [MaterialInline, QuizInline]


from .models import Pretest, PretestQuestion, PretestResponse

@admin.register(PretestQuestion)
class PretestQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "type", "category", "level")
    list_filter = ("category", "level", "type")
    search_fields = ("question",)

@admin.register(Pretest)
class PretestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "result", "score")
    list_filter = ("result",)

@admin.register(PretestResponse)
class PretestResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "question", "answer", "response_value")

from .models import ProfilingArchetype

@admin.register(ProfilingArchetype)
class ProfilingArchetypeAdmin(admin.ModelAdmin):
    list_display = ("code", "archetype_name")
    search_fields = ("code", "archetype_name")


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "title", "week", "created_at")
    list_filter = ("course", "week")
    search_fields = ("title",)


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "quiz", "score", "total_score", "percentage", "passed", "completed_at")
    list_filter = ("passed", "quiz")
    search_fields = ("user__name", "user__email")
