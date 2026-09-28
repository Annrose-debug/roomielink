import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Dashboard — the student's home base after logging in.
 * Shows stats, recent activity, and quick action buttons.
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getDashboard();
        setData(res.data);
      } catch {
        // silently fail — UI handles null data gracefully
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Stat cards config ── */
  const stats = [
    { label: 'Profile Views', value: data?.profileViews ?? '—', emoji: '👀', color: 'coral',  bg: 'bg-coral-50',  text: 'text-coral-500'  },
    { label: 'Matches',       value: data?.matches      ?? '—', emoji: '💕', color: 'violet', bg: 'bg-violet-50', text: 'text-violet-500' },
    { label: 'Messages',      value: data?.messages     ?? '—', emoji: '💬', color: 'mint',   bg: 'bg-mint-50',   text: 'text-mint-500'   },
    { label: 'Saved Listings',value: data?.savedListings?? '—', emoji: '🏠', color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-600'  },
  ];

  /* ── Quick actions ── */
  const actions = [
  { label: 'Find Roommates',   emoji: '🔍', to: '/find-roommates', variant: 'primary'        },
  { label: 'Browse Listings',  emoji: '🏠', to: '/listings',        variant: 'violet'         },
  { label: 'Update Profile',   emoji: '✏️', to: '/profile',         variant: 'outline'        },
  { label: 'Messages',         emoji: '💬', to: '/messages',        variant: 'outline-violet' },
];
  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Greeting copy ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? '☀️ Good morning' :
    hour < 17 ? '👋 Good afternoon' :
                '🌙 Good evening';

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <div className="container-custom py-10">

        {/* ── Welcome banner ── */}
        <div
          className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden animate-fade-up"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #7C5CBF 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute left-1/2 bottom-0 w-32 h-32 rounded-full bg-white opacity-5 translate-y-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1" style={{fontFamily:'Nunito,sans-serif'}}>{greeting},</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2" style={{fontFamily:'Nunito,sans-serif'}}>
                {user?.name ?? 'Student'} 
              </h1>
              <p className="text-white/80">
                Your roommate journey starts here. Let's find your perfect match!
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/profile">
                <Button variant="white" size="md">View profile →</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, emoji, bg, text }, i) => (
            <Card
              key={i}
              className={`${bg} border-0 animate-fade-up`}
              style={{animationDelay:`${i*0.07}s`}}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className={`text-3xl font-black ${text} mb-1`} style={{fontFamily:'Nunito,sans-serif'}}>
                {value}
              </div>
              <div className="text-xs text-violet-500 font-semibold">{label}</div>
            </Card>
          ))}
        </div>

        {/* ── Main grid: activity + quick actions ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="animate-fade-up stagger-2">
              <h2
                className="text-xl font-black text-violet-900 mb-5"
                style={{fontFamily:'Nunito,sans-serif'}}
              >
                Recent Activity
              </h2>

              {data?.recentActivity?.length ? (
                <div className="space-y-3">
                  {data.recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-violet-50 transition-colors"
                    >
                      {/* Activity icon placeholder */}
                      <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center text-lg shrink-0">
                        {i === 0 ? '👀' : i === 1 ? '💕' : '💬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-violet-900 text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
                          {item.title}
                        </p>
                        <p className="text-xs text-violet-500 truncate">{item.description}</p>
                      </div>
                      <span className="text-xs text-violet-400 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3"></div>
                  <p className="text-violet-500 font-semibold" style={{fontFamily:'Nunito,sans-serif'}}>
                    No activity yet — complete your profile to start getting matches!
                  </p>
                  <Link to="/profile" className="mt-4 inline-block">
                    <Button variant="primary" size="sm">Complete profile →</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Profile completion nudge */}
            <Card className="mt-4 border-2 border-dashed border-violet-200 bg-violet-50 animate-fade-up stagger-3">
              <div className="flex items-center gap-4">
                <div className="text-4xl"></div>
                <div className="flex-1">
                  <p className="font-black text-violet-800 text-sm" style={{fontFamily:'Nunito,sans-serif'}}>
                    Pro tip: Complete your profile to get 5× more matches!
                  </p>
                  <p className="text-xs text-violet-500 mt-0.5">Add a photo, bio, and preferences to stand out.</p>
                </div>
                <Link to="/profile">
                  <Button variant="violet" size="sm">Do it </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="animate-fade-up stagger-2">
              <h2
                className="text-xl font-black text-violet-900 mb-5"
                style={{fontFamily:'Nunito,sans-serif'}}
              >
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                {actions.map(({ label, emoji, to, variant }) => (
                  <Link key={label} to={to}>
                    <Button variant={variant} size="md" fullWidth>
                      {emoji} {label}
                    </Button>
                  </Link>
                ))}
                <div className="h-px bg-violet-100 my-1" />
                <Button variant="ghost" size="md" fullWidth onClick={logout}>
                  Log out
                </Button>
              </div>
            </Card>

            {/* Mini invite card */}
            <Card
              className="mt-4 text-center animate-fade-up stagger-4"
              style={{ background: 'linear-gradient(135deg, #FFF9F5, #EDE8F5)' }}
            >
              <div className="text-4xl mb-2"></div>
              <h3 className="font-black text-violet-800 mb-1" style={{fontFamily:'Nunito,sans-serif'}}>
                Invite a friend
              </h3>
              <p className="text-xs text-violet-500 mb-3">
                Help your classmates find great roomies too!
              </p>
              <Button variant="outline-violet" size="sm" fullWidth>
                Share the link
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
