import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Info,
  GraduationCap,
  Shield,
  Upload,
  Trash2,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

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
    student_id: user?.student_id || '',
    profilePicture: user?.profilePicture || '',
  });

  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

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
      if (authLoading) return;
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        await refreshUser();
        const data = await authService.getStudentClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to initialize settings:', err);
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
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.updateProfile(formData);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const data = await authService.uploadProfilePhoto(formDataUpload);
      await refreshUser();
      setFormData(prev => ({ ...prev, profilePicture: data.url }));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    if (e) e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({ password: passwords.new });
      setPasswords({ new: '', confirm: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (activeTab === 'security') {
      setPasswords({ new: '', confirm: '' });
    } else {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        gender: user?.gender || '',
        birth_date: user?.birth_date || '',
        student_class: user?.student_class || '',
        student_id: user?.student_id || '',
        profilePicture: user?.profilePicture || '',
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Public Profile', icon: UserIcon },
    { id: 'personal', label: 'Personal Information', icon: Info },
    { id: 'academic', label: 'Academic Details', icon: GraduationCap },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-80px)] w-full overflow-hidden font-['Inter',sans-serif]">
      {/* Sidebar Area */}
      <aside className="w-[300px] bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* User Settings Brand Section */}
        <div className="p-8 relative overflow-hidden h-[150px] flex items-center">
          <div className="relative z-10">
            <h2 className="text-[22px] font-bold text-gray-900 leading-[1.1]">User<br />Settings</h2>
          </div>
          
          {/* Decorative Background Image - Adjusted Composition */}
          <div className="absolute top-0 right-0 w-[180px] h-full pointer-events-none select-none">
            <img 
              src="/images/Group 13328.png" 
              alt="Decorative BG" 
              className="w-full h-full object-contain object-right opacity-90"
            />
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 flex flex-col">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold transition-all border-b border-gray-50/50 ${
                  isActive
                    ? 'bg-blue-50/50 text-blue-600'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-500' : 'text-gray-900'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-[1000px] mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Account Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile information and account security</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Card Section Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                {activeTab === 'profile' && <UserIcon className="w-5 h-5" />}
                {activeTab === 'personal' && <Info className="w-5 h-5 font-bold" />}
                {activeTab === 'academic' && <GraduationCap className="w-5 h-5" />}
                {activeTab === 'security' && <Shield className="w-5 h-5" />}
              </div>
              <h3 className="text-base font-bold text-gray-900">{tabs.find(t => t.id === activeTab).label}</h3>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-10 pb-6 space-y-10 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-900">Full name<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-xs text-gray-400 font-medium pb-1.5">Your display name</p>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 focus:border-blue-200 transition-all shadow-sm"
                      placeholder=" Rio Alvein Hasana"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-900">Email Address<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-xs text-gray-400 font-medium pb-1.5">Your email address</p>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-sm font-medium text-gray-400 cursor-not-allowed shadow-sm"
                      placeholder="fadhil@student.unu-jogja.ac.id"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Profile Picture</label>
                  <p className="text-xs text-gray-400 font-medium pb-4">This photo will be visible to others</p>
                  
                  <div className="flex items-center gap-8">
                      <div className="w-32 h-32 rounded-[16px] bg-[#F4F4F5] flex items-center justify-center relative overflow-hidden group">
                        <img
                          src={formData.profilePicture || (formData.gender === 'Female' ? "/images/default-avatar-female.png" : "/images/default-avatar.png")}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = formData.gender === 'Female' ? "/images/default-avatar-female.png" : "/images/default-avatar.png"; }}
                        />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 flex items-center justify-center transition-opacity">
                         <div className="relative w-10 h-10 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-[8px] text-[12px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors w-fit shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-400 font-medium max-w-[200px] leading-relaxed">Please upload a PNG file with a maximum size of 2 MB</p>
                        <button 
                          type="button"
                          onClick={() => setFormData(p => ({...p, profilePicture: ''}))}
                          className="flex items-center gap-2 text-[#EF4444] text-[11px] font-bold hover:opacity-80 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">First name<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Enter your first name</p>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-0 focus:border-blue-200 shadow-sm"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">Last name<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Enter your last name</p>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-0 focus:border-blue-200 shadow-sm"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">Gender</label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Select your gender</p>
                    <div className="relative">
                       <select
                         name="gender"
                         value={formData.gender}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-0 appearance-none shadow-sm"
                       >
                         <option value="">Select your gender</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">Date of birth</label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Enter your date of birth</p>
                    <div className="relative">
                      <input
                        type="text"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-0 shadow-sm"
                        placeholder="Enter your date of birth"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                         <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="animate-in fade-in duration-300">
                <div className="space-y-10 max-w-[600px]">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">Student ID (NIM)<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Enter your student ID</p>
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-0 shadow-sm"
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-900">Class Type<span className="text-red-500 ml-0.5">*</span></label>
                      <p className="text-[11px] text-gray-400 font-medium pb-1.5">Select your class type</p>
                      <div className="relative">
                        <select
                          value={formData.student_class.split('-')[0] || ''}
                          onChange={(e) => {
                            const num = formData.student_class.split('-')[1] || '';
                            setFormData(p => ({...p, student_class: `${e.target.value}-${num}`}));
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none appearance-none shadow-sm"
                        >
                          <option value="">Select your class type</option>
                          <option value="INTSE">INTSE</option>
                          <option value="INTSS">INTSS</option>
                          <option value="INTST">INTST</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-900">Class Number<span className="text-red-500 ml-0.5">*</span></label>
                      <p className="text-[11px] text-gray-400 font-medium pb-1.5">Select your class number</p>
                      <div className="relative">
                        <select
                          value={formData.student_class.split('-')[1] || ''}
                          onChange={(e) => {
                            const type = formData.student_class.split('-')[0] || '';
                            setFormData(p => ({...p, student_class: `${type}-${e.target.value}`}));
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none appearance-none shadow-sm"
                        >
                          <option value="">Select your class number</option>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">New password<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Enter your new password</p>
                    <div className="relative">
                      <input
                        type="password"
                        name="new"
                        value={passwords.new}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none shadow-sm"
                        placeholder="••••••••"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-900">Confirm new password<span className="text-red-500 ml-0.5">*</span></label>
                    <p className="text-[11px] text-gray-400 font-medium pb-1.5">Re-enter your new password</p>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[12px] text-[13px] font-medium text-gray-700 focus:outline-none shadow-sm"
                        placeholder="••••••••"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Footer Action Buttons */}
          <div className="px-10 py-8 bg-white border-t border-gray-50 flex items-center justify-end gap-6 mt-auto">
            {message.text && (
               <div className={`mr-auto flex items-center gap-2 text-[12px] font-bold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                 {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                 {message.text}
               </div>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all tracking-wider uppercase active:scale-95"
            >
              RESET
            </button>
            <button
              onClick={activeTab === 'security' ? handleSubmitPassword : handleSubmitProfile}
              disabled={loading}
              className="px-8 py-2.5 rounded-full bg-[#0091FF] text-white text-[12px] font-bold hover:bg-[#007EE5] shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <div className="relative w-4 h-4 mr-0.5">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </div>
              SAVE CHANGES
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
