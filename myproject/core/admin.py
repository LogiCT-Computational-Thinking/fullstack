from django.contrib import admin
from .models import (
    User,
    Course,
    Module,
    Quiz,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "role")
    search_fields = ("name", "email", "role")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id", "course")
    list_filter = ("course",)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "course")
    list_filter = ("course",)


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
