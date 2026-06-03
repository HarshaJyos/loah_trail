import * as React from 'react';
import Link from 'next/link';
import ParticleCanvas from '../components/ui/ParticleCanvas';

export default function HomePage() {
  const features = [
    {
      icon: '🎯',
      title: 'Life Goal Planning',
      desc: 'Set meaningful goals and track your journey to holistic wellness',
    },
    {
      icon: '🧘',
      title: 'Mindfulness Tools',
      desc: 'Guided meditation, breathing exercises, and daily reflection',
    },
    {
      icon: '💪',
      title: 'Health Tracking',
      desc: 'Monitor physical, mental, and emotional wellbeing in one place',
    },
    {
      icon: '📝',
      title: 'Healing Journal',
      desc: 'Express thoughts, emotions, and gratitude with guided prompts',
    },
    {
      icon: '🌱',
      title: 'Habit Builder',
      desc: 'Develop positive routines that nurture your mind, body, and soul',
    },
    {
      icon: '⚡',
      title: 'Energy Management',
      desc: 'Balance your daily energy with smart scheduling and rest',
    },
  ];

  return (
    <div className="w-full h-screen overflow-y-auto bg-gradient-to-b from-[#0a0a0f] via-[#1a0a2d] to-[#0a0a0f] text-white font-sans relative scroll-smooth selection:bg-purple-500/30">
      {/* Particle Background */}
      <ParticleCanvas />

      {/* Ambient Glow Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="fixed bottom-20 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        {/* Floating Elements */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
        <div
          className="absolute top-1/2 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-300 rounded-full animate-ping"
          style={{ animationDelay: '1s' }}
        />

        <div className="relative z-10 space-y-8 max-w-4xl">
          {/* Logo Badge */}
          <div className="inline-block mb-4 px-8 py-3 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-md shadow-lg shadow-purple-500/10 hover:border-purple-400/50 transition-all duration-300">
            <span className="text-purple-300 text-xs font-bold tracking-widest uppercase">
              Transform Your Life
            </span>
          </div>

          {/* Main Title with Animation */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-6 relative select-none">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl animate-gradient bg-[length:200%_auto]">
              LOAH
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-2xl -z-10 opacity-45" />
          </h1>

          <p className="text-3xl md:text-4xl font-light text-purple-200 tracking-wide mb-4">
            Life Organiser & Healer
          </p>

          <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-300 leading-relaxed mb-12 px-4">
            Your personal sanctuary for{' '}
            <span className="text-purple-400 font-semibold">healing</span>,{' '}
            <span className="text-pink-400 font-semibold">growth</span>, and{' '}
            <span className="text-purple-400 font-semibold">transformation</span>.
            <br />
            Unite your mind, body, and soul in perfect harmony.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/dashboard"
              className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
                         text-white font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-2xl
                         shadow-purple-500/30 overflow-hidden hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                Begin Your Journey
                <span className="text-xl group-hover:translate-x-1.5 transition-transform">
                  ✨
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>

            <a
              href="#features-section"
              className="px-12 py-5 rounded-2xl border border-purple-500/30 text-gray-200 
                         hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300
                         backdrop-blur-sm font-semibold text-lg shadow-lg"
            >
              Discover More ↓
            </a>
          </div>

          {/* Stats with Icons */}
          <div className="mt-20 flex flex-wrap justify-center gap-12 text-sm pt-8">
            <div className="text-center group cursor-default">
              <div className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:scale-110 transition-transform">
                ∞
              </div>
              <div className="text-gray-400 mt-2 font-medium">Possibilities</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-4xl font-black text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text group-hover:scale-110 transition-transform">
                24/7
              </div>
              <div className="text-gray-400 mt-2 font-medium">Support</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:scale-110 transition-transform">
                100%
              </div>
              <div className="text-gray-400 mt-2 font-medium">Holistic</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 animate-bounce">
          <div className="w-8 h-12 border-2 border-purple-500/20 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-purple-500/5">
            <div className="w-1.5 h-3 bg-purple-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="min-h-screen py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-6 px-6 py-2 rounded-full border border-purple-500/25 bg-purple-500/10 backdrop-blur-sm">
              <span className="text-purple-300 text-sm font-semibold tracking-wider">
                HOLISTIC WELLNESS
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Healing Features
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Comprehensive tools designed to nurture every aspect of your being
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-gradient-to-br from-purple-900/15 via-purple-900/5 to-pink-900/10 
                           border border-purple-500/20 hover:border-purple-400/50 backdrop-blur-md
                           hover:scale-[1.03] hover:-translate-y-1 transition-all duration-500 cursor-pointer
                           shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-purple-300 group-hover:text-purple-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center relative bg-black/10">
        <div className="max-w-6xl">
          <div className="inline-block mb-8 px-8 py-3 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md shadow-lg">
            <span className="text-pink-300 text-xs font-bold tracking-widest uppercase">
              Our Purpose
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-10 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            What is LOAH?
          </h2>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-16 max-w-3xl mx-auto font-light">
            LOAH is your trusted companion on the path to wholeness. We combine
            ancient wisdom with modern science to help you organize your life and
            heal from within. Perfect for{' '}
            <span className="text-purple-400 font-semibold">seekers</span>,{' '}
            <span className="text-pink-400 font-semibold">healers</span>, and{' '}
            <span className="text-purple-400 font-semibold">
              anyone ready to transform
            </span>
            .
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16 text-left">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/10 to-purple-900/5 border border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-all duration-300">
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold mb-4 text-purple-300">
                Our Mission
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                To empower individuals on their healing journey by providing intuitive
                tools that foster self-awareness, personal growth, and inner peace. We
                believe everyone deserves a life of balance and fulfillment.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-900/10 to-pink-900/5 border border-pink-500/20 backdrop-blur-md hover:border-pink-400/40 transition-all duration-300">
              <div className="text-3xl mb-4">💝</div>
              <h3 className="text-2xl font-bold mb-4 text-pink-300">
                Why Choose LOAH?
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                We blend traditional healing practices with cutting-edge wellness
                technology. Our holistic approach addresses mind, body, and spirit—creating
                a complete ecosystem for your personal transformation.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-purple-300">
              Your Complete Wellness Suite
            </h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                '🧘 Meditation',
                '📊 Progress Tracking',
                '💭 Mindful Journal',
                '🎯 Goal Setting',
                '🌱 Habit Formation',
                '📅 Life Planning',
                '⚡ Energy Balance',
                '🌙 Sleep Wellness',
                '💪 Fitness Goals',
                '🎨 Creative Expression',
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 
                             border border-purple-500/20 text-gray-200 text-sm font-medium backdrop-blur-sm
                             hover:border-purple-400/50 hover:scale-105 transition-all cursor-default shadow-lg"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard"
            className="group relative px-14 py-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
                       text-white font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-2xl
                       shadow-purple-500/30 overflow-hidden hover:shadow-purple-500/50 inline-block"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Your Healing Journey
              <span className="text-xl group-hover:translate-x-1.5 transition-transform">
                →
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8 px-8 py-3 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md">
            <span className="text-purple-300 text-xs font-bold tracking-widest uppercase">
              Get In Touch
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Let's Connect
          </h2>

          <p className="text-lg text-gray-300 mb-12 max-w-xl mx-auto font-light">
            Have questions or ready to begin? We're here to support your journey.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <a
              href="mailto:contact.loah@gmail.com"
              className="group p-6 rounded-2xl bg-gradient-to-br from-purple-900/15 to-purple-900/5 
                         border border-purple-500/20 backdrop-blur-md hover:border-purple-400/40
                         transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="text-4xl mb-3 group-hover:scale-105 transition-transform">
                📧
              </div>
              <div className="text-purple-300 font-bold mb-1">Email Us</div>
              <div className="text-gray-400 text-xs break-all">
                contact.loah@gmail.com
              </div>
            </a>

            <a
              href="tel:+919701341323"
              className="group p-6 rounded-2xl bg-gradient-to-br from-pink-900/15 to-pink-900/5 
                         border border-pink-500/20 backdrop-blur-md hover:border-pink-400/40
                         transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
            >
              <div className="text-4xl mb-3 group-hover:scale-105 transition-transform">
                📱
              </div>
              <div className="text-pink-300 font-bold mb-1">Call Us</div>
              <div className="text-gray-400 text-xs">+91 97013 41323</div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-purple-500/10 bg-black/40 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-3xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              LOAH
            </div>
            <p className="text-purple-300 text-base font-semibold mb-2">
              Life Organiser & Healer
            </p>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Empowering your journey to holistic wellness and inner peace
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex gap-6 text-xs text-gray-400">
              <a
                href="mailto:contact.loah@gmail.com"
                className="hover:text-purple-400 transition-colors"
              >
                contact.loah@gmail.com
              </a>
              <span>•</span>
              <a
                href="tel:+919701341323"
                className="hover:text-pink-400 transition-colors"
              >
                +91 97013 41323
              </a>
            </div>
          </div>

          <div className="text-center text-gray-600 text-xs">
            <p>© 2024 LOAH. Built with love for your wellness journey. 💜</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
