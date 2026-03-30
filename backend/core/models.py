from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# =========================================================
# 1️⃣ USER MANAGER
# =========================================================
class UserManager(BaseUserManager):
    def get_by_natural_key(self, email):
        return self.get(email=email)

    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, name, password, **extra_fields)

# =========================================================
# 2️⃣ USER MODEL
# =========================================================
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Student Information Fields
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    student_class = models.CharField(max_length=50, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True) # NIM
    
    profilePicture = models.URLField(blank=True, null=True)
    preferences = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_profiled = models.BooleanField(default=False)
    
    # CT Framework Proficiency Percentages
    ct_decomposition = models.FloatField(default=0.0)
    ct_abstraction = models.FloatField(default=0.0)
    ct_pattern = models.FloatField(default=0.0)
    ct_algorithm = models.FloatField(default=0.0)

    # Cognitive Traits (0-100, where 50 is center)
    cog_tp_value = models.FloatField(default=50.0)
    cog_ga_value = models.FloatField(default=50.0)
    cog_ir_value = models.FloatField(default=50.0)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name or self.email} ({self.role})"

    @property
    def archetype_info(self):
        """Returns the archetype details based on the user's preferences (last 3 chars)"""
        if not self.preferences or len(self.preferences) < 3:
            return None
        
        # Taking the last 3 characters (e.g., "2TAR" -> "TAR")
        archetype_code = self.preferences[-3:].upper()
        return ProfilingArchetype.objects.filter(code=archetype_code).first()



# =========================================================
# 2️⃣ COURSE dan ENROLLMENT
# =========================================================
class Course(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    week = models.IntegerField(default=1, help_text='Minggu ke berapa course ini dijalankan')
    thumbnail = models.URLField(blank=True, null=True)
    metadata = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text='Jika False, course tidak ditampilkan ke student')

    class Meta:
        ordering = ['week', 'id']

    def __str__(self):
        return f"Week {self.week} - {self.title}"



class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    progress = models.FloatField(default=0.0)
    enrolled_at = models.DateTimeField(auto_now_add=True)    # Kapan mulai enroll
    quiz_completed = models.BooleanField(default=False)      # Apakah quiz sudah dikerjakan

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.name} - {self.course.title}"

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
        ('multiple_choice_image', 'Multiple Choice (Images)'),
        ('multi_select', 'Multi Select (Checkboxes)'),
        ('multi_select_image', 'Multi Select (Images)'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer / Essay'),
        ('scale', 'Scale (1-6)'),
    ]
    CATEGORY_CHOICES = [
        ('GENERAL', 'General Pretest'),
        ('PROFILING_PEDAGOGY', 'Profiling: Pedagogy'),
        ('PROFILING_COGNITIVE_TP', 'Profiling: Cognitive TP'),
        ('PROFILING_COGNITIVE_GA', 'Profiling: Cognitive GA'),
        ('PROFILING_COGNITIVE_IR', 'Profiling: Cognitive IR'),
    ]
    question = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='GENERAL')
    level = models.IntegerField(default=1, help_text="Level 1-6 for Pedagogy")
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    score = models.FloatField(default=1.0)
    result = models.CharField(max_length=100, blank=True, null=True)
    option = models.JSONField(default=list, blank=True)
    correctAns = models.TextField()
    scaleMin = models.IntegerField(default=0)
    scaleMax = models.IntegerField(default=10)

    # CT Framework Weights (0-100, should total 100 across 4 fields)
    weight_decomposition = models.FloatField(default=0.0)
    weight_abstraction = models.FloatField(default=0.0)
    weight_pattern = models.FloatField(default=0.0)
    weight_algorithm = models.FloatField(default=0.0)

    def __str__(self):
        return f"Q{self.id}: {self.question[:40]}"


class PretestResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pretest_responses')
    question = models.ForeignKey(PretestQuestion, on_delete=models.CASCADE, related_name='responses')
    response_value = models.CharField(max_length=255, blank=True, null=True)
    answer = models.BooleanField(default=False)

    def __str__(self):
        return f"Response by {self.user.name} - Q{self.question.id}"


# =========================================================
# 5️⃣ PROFILING ARCHETYPE & PEDAGOGY LEVEL MAPPING
# =========================================================
class ProfilingArchetype(models.Model):
    code = models.CharField(max_length=3, unique=True, help_text="Example: PAR, PAI, TAR, etc.")
    archetype_name = models.CharField(max_length=50)
    description = models.TextField()
    cognitive_description = models.TextField(blank=True, null=True, help_text="Long description for Cognitive Description section")
    tactics = models.JSONField(default=list, blank=True, help_text="List of tactic names, e.g. ['Step-by-Step', 'Planner']")
    tactics_image = models.CharField(max_length=255, blank=True, null=True, help_text="Public path to tactics image, e.g. /images/traits/PAR 2.png")
    tactics_description = models.TextField(blank=True, null=True, help_text="Short description for the Tactics panel")
    strengths = models.JSONField(default=list, blank=True, help_text="List of strength strings")
    weaknesses = models.JSONField(default=list, blank=True, help_text="List of weakness strings")

    def __str__(self):
        return f"{self.code} - {self.archetype_name}"


class PedagogyLevel(models.Model):
    level = models.IntegerField(unique=True)
    title = models.CharField(max_length=100)

    def __str__(self):
        return f"Level {self.level} - {self.title}"


# =========================================================
# 6️⃣ QUIZ, QUESTION, RESPONSE, FEEDBACK, HINTS
# =========================================================
class Quiz(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='quiz')
    deadline = models.DateTimeField(null=True, blank=True, help_text="Batas waktu pengerjaan quiz")
    time_limit = models.IntegerField(default=1800, help_text="Batas waktu dalam detik (default 30 menit)")
    createdDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz for {self.course.title}"


class QuizQuestion(models.Model):
    TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('multiple_choice_image', 'Multiple Choice (Images)'),
        ('multi_select', 'Multi Select (Checkboxes)'),
        ('multi_select_image', 'Multi Select (Images)'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer / Essay'),
    ]
    CATEGORY_CHOICES = [
        ('GENERAL', 'General Quiz'),
        ('PROFILING_PEDAGOGY', 'Profiling: Pedagogy'),
        ('PROFILING_COGNITIVE_TP', 'Profiling: Cognitive TP'),
        ('PROFILING_COGNITIVE_GA', 'Profiling: Cognitive GA'),
        ('PROFILING_COGNITIVE_IR', 'Profiling: Cognitive IR'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='multiple_choice')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='GENERAL')
    level = models.IntegerField(default=1, help_text="Level 1-6 for Pedagogy")
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    score = models.FloatField(default=1.0)
    result = models.CharField(max_length=100, blank=True, null=True)
    option = models.JSONField(default=list, blank=True)
    correctAns = models.TextField(default='')
    solution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    cognitive_style = models.CharField(max_length=10, blank=True, null=True, help_text="Cognitive style for adaptive questions")
    admin_feedback = models.TextField(blank=True, null=True)

    # CT Framework Weights (0-100, should total 100 across 4 fields)
    weight_decomposition = models.FloatField(default=0.0)
    weight_abstraction = models.FloatField(default=0.0)
    weight_pattern = models.FloatField(default=0.0)
    weight_algorithm = models.FloatField(default=0.0)

    def __str__(self):
        return f"QuizQ{self.id} ({self.quiz.course.title})"


class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks', null=True, blank=True)
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='feedbacks', null=True, blank=True)
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.user.name if self.user else 'Unknown'} on Q{self.question.id if self.question else 'Unknown'}"


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
    is_correct = models.BooleanField(default=False)          # Apakah jawaban benar
    time_taken = models.IntegerField(default=0, help_text="Waktu pengerjaan soal dalam detik")
    timestamp = models.DateTimeField(auto_now_add=True)
    feedback = models.ForeignKey(Feedback, on_delete=models.SET_NULL, null=True, blank=True)
    hint = models.ForeignKey(Hints, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Response by {self.user.name} - {self.quiz.course.title}"


class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    score = models.FloatField(default=0.0)           # Nilai mentah
    total_score = models.FloatField(default=0.0)     # Skor maksimum
    percentage = models.FloatField(default=0.0)      # Persentase
    passed = models.BooleanField(default=False)      # Lulus atau tidak
    time_taken = models.IntegerField(default=0, help_text="Waktu pengerjaan dalam detik")
    points = models.FloatField(default=0.0, help_text="Skor gamifikasi (untuk leaderboard)")
    completed_at = models.DateTimeField(auto_now_add=True)

    def calculate_points(self):
        """
        Hitung poin leaderboard:
        1. Skor Dasar: persentase * 10 (Max 1000)
        2. Bonus Kecepatan: (time_limit - time_taken) * 0.5 (Jika cepat)
        3. Bonus Deadline: (deadline - completed_at) * 0.001 (Jika dikerjakan jauh sebelum deadline)
        """
        base_points = self.percentage * 10
        
        # Bonus Kecepatan (Max 500 poin)
        speed_bonus = 0
        if self.time_taken < self.quiz.time_limit:
            speed_bonus = (self.quiz.time_limit - self.time_taken) * 0.5
            speed_bonus = min(speed_bonus, 500)

        # Bonus Deadline (Semakin awal dari deadline, semakin tinggi)
        deadline_bonus = 0
        if self.quiz.deadline:
            time_diff = (self.quiz.deadline - self.completed_at).total_seconds()
            if time_diff > 0:
                deadline_bonus = time_diff * 0.0001 # 1 poin per jam kira-kira
                deadline_bonus = min(deadline_bonus, 500) # Cap bonus deadline

        self.points = round(max(0, base_points + speed_bonus + deadline_bonus), 2)
        return self.points

    class Meta:
        unique_together = ('user', 'quiz')   # 1 user hanya punya 1 hasil per quiz
        verbose_name = "Quiz Result"
        verbose_name_plural = "Quiz Results"

    def __str__(self):
        return f"{self.user.name} - {self.quiz.course.title} ({self.percentage:.1f}%)"


# =========================================================
# 7️⃣ STUDENT CLASS
# =========================================================
class StudentClass(models.Model):
    TYPE_CHOICES = [
        ('INTSE', 'INTSE'),
        ('INTSS', 'INTSS'),
        ('INTST', 'INTST'),
        ('SE', 'SE'),
        ('SS', 'SS'),
        ('ST', 'ST'),
    ]
    
    class_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    class_number = models.IntegerField()
    
    class Meta:
        unique_together = ('class_type', 'class_number')
        verbose_name = "Student Class"
        verbose_name_plural = "Student Classes"
        ordering = ['class_type', 'class_number']

    def __str__(self):
        return f"{self.class_type}-{self.class_number}"


# =========================================================
# 8️⃣ MATERIAL
# =========================================================
class Material(models.Model):
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('ppt', 'PowerPoint'),
        ('other', 'Other'),
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)    # Deskripsi singkat materi
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default='pdf')  # Jenis file
    file = models.FileField(upload_to='materials/')
    order = models.IntegerField(default=1)                   # Urutan jika >1 materi per minggu
    is_active = models.BooleanField(default=True)            # Apakah materi terlihat oleh mahasiswa
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Week {self.course.week} - {self.course.title} - {self.title}"


# =========================================================
# 📊 MATERIAL PROGRESS TRACKING
# =========================================================
class MaterialProgress(models.Model):
    """
    Mencatat materi yang sudah dibuka/diselesaikan oleh seorang user.
    Dibuat otomatis saat user pertama kali membuka materi tersebut.
    """
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='material_progress')
    material     = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='progress')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'material']   # 1 record per user per material
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.name} ✓ {self.material.title}"


# =========================================================
# 9️⃣ AI EXERCISE & CHATBOT HISTORY
# =========================================================

class ExerciseSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercise_sessions')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Session {self.id} for {self.user.name}"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    session = models.ForeignKey(ExerciseSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} in Session {self.session.id}"


class ExerciseQuestion(models.Model):
    session = models.ForeignKey(ExerciseSession, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    options = models.JSONField(default=list, blank=True)
    correctAns = models.TextField()
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Question for Session {self.session.id}"


class ExerciseHint(models.Model):
    question = models.ForeignKey(ExerciseQuestion, on_delete=models.CASCADE, related_name='hints')
    hint_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Hint for Question {self.question.id}"


class ExerciseResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercise_responses')
    question = models.ForeignKey(ExerciseQuestion, on_delete=models.CASCADE, related_name='responses')
    userAns = models.TextField()
    is_correct = models.BooleanField(default=False)
    feedback_from_llm = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response by {self.user.name} to Q{self.question.id}"
