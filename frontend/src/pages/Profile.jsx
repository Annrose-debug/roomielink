import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

/**
 * Profile — view & edit the current user's profile and living preferences.
 * Split into: header card, about section, and preferences panel.
 */
const Profile = () => {
  const navigate = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [uploading,setUploading]= useState(false);
  const [isEditing,setIsEditing]= useState(false);
  const [editPrefs,setEditPrefs]= useState(false);

  const [formData, setFormData] = useState({
    name: '', bio: '', location: '', budget: '',
    moveInDate: '', interests: '', lifestyle: '',
  });

  const [preferences, setPreferences] = useState({
    smoking: 'no', pets: 'neutral', cleanliness: 3,
    sleepSchedule: 'flexible', socialLevel: 'moderate',
  });

  // FIXED: Get token from localStorage OR sessionStorage
  const getToken = () => {
    return localStorage.getItem('rl_token') || sessionStorage.getItem('rl_token');
  };

  // Check auth on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      console.log('=== DEBUG PROFILE ===');
      console.log('1. Raw token:', token);
      
      // Decode the token to see which user ID it contains
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('2. Token user ID:', payload.id);
          console.log('3. Token expires:', new Date(payload.exp * 1000));
        } catch(e) {
          console.log('2. Could not decode token');
        }
      }
      
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('4. Profile returned from server:', res.data);
      console.log('5. Profile user ID:', res.data.id);
      console.log('6. Profile name:', res.data.name);
      
      setProfile(res.data);
      setFormData({
        name:       res.data.name       || '',
        bio:        res.data.bio        || '',
        location:   res.data.location   || '',
        budget:     res.data.budget     || '',
        moveInDate: res.data.moveInDate || '',
        interests:  res.data.interests  || '',
        lifestyle:  res.data.lifestyle  || '',
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Could not load profile 😕');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const token = getToken();
      const res = await axios.get('http://localhost:5000/api/users/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && Object.keys(res.data).length) {
        setPreferences(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error('Fetch preferences error:', error);
    }
  };

  const handleInput = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePref = (e) => setPreferences(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated! 🎉');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePrefsSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.put('http://localhost:5000/api/users/preferences', preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditPrefs(false);
      toast.success('Preferences saved! ✅');
    } catch (error) {
      console.error('Preferences error:', error);
      toast.error('Failed to save preferences');
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const fd = new FormData();
    fd.append('profilePic', file);
    setUploading(true);
    
    try {
      const token = getToken();
      const res = await axios.post('http://localhost:5000/api/users/profile/picture', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(p => ({ ...p, profilePic: res.data.profilePic }));
      toast.success('Photo updated! 📸');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed — try a smaller image');
    } finally {
      setUploading(false);
    }
  };

  /* ── Preference emoji helpers ── */
  const smokeLabel  = { no:'🚫 No smoking', outside:'🌿 Outside only', okay:'🚬 Okay with it' };
  const petsLabel   = { love:'🐾 Love pets', neutral:'😐 Neutral', allergic:'🤧 Allergic', no:'🚫 No pets' };
  const sleepLabel  = { early:'🌅 Early bird', night:'🦉 Night owl', flexible:'😴 Flexible' };
  const socialLabel = { quiet:'📚 Introvert', moderate:'🤝 Moderate', social:'🎉 Social' };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <div className="container-custom py-10">
          <div className="h-48 skeleton rounded-3xl mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 skeleton rounded-2xl" />
            <div className="h-64 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <div className="container-custom py-10">
        <div className="max-w-4xl mx-auto">

          {/* ════════════════════
              PROFILE HEADER CARD
          ════════════════════ */}
          <Card className="mb-6 animate-fade-up" style={{background:'linear-gradient(135deg,#FFF9F5,#EDE8F5)'}}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-coral-200 to-violet-300 border-4 border-white shadow-card-lg">
                  {profile?.profilePic ? (
                    <img
                      src={`http://localhost:5000${profile.profilePic}`}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white" style={{fontFamily:'Nunito,sans-serif'}}>
                      {initials}
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-coral-500 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-coral-600 transition-colors shadow-coral text-lg">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePicUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : '📷'}
                </label>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-black text-violet-900 mb-1" style={{fontFamily:'Nunito,sans-serif'}}>
                  {profile?.name}
                </h1>
                <p className="text-violet-500 text-sm mb-2">{profile?.email}</p>
                {profile?.location && (
                  <span className="badge badge-violet">📍 {profile.location}</span>
                )}
                {profile?.budget && (
                  <span className="badge badge-coral ml-2">💰 {profile.budget}</span>
                )}
                {profile?.lifestyle && (
                  <span className="badge badge-mint ml-2">🎓 {profile.lifestyle}</span>
                )}
              </div>

              {/* BUTTONS - Added Dashboard button here */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                >
                  📊 Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
                </Button>
              </div>
            </div>
          </Card>

          {/* ════════════════════
              MAIN CONTENT GRID
          ════════════════════ */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* ── Left: About / Edit ── */}
            <div className="md:col-span-2">
              {isEditing ? (
                <Card className="animate-fade-up" accent="coral">
                  <h2 className="text-lg font-black text-violet-900 mb-5" style={{fontFamily:'Nunito,sans-serif'}}>
                    ✏️ Edit Your Profile
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleInput} required />
                    <Input label="Your vibe / bio" name="bio" value={formData.bio} onChange={handleInput} placeholder="e.g. CS student who loves coffee and late-night gaming 🎮" />
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input label="📍 Location" name="location" value={formData.location} onChange={handleInput} placeholder="City or campus" />
                      <Input label="💰 Monthly Budget" name="budget" value={formData.budget} onChange={handleInput} placeholder="e.g. $800–$1200" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input label="📅 Move-in Date" type="date" name="moveInDate" value={formData.moveInDate} onChange={handleInput} />
                      <Input label="🎓 Lifestyle" name="lifestyle" value={formData.lifestyle} onChange={handleInput} placeholder="e.g. Student, Part-time worker" />
                    </div>
                    <Input
                      label="⭐ Interests (comma-separated)"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInput}
                      placeholder="hiking, cooking, K-dramas, gym..."
                      hint="These help us find compatible roommates for you!"
                    />
                    <div className="flex gap-3 mt-2">
                      <Button type="submit" variant="primary">Save changes ✅</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="animate-fade-up">
                  <h2 className="text-lg font-black text-violet-900 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
                    👤 About Me
                  </h2>

                  <p className="text-violet-700 leading-relaxed mb-5">
                    {profile?.bio || (
                      <span className="text-violet-400 italic">
                        No bio yet — add one to stand out! 👆
                      </span>
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { label: '📍 Location',   val: profile?.location   },
                      { label: '💰 Budget',     val: profile?.budget     },
                      { label: '📅 Move-in',    val: profile?.moveInDate ? new Date(profile.moveInDate).toLocaleDateString('en-CA') : null },
                      { label: '🎓 Lifestyle',  val: profile?.lifestyle  },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-xs text-violet-400 font-semibold mb-0.5">{label}</p>
                        <p className="text-sm text-violet-800 font-semibold">
                          {val || <span className="text-violet-300">Not set</span>}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Interest tags */}
                  {profile?.interests && (
                    <div>
                      <p className="text-xs text-violet-400 font-semibold mb-2">⭐ Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.split(',').map((t, i) => (
                          <span key={i} className="badge badge-violet">{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* ── Right: Preferences ── */}
            <div>
              <Card className="animate-fade-up stagger-1" accent="violet">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black text-violet-900" style={{fontFamily:'Nunito,sans-serif'}}>
                    🏠 Living Style
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setEditPrefs(!editPrefs)}>
                    {editPrefs ? '✕' : '✏️'}
                  </Button>
                </div>

                {editPrefs ? (
                  <form onSubmit={handlePrefsSubmit} className="space-y-4">
                    {/* Smoking */}
                    <div>
                      <label className="text-xs font-bold text-violet-700 mb-1 block" style={{fontFamily:'Nunito,sans-serif'}}>🚬 Smoking</label>
                      <select name="smoking" value={preferences.smoking} onChange={handlePref} className="w-full rounded-xl border-2 border-violet-200 focus:border-coral-400 px-3 py-2 text-sm text-violet-800 focus:outline-none">
                        <option value="no">🚫 No smoking</option>
                        <option value="outside">🌿 Outside only</option>
                        <option value="okay">🚬 Okay with it</option>
                      </select>
                    </div>

                    {/* Pets */}
                    <div>
                      <label className="text-xs font-bold text-violet-700 mb-1 block" style={{fontFamily:'Nunito,sans-serif'}}>🐾 Pets</label>
                      <select name="pets" value={preferences.pets} onChange={handlePref} className="w-full rounded-xl border-2 border-violet-200 focus:border-coral-400 px-3 py-2 text-sm text-violet-800 focus:outline-none">
                        <option value="love">🐾 Love pets</option>
                        <option value="neutral">😐 Neutral</option>
                        <option value="allergic">🤧 Allergic</option>
                        <option value="no">🚫 No pets</option>
                      </select>
                    </div>

                    {/* Cleanliness slider */}
                    <div>
                      <label className="text-xs font-bold text-violet-700 mb-1 block" style={{fontFamily:'Nunito,sans-serif'}}>
                        🧹 Cleanliness — {['','Relaxed','Casual','Balanced','Tidy','Spotless'][preferences.cleanliness]}
                      </label>
                      <input type="range" name="cleanliness" min="1" max="5" value={preferences.cleanliness} onChange={handlePref} className="w-full accent-coral-500" />
                      <div className="flex justify-between text-xs text-violet-400 mt-1">
                        <span>Relaxed</span><span>Spotless</span>
                      </div>
                    </div>

                    {/* Sleep */}
                    <div>
                      <label className="text-xs font-bold text-violet-700 mb-1 block" style={{fontFamily:'Nunito,sans-serif'}}>😴 Sleep Schedule</label>
                      <select name="sleepSchedule" value={preferences.sleepSchedule} onChange={handlePref} className="w-full rounded-xl border-2 border-violet-200 focus:border-coral-400 px-3 py-2 text-sm text-violet-800 focus:outline-none">
                        <option value="early">🌅 Early bird</option>
                        <option value="night">🦉 Night owl</option>
                        <option value="flexible">😴 Flexible</option>
                      </select>
                    </div>

                    {/* Social level */}
                    <div>
                      <label className="text-xs font-bold text-violet-700 mb-1 block" style={{fontFamily:'Nunito,sans-serif'}}>🎉 Social Level</label>
                      <select name="socialLevel" value={preferences.socialLevel} onChange={handlePref} className="w-full rounded-xl border-2 border-violet-200 focus:border-coral-400 px-3 py-2 text-sm text-violet-800 focus:outline-none">
                        <option value="quiet">📚 Introvert</option>
                        <option value="moderate">🤝 Moderate</option>
                        <option value="social">🎉 Social butterfly</option>
                      </select>
                    </div>

                    <Button type="submit" variant="violet" size="sm" fullWidth>Save preferences ✅</Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: '🚬 Smoking',        val: smokeLabel[preferences.smoking]  },
                      { label: '🐾 Pets',            val: petsLabel[preferences.pets]      },
                      { label: '🧹 Cleanliness',     val: `${'★'.repeat(preferences.cleanliness)}${'☆'.repeat(5-preferences.cleanliness)} ${['','Relaxed','Casual','Balanced','Tidy','Spotless'][preferences.cleanliness]}` },
                      { label: '😴 Sleep Schedule',  val: sleepLabel[preferences.sleepSchedule]  },
                      { label: '🎉 Social Level',    val: socialLabel[preferences.socialLevel]   },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center gap-2 py-2 border-b border-violet-50 last:border-0">
                        <span className="text-xs text-violet-500 font-semibold">{label}</span>
                        <span className="text-xs font-bold text-violet-800 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Completeness hint */}
              <Card className="mt-4 bg-coral-50 border-0 animate-fade-up stagger-2">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌟</div>
                  <p className="text-sm font-black text-coral-700 mb-1" style={{fontFamily:'Nunito,sans-serif'}}>
                    Profile tip
                  </p>
                  <p className="text-xs text-coral-600">
                    Profiles with a photo get 3× more roommate requests!
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;