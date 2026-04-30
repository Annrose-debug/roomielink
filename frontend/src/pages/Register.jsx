import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

/**
 * Register — account creation page.
 * Upbeat copy to make sign-up feel exciting, not bureaucratic.
 */
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name)                              e.name            = 'What should we call you?';
    if (!formData.email)                             e.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))  e.email           = 'Enter a valid email';
    if (!formData.password)                          e.password        = 'Password is required';
    else if (formData.password.length < 6)           e.password        = 'At least 6 characters please';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    
    try {
      // Direct API call to backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (data.token) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Registration successful! 🎉');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Cannot connect to server. Make sure backend is running on port 5000');
    } finally {
      setIsLoading(false);
    }
  };

  /* Password strength indicator */
  const strengthLevel = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = strengthLevel();
  const strengthLabel = ['', 'Weak 😬', 'Fair 🙂', 'Good 👍', 'Strong 💪', 'Fortress 🏰'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-mint-400', 'bg-green-500', 'bg-violet-600'][strength];

  return (
    <div className="min-h-screen bg-warm-50 relative overflow-hidden">
      {/* Background blobs */}
      <div style={{position:'absolute',top:'-80px',left:'-80px',width:'320px',height:'320px',borderRadius:'50%',background:'#FF6B6B',filter:'blur(80px)',opacity:0.12,pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'-60px',right:'-60px',width:'280px',height:'280px',borderRadius:'50%',background:'#4ECDC4',filter:'blur(80px)',opacity:0.12,pointerEvents:'none'}} />

      <Navbar />

      <div className="container-custom py-12 relative z-10">
        <div className="max-w-md mx-auto">

          <div className="text-center mb-8 animate-fade-up">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-3xl font-black text-violet-900 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>
              Join RoomieLink!
            </h1>
            <p className="text-violet-600">
              Create your free account and meet your future roomie.
            </p>
          </div>

          <Card className="animate-fade-up stagger-1">
            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Alex Johnson"
                required
                icon={<span>😊</span>}
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@university.edu"
                hint="Student emails get a verified badge 🎓"
                required
                icon={<span>📧</span>}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a strong password"
                required
                icon={<span>🔒</span>}
              />

              {/* Password strength bar */}
              {formData.password && (
                <div className="mb-4 -mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(n => (
                      <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-violet-500">{strengthLabel}</p>
                </div>
              )}

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Repeat your password"
                required
                icon={<span>✅</span>}
              />

              <p className="text-xs text-violet-400 mb-5">
                By signing up you agree to our{' '}
                <Link to="/terms" className="text-coral-500 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-coral-500 hover:underline">Privacy Policy</Link>.
              </p>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                Create my account 🚀
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-violet-100" />
              <span className="text-xs text-violet-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-violet-100" />
            </div>

            <p className="text-center text-violet-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-coral-500 hover:text-coral-600 font-bold transition-colors">
                Log in →
              </Link>
            </p>
          </Card>

          {/* Perks */}
          <div className="mt-6 grid grid-cols-3 gap-3 animate-fade-up stagger-2">
            {[
              { emoji: '🆓', text: 'Always free' },
              { emoji: '🔒', text: 'Secure & private' },
              { emoji: '⚡', text: 'Match in minutes' },
            ].map(({ emoji, text }) => (
              <div key={text} className="bg-white rounded-xl p-3 text-center shadow-card border border-violet-50">
                <div className="text-2xl">{emoji}</div>
                <div className="text-xs text-violet-600 font-semibold mt-1" style={{fontFamily:'Nunito,sans-serif'}}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;