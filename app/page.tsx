'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, CheckCircle2, Zap, Smile, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="text-[#8979FF]" size={28} />,
      title: 'Brain Dump',
      desc: 'Unload your messy, raw thoughts instantly and organize them perfectly later.',
    },
    {
      icon: <CheckCircle2 className="text-[#00D084]" size={28} />,
      title: 'Task Management',
      desc: 'Track and check off your daily goals with a simple, clean, and intuitive to-do list.',
    },
    {
      icon: <Zap className="text-[#FF9B00]" size={28} />,
      title: 'Focus Sessions',
      desc: 'Nurture habits and routines with interactive step-by-step timers designed for ADHD.',
    },
    {
      icon: <Smile className="text-[#FF6B6B]" size={28} />,
      title: 'Mood Journaling',
      desc: 'Reflect on your day, track your feelings, and keep a clean diary of your journey.',
    },
  ];

  return (
    <div className="w-full h-full bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-[var(--brand-primary-muted)] overflow-y-auto overflow-x-hidden relative">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--brand-primary)] rounded-full blur-[120px] opacity-[0.15] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--cat-learning)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[var(--brand-primary)] to-[#B3A7FF] p-2.5 rounded-2xl text-white shadow-lg shadow-[var(--brand-primary-muted)]">
            <Brain size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[var(--text-primary)]">LOAH</span>
        </div>
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 px-6 py-3 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] backdrop-blur-md text-[var(--text-primary)] font-bold text-sm tracking-wide rounded-2xl transition-all shadow-sm active:scale-95"
        >
          Go to App <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 md:pt-32 pb-24 text-center space-y-8 select-none relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-muted)] text-[var(--brand-primary)] text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_var(--brand-primary-muted)] animate-pulse">
          <Sparkles size={14} /> Life Organiser & Healer
        </div>

        <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tighter text-[var(--text-primary)] leading-[1.05]">
          Sanctuary for your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#B3A7FF]">focus</span>{' '}
          and{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--danger-default)] to-[#FF9B00]">growth</span>.
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto text-[var(--text-secondary)] leading-relaxed font-medium">
          A minimalistic productivity suite designed specifically for ADHD minds. 
          Unclutter your ideas, organize your timeline, and heal in perfect harmony.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="group relative w-full sm:w-auto px-10 py-5 bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-base uppercase tracking-widest rounded-[2rem] transition-all shadow-[0_10px_40px_rgba(137,121,255,0.3)] hover:shadow-[0_15px_50px_rgba(137,121,255,0.4)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">Start Your Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>
      </section>

      {/* Grid Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-4">Everything you need to thrive</h2>
          <p className="text-[var(--text-secondary)] font-medium max-w-xl mx-auto text-lg">Thoughtfully crafted tools to help you manage your time, energy, and emotions without the overwhelm.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 bg-[var(--bg-surface-elevated)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-[2rem] shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 group hover:border-[var(--brand-primary)]"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner"
              >
                {feat.icon}
              </div>
              <div>
                <h3 className="font-black text-xl text-[var(--text-primary)] mb-3 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Purpose Footer Banner */}
      <footer className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-[var(--border-subtle)] mt-12 text-sm text-[var(--text-tertiary)] font-medium pb-12 relative z-10">
        <p>© 2026 LOAH. Built for a clear mind, body, and soul. 💜</p>
      </footer>
    </div>
  );
}
