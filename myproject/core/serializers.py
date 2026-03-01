from rest_framework import serializers
from .models import User, Course, Quiz, QuizQuestion, Enrollment, PretestQuestion, Pretest, PretestResponse, ProfilingArchetype, StudentClass, Material
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    password = serializers.CharField(write_only=True, required=False)
    archetype_info = serializers.SerializerMethodField()

    def get_archetype_info(self, obj):
        archetype = obj.archetype_info
        if archetype:
            return ProfilingArchetypeSerializer(archetype).data
        return None
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'first_name', 'last_name', 'email', 'password', 'role', 
            'profilePicture', 'preferences', 'is_profiled', 'birth_date', 
            'gender', 'student_class', 'student_id', 'archetype_info',
            'ct_decomposition', 'ct_abstraction', 'ct_pattern', 'ct_algorithm',
            'cog_tp_value', 'cog_ga_value', 'cog_ir_value'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'profilePicture': {'required': False},
            'birth_date': {'required': False},
            'gender': {'required': False},
            'student_class': {'required': False},
            'student_id': {'required': False},
        }
    
    def create(self, validated_data):
        """Create user with hashed password"""
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update user with hashed password if provided"""
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class ProfilingArchetypeSerializer(serializers.ModelSerializer):
    """Serializer for ProfilingArchetype model"""
    class Meta:
        model = ProfilingArchetype
        fields = [
            'code', 'archetype_name', 'description',
            'cognitive_description', 'tactics', 'tactics_image',
            'tactics_description', 'strengths', 'weaknesses'
        ]


class StudentClassSerializer(serializers.ModelSerializer):
    """Serializer for StudentClass model"""
    class Meta:
        model = StudentClass
        fields = ['id', 'class_type', 'class_number']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'password_confirm', 'role']
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate(self, data):
        """Check if passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth"""
    token = serializers.CharField()
    role = serializers.ChoiceField(
        choices=['student', 'teacher'], 
        required=False,
        allow_blank=True,
        default='student'
    )


class MaterialSerializer(serializers.ModelSerializer):
    """Serializer for Material model"""
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    class Meta:
        model = Material
        fields = ['id', 'title', 'description', 'week', 'file_type', 'order', 'file', 'file_url', 'created_at', 'course']
        extra_kwargs = {
            'course': {'required': False, 'allow_null': True},
            'file': {'required': False, 'allow_null': True},
        }


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'metadata', 'is_active']



class CourseWithMaterialsSerializer(serializers.ModelSerializer):
    """Serializer for Course model with nested materials"""
    materials = MaterialSerializer(many=True, read_only=True)
    materials_count = serializers.SerializerMethodField()

    def get_materials_count(self, obj):
        return obj.materials.count()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'metadata', 'is_active', 'materials', 'materials_count']





class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for QuizQuestion model"""
    material_title = serializers.ReadOnlyField(source='material.title')
    week = serializers.ReadOnlyField(source='material.week')
    
    class Meta:
        model = QuizQuestion
        fields = '__all__'


class PretestQuestionSerializer(serializers.ModelSerializer):
    """Serializer for PretestQuestion model"""
    class Meta:
        model = PretestQuestion
        fields = ['id', 'question', 'type', 'category', 'level', 'image', 'option', 'scaleMin', 'scaleMax', 
                  'weight_decomposition', 'weight_abstraction', 'weight_pattern', 'weight_algorithm']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for Quiz model"""
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model"""
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request"""
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password"""
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer to verify OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class ResetPasswordOTPSerializer(serializers.Serializer):
    """Serializer to reset password with OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data


class ProfilingResponseSerializer(serializers.Serializer):
    """Serializer for a single profiling response"""
    question_id = serializers.IntegerField()
    answer = serializers.CharField()  # Can be MC choice or Scale value (string)


class ProfilingSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting all profiling questions"""
    responses = ProfilingResponseSerializer(many=True)


class UpdateStudentInfoSerializer(serializers.ModelSerializer):
    """Serializer for updating student information specifically"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'birth_date', 'gender', 'student_class', 'student_id']

