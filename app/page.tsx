'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, CheckCircle2, Zap, Smile, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="text-violet-600" size={24} />,
      title: 'Brain Dump',
      desc: 'Unload your messy, raw thoughts instantly and organize them later.',
    },
    {
      icon: <CheckCircle2 className="text-[#3b82f6]" size={24} />,
      title: 'Task Management',
      desc: 'Track and check off your daily goals with a simple, clean to-do list.',
    },
    {
      icon: <Zap className="text-amber-500" size={24} />,
      title: 'Focus Sessions',
      desc: 'Nurture habits and routines with interactive step-by-step timers.',
    },
    {
      icon: <Smile className="text-emerald-600" size={24} />,
      title: 'Mood Journaling',
      desc: 'Reflect on your day, track your feelings, and keep a clean diary.',
    },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-[var(--bg-app)] via-[var(--bg-canvas)] to-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-[var(--brand-primary-muted)] overflow-y-auto overflow-x-hidden relative">
      {/* Top Header Navigation */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-[var(--brand-primary-muted)] p-2 rounded-xl text-[var(--brand-primary)]">
            <Brain size={24} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[var(--text-primary)]">LOAH</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
        >
          Open App <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 select-none">
        <div className="inline-block px-4 py-1.5 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary-muted)] text-[var(--brand-primary)] text-xs font-bold uppercase tracking-wider">
          Life Organiser & Healer
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
          Sanctuary for your{' '}
          <span className="text-[var(--brand-primary)] underline decoration-[var(--brand-primary-muted)] underline-offset-4">focus</span>{' '}
          and{' '}
          <span className="text-[var(--danger-default)] underline decoration-[var(--danger-surface)] underline-offset-4">growth</span>.
        </h1>

        <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-500 leading-relaxed font-medium">
          A minimalistic productivity suite designed for ADHD minds. 
          Unclutter your ideas, organize your timeline, and heal in perfect harmony.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Start Your Journey <Sparkles size={16} />
          </Link>
        </div>
      </section>

      {/* Grid Features */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-3xl shadow-sm hover:shadow-md hover:border-[var(--brand-primary)] transition-all duration-300 flex flex-col gap-4"
            >
              <div className="bg-[var(--bg-canvas)] w-fit p-3 rounded-2xl border border-[var(--border-default)]">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-950 mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Purpose Footer Banner */}
      <footer className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-[var(--border-subtle)] mt-16 text-xs text-[var(--text-tertiary)] font-medium pb-24">
        <p>© 2026 LOAH. Built for a clear mind, body, and soul. 💜</p>
      </footer>
    </div>
  );
}
