import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';

/**
 * Landing — public home page.
 * Sections: Hero → Stats → Features → How It Works → About → Contact → CTA
 */
const Landing = () => {
  const featuresRef = useRef(null);
  const aboutRef    = useRef(null);
  const contactRef  = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  /* ── Data ── */
  const features = [
    { icon: '🤝', title: 'Smart Matching',       desc: 'Our algorithm pairs you with roommates based on lifestyle, sleep schedule, study habits and more.', color: 'coral'  },
    { icon: '🏠', title: 'Verified Listings',    desc: 'Browse student-friendly rentals near your campus — affordable, safe, and ready to move in.',          color: 'violet' },
    { icon: '💬', title: 'In-App Messaging',     desc: "Chat with potential roomies securely — no handing out your number to strangers.",                     color: 'mint'   },
    { icon: '✅', title: 'Profile Verification', desc: 'Student email verification builds trust. Know who you are really moving in with.',                     color: 'yellow' },
  ];

  const steps = [
    { num: '1', emoji: '📝', title: 'Create your profile', desc: 'Tell us your vibe — early bird or night owl? Neat freak or "organized chaos"?' },
    { num: '2', emoji: '🔍', title: 'Browse matches',       desc: 'We surface your most compatible roommates and listings instantly.' },
    { num: '3', emoji: '💬', title: 'Connect & chat',       desc: 'Message your matches right in the app — no awkward emails needed.' },
    { num: '4', emoji: '🎉', title: 'Move in happy',        desc: 'Sign the lease, move in, and actually enjoy living with your roomie!' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students',  emoji: '🎓' },
    { value: '5K+',  label: 'Listings',         emoji: '🏠' },
    { value: '95%',  label: 'Happy Matches',    emoji: '💕' },
    { value: '50+',  label: 'Cities',           emoji: '🌍' },
  ];

  const accentMap = { coral: 'coral', violet: 'violet', mint: 'mint', yellow: 'yellow' };

  return (
    <div className="min-h-screen bg-warm-50 overflow-x-hidden">
      <Navbar
        onFeaturesClick={() => scrollTo(featuresRef)}
        onAboutClick={() => scrollTo(aboutRef)}
        onContactClick={() => scrollTo(contactRef)}
      />

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="relative overflow-hidden pt-10 pb-24">
        {/* Background blobs */}
        <div className="blob-coral w-96 h-96 -top-24 -left-24 opacity-20" style={{position:'absolute',borderRadius:'50%',filter:'blur(70px)',background:'#FF6B6B',pointerEvents:'none'}} />
        <div className="blob-violet w-80 h-80 -top-10 right-0 opacity-15" style={{position:'absolute',borderRadius:'50%',filter:'blur(70px)',background:'#7C5CBF',pointerEvents:'none'}} />
        <div className="blob-mint w-64 h-64 bottom-0 left-1/3 opacity-10" style={{position:'absolute',borderRadius:'50%',filter:'blur(70px)',background:'#4ECDC4',pointerEvents:'none'}} />

        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-600 px-4 py-2 rounded-full text-sm font-bold mb-6 animate-fade-up" style={{fontFamily:'Nunito,sans-serif'}}>
              <span className="animate-wiggle inline-block">🎓</span>
              Built for students, by students
            </div>

            <h1
              className="text-5xl md:text-7xl font-black text-violet-900 mb-6 leading-tight animate-fade-up stagger-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Find Your Perfect{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #7C5CBF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Roomie
              </span>{' '}
              🏠
            </h1>

            <p className="text-xl text-violet-700 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up stagger-2">
              No more random roommate roulette. RoomieLink matches you with compatible students
              based on your actual lifestyle — sleep schedule, study habits, cleanliness, all of it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
              <Link to="/register">
                <Button size="lg" variant="primary">
                  Get started free 🚀
                </Button>
              </Link>
              <Button size="lg" variant="outline-violet" onClick={() => scrollTo(featuresRef)}>
                See how it works
              </Button>
            </div>

            {/* Trust nudge */}
            <p className="mt-6 text-sm text-violet-400 animate-fade-up stagger-4">
              🔒 Free to join · No credit card · 10,000+ students already matched
            </p>
          </div>

          {/* ── Floating emoji cards (decorative) ── */}
          <div className="hidden lg:flex justify-center gap-6 mt-16">
            {[
              { emoji: '😴', label: 'Early bird?', bg: 'bg-yellow-100' },
              { emoji: '📚', label: 'Study buddy', bg: 'bg-violet-100' },
              { emoji: '🐱', label: 'Pet lover',   bg: 'bg-mint-100'   },
              { emoji: '🎮', label: 'Gamer?',      bg: 'bg-coral-100'  },
              { emoji: '🧹', label: 'Neat freak',  bg: 'bg-green-100'  },
            ].map(({ emoji, label, bg }, i) => (
              <div
                key={i}
                className={`${bg} rounded-2xl px-5 py-3 flex flex-col items-center gap-1 shadow-card animate-float`}
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-bold text-violet-700" style={{fontFamily:'Nunito,sans-serif'}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STATS BAR
      ════════════════════════════════ */}
      <section className="bg-violet-900 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, emoji }, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-1">{emoji}</div>
                <div className="text-3xl font-black text-coral-400" style={{fontFamily:'Nunito,sans-serif'}}>{value}</div>
                <div className="text-violet-300 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FEATURES
      ════════════════════════════════ */}
      <section ref={featuresRef} className="py-24 scroll-mt-16 bg-warm-50">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="badge badge-violet mb-3">✨ Features</span>
            <h2 className="text-4xl font-black text-violet-900 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
              Everything you need to find your match
            </h2>
            <p className="text-lg text-violet-600 max-w-xl mx-auto">
              We handle the awkward part so you can focus on finding someone awesome to live with.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc, color }, i) => (
              <Card key={i} hover accent={accentMap[color]} className="text-center animate-fade-up" style={{animationDelay:`${i*0.07}s`}}>
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-lg font-black text-violet-900 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>{title}</h3>
                <p className="text-sm text-violet-600 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════ */}
      <section className="py-24 bg-violet-50">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="badge badge-coral mb-3">🗺️ How it works</span>
            <h2 className="text-4xl font-black text-violet-900 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
              From signup to move-in in 4 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-coral-300 via-violet-300 to-mint-300 z-0" />

            {steps.map(({ num, emoji, title, desc }, i) => (
              <div key={i} className="relative z-10 text-center animate-fade-up" style={{animationDelay:`${i*0.08}s`}}>
                {/* Step number bubble */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-violet text-2xl font-black" style={{fontFamily:'Nunito,sans-serif'}}>
                  {emoji}
                </div>
                <div className="inline-block bg-coral-100 text-coral-600 text-xs font-black px-2 py-0.5 rounded-full mb-2" style={{fontFamily:'Nunito,sans-serif'}}>
                  Step {num}
                </div>
                <h3 className="text-base font-black text-violet-900 mb-2" style={{fontFamily:'Nunito,sans-serif'}}>{title}</h3>
                <p className="text-sm text-violet-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          ABOUT
      ════════════════════════════════ */}
      <section ref={aboutRef} className="py-24 scroll-mt-16 bg-warm-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge badge-mint mb-4">🎓 Our story</span>
              <h2 className="text-4xl font-black text-violet-900 mb-5" style={{fontFamily:'Nunito,sans-serif'}}>
                We've been there too
              </h2>
              <p className="text-violet-700 leading-relaxed mb-4">
                RoomieLink was born out of a very real problem — two founders who ended up with nightmare roommates in their first year of university. After way too many late-night arguments over dishes and noise, we built the tool we wish we'd had.
              </p>
              <p className="text-violet-700 leading-relaxed mb-8">
                We use smart preference matching to connect students who actually vibe — no more guessing games. Over 50,000 students have found their perfect living situation through RoomieLink. 🙌
              </p>

              <div className="flex gap-8">
                {[
                  { val: '50K+', lbl: 'Happy Roommates' },
                  { val: '25K+', lbl: 'Listings' },
                  { val: '4.8★', lbl: 'User Rating' },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <div className="text-2xl font-black text-coral-500" style={{fontFamily:'Nunito,sans-serif'}}>{val}</div>
                    <div className="text-xs text-violet-500">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration / Image */}
            <div className="rounded-3xl overflow-hidden shadow-card-lg h-80">
              <img 
                src="/Images/Students.png"
                alt="Students hanging out together"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CONTACT
      ════════════════════════════════ */}
      <section ref={contactRef} className="py-24 scroll-mt-16 bg-violet-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="badge badge-yellow mb-3">💌 Get in touch</span>
            <h2 className="text-4xl font-black text-violet-900 mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
              Have questions? We've got answers.
            </h2>
            <p className="text-violet-600 max-w-xl mx-auto">
              We usually reply within a few hours. No bots, just real humans who care.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="First Name" name="firstName" placeholder="Alex" required />
                  <Input label="Last Name"  name="lastName"  placeholder="Smith"  required />
                </div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="alex@university.edu"
                  hint="Student emails get priority support 🎓"
                  required
                />
                <Textarea
                  label="Message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  required
                />
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Send message 💌
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA BANNER
      ════════════════════════════════ */}
      <section className="py-20 bg-warm-50">
        <div className="container-custom">
          <div
            className="rounded-3xl p-12 text-center text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #7C5CBF 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white opacity-5 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{fontFamily:'Nunito,sans-serif'}}>
                Ready to find your people?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join 10,000+ students who stopped stressing about roommates and started living their best college life.
              </p>
              <Link to="/register">
                <Button size="lg" variant="white">
                  Create free account 🚀
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;