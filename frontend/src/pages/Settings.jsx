import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Settings as SettingsIcon,
  Shield,
  Save,
  UserCircle,
  GraduationCap,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ARCHETYPE_STYLES = {
  PAR: { accent: '#3427C0', light: '#E5EAFF', text: '#1F3A8A' },
  TAI: { accent: '#27C07B', light: '#E5FFEC', text: '#059669' },
  PGR: { accent: '#27C08F', light: '#E5FFF5', text: '#0F766E' },
  PGI: { accent: '#C02778', light: '#FFE5F2', text: '#DB2777' },
  TAR: { accent: '#8827C0', light: '#F2E5FF', text: '#5B21B6' },
  TGI: { accent: '#C0A927', light: '#FFFBE5', text: '#F59E0B' },
  TGR: { accent: '#39372E', light: '#EEEEEE', text: '#374151' },
  PAI: { accent: '#C05C27', light: '#FFEFE5', text: '#F97316' }
};

export default function Settings() {
  const { user, refreshUser, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [classes, setClasses] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    student_class: user?.student_class || '',
    student_id: user?.student_id || '', // NIM
    profilePicture: user?.profilePicture || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Dynamic Archetype Styles
  const archetypeCode = (user?.archetype_info?.code || 'CT-PAR').split('-').pop();
  const theme = ARCHETYPE_STYLES[archetypeCode] || ARCHETYPE_STYLES.PAR;

  // Sync form data whenever user object changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        birth_date: user.birth_date || '',
        student_class: user.student_class || '',
        student_id: user.student_id || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const initSettings = async () => {
      // Tunggu sampai AuthContext selesai inisialisasi
      if (authLoading) return;

      // Jika tidak terotentikasi, jangan lanjut
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        // Ambil data terbaru dari DB
        await refreshUser();

        // Ambil data kelas
        const data = await authService.getStudentClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to initialize settings:', err);
        if (err?.detail?.includes('credentials')) {
          setMessage({ type: 'error', text: 'Sesi Anda habis. Silakan login kembali.' });
        }
      } finally {
        setLoading(false);
      }
    };
    initSettings();
  }, [authLoading, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.updateProfile(formData);
      await refreshUser(); // Sync context
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: typeof err === 'string' ? err : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const data = await authService.uploadProfilePhoto(formDataUpload);
      await refreshUser();
      setFormData(prev => ({ ...prev, profilePicture: data.url }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      // Assuming a password change endpoint exists or we use updateProfile if the BE supports it via UserSerializer
      await authService.updateProfile({ password: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Public Profile', icon: UserIcon },
    { id: 'personal', label: 'Personal Info', icon: UserCircle },
    { id: 'academic', label: 'Academic Details', icon: GraduationCap },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-['Outfit'] mb-2">Account Settings</h1>
        <p className="text-gray-500">Manage your profile information and account security.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 font-bold" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sticky top-24">
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm translate-x-1'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center gap-4 px-4 overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-white shadow-md relative group overflow-hidden flex-shrink-0">
                <img
                  src={user?.profilePicture || "/images/chatbot.png"}
                  alt="Current Profile"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = "/images/welkam_atas.png"; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-800 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
            <form onSubmit={activeTab === 'security' ? handleSubmitPassword : handleSubmitProfile} className="p-8">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 font-['Outfit']">Public Profile</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Display Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                          placeholder="Ex: John Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-400 cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 ml-1 italic">* Email cannot be changed for security reasons.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className={`w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-gray-50 transition-transform duration-500 group-hover:scale-105`}>
                            <img
                              src={formData.profilePicture || "/images/chatbot.png"}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = "/images/welkam_atas.png"; }}
                            />
                          </div>
                          <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all active:scale-95">
                            <Camera className="w-4 h-4" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
                          <input
                            type="text"
                            name="profilePicture"
                            value={formData.profilePicture}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                            placeholder="https://example.com/photo.jpg"
                          />
                          <p className="text-[10px] text-gray-400 ml-1 italic">Click the camera icon to upload, or paste a URL.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 font-['Outfit']">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Details Tab */}
              {activeTab === 'academic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 font-['Outfit']">Academic Details</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Student ID (NIM)</label>
                      <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                        placeholder="Ex: 123456789"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Class / Group</label>
                      <select
                        name="student_class"
                        value={formData.student_class}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                      >
                        <option value="">Select Class</option>
                        {classes.length > 0 ? (
                          classes.map((cls) => (
                            <option key={cls.id} value={`${cls.class_type}-${cls.class_number}`}>
                              {cls.class_type}-{cls.class_number}
                            </option>
                          ))
                        ) : (
                          // Fallback jika API belum mengembalikan data
                          <>
                            <option value="INTSE-1">INTSE-1</option>
                            <option value="INTSS-1">INTSS-1</option>
                            <option value="INTST-1">INTST-1</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 font-['Outfit']">Password & Security</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                      <input
                        type="password"
                        name="new"
                        value={passwords.new}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-gray-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-orange-700 uppercase tracking-wider mb-1">Security Warning</p>
                        <p className="text-xs text-orange-600 leading-relaxed font-medium">
                          Updating your password will require you to log back in on all devices. Make sure it's at least 6 characters long.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit Footer */}
              <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Profile Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[11px] font-bold text-gray-400">ACTIVE & SECURED</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-sm font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-black uppercase tracking-widest">Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Floating Archetype Indicator */}
      <div className="fixed bottom-8 left-8 hidden 2xl:flex items-center gap-4 animate-in slide-in-from-left-8 duration-500">
        <div className="bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-200">
            <img
              src={user?.archetype_info?.code ? `/images/profiles/${user.archetype_info.code.includes('-') ? user.archetype_info.code.split('-')[1] : user.archetype_info.code}.png` : "/images/chatbot.png"}
              alt="Archetype"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Your Archetype</p>
            <h4 className="text-xs font-bold text-gray-800">{user?.archetype_info?.archetype_name}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

