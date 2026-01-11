from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# =========================================================
# 1️⃣ USER MANAGER
# =========================================================
class UserManager(BaseUserManager):
    """Custom manager for User model with email as username"""
    
    def get_by_natural_key(self, email):
        """Get user by email (natural key)"""
        return self.get(email=email)
    
    def create_user(self, email, name, password=None, **extra_fields):
        """Create and return a regular user"""
        if not email:
            raise ValueError('Users must have an email address')
        if not name:
            raise ValueError('Users must have a name')
        
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password=None, **extra_fields):
        """Create and return a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, name, password, **extra_fields)


# =========================================================
# 1️⃣ USER
# =========================================================
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    profilePicture = models.URLField(blank=True, null=True)
    preferences = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name} ({self.role})"
    
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser
    
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser




# =========================================================
# 2️⃣ COURSE dan ENROLLMENT
# =========================================================
class Course(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    metadata = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    progress = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.name} - {self.course.title}"


# =========================================================
# 3️⃣ MODULE
# =========================================================
class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150)
    content = models.FileField(upload_to='modules/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.course.title})"


# =========================================================
# 4️⃣ PRETEST dan QUESTION
# =========================================================
class Pretest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pretests')
    score = models.FloatField(default=0.0)
    result = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Pretest {self.id} - {self.user.name}"


class PretestQuestion(models.Model):
    TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]
    question = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    score = models.FloatField(default=1.0)
    result = models.CharField(max_length=100, blank=True, null=True)
    option = models.JSONField(default=list, blank=True)
    correctAns = models.TextField()
    scaleMin = models.IntegerField(default=0)
    scaleMax = models.IntegerField(default=10)

    def __str__(self):
        return f"Q{self.id}: {self.question[:40]}"


class PretestResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pretest_responses')
    question = models.ForeignKey(PretestQuestion, on_delete=models.CASCADE, related_name='responses')
    response_value = models.IntegerField(blank=True, null=True)
    answer = models.BooleanField(default=False)

    def __str__(self):
        return f"Response by {self.user.name} - Q{self.question.id}"


# =========================================================
# 5️⃣ QUIZ, QUESTION, RESPONSE, FEEDBACK, HINTS
# =========================================================
class Quiz(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='quiz')
    createdDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz for {self.course.title}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    solution = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"QuizQ{self.id} ({self.quiz.course.title})"


class Feedback(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='feedbacks')
    feedback = models.TextField()

    def __str__(self):
        return f"Feedback {self.id} for {self.quiz.course.title}"


class Hints(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='hints')
    hintText = models.TextField()

    def __str__(self):
        return f"Hint {self.id} for {self.quiz.course.title}"


class QuizResponse(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_responses')
    userAns = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    feedback = models.ForeignKey(Feedback, on_delete=models.SET_NULL, null=True, blank=True)
    hint = models.ForeignKey(Hints, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Response by {self.user.name} - {self.quiz.course.title}"
