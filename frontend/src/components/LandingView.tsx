'use client';

import {
  Shield,
  ScanLine,
  Wrench,
  FileCheck,
  Download,
  Zap,
  Lock,
  Code,
  ArrowRight,
  Github,
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
}

export default function LandingView({ onGetStarted }: LandingViewProps) {
  const features = [
    {
      icon: <Code size={28} />,
      title: 'Code Editor & Upload',
      description: 'Paste code or upload files directly with a built-in Monaco editor.',
    },
    {
      icon: <ScanLine size={28} />,
      title: 'Multi-Layer Scanning',
      description: 'SQL injection, hardcoded credentials, unsafe eval, and Python security checks.',
    },
    {
      icon: <Zap size={28} />,
      title: 'AI Explanations',
      description: 'Google Gemma 4 explains vulnerabilities in plain language with impact analysis.',
    },
    {
      icon: <Wrench size={28} />,
      title: 'Auto-Generated Patches',
      description: 'AI-generated security fixes with deterministic fallback when offline.',
    },
    {
      icon: <FileCheck size={28} />,
      title: 'Verify & Compare',
      description: 'Re-scan patched code and compare original vs. corrected side-by-side.',
    },
    {
      icon: <Download size={28} />,
      title: 'Security Reports',
      description: 'Download comprehensive PDF and JSON reports for compliance and auditing.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-accent/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyber-accent/5 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-accent/10 border border-cyber-accent/20 mb-8">
              <Lock size={14} className="text-cyber-accent" />
              <span className="text-sm text-cyber-accent font-medium">Powered by Google Gemma 4</span>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield size={56} className="text-cyber-accent animate-pulse-glow" />
              <h1 className="text-6xl sm:text-7xl font-black tracking-tight">
                <span className="text-white">PATCH</span>
                <span className="text-cyber-accent">PILOT</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-cyber-muted font-medium mb-4">
              Find the flaw. Fix the code. Prove the patch.
            </p>
            <p className="text-base text-cyber-muted/70 max-w-2xl mx-auto mb-12">
              AI-powered cybersecurity code scanner that detects vulnerabilities,
              generates patches, verifies fixes, and produces downloadable security reports.
            </p>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-3 px-8 py-4 rounded-xl
                  bg-cyber-accent text-cyber-bg font-bold text-lg
                  hover:bg-cyber-accent/90 transition-all glow-accent"
              >
                <ScanLine size={22} />
                Start Scanning
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 rounded-xl
                  border border-cyber-border text-cyber-text font-semibold text-lg
                  hover:bg-white/5 transition-all"
              >
                <Github size={22} />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <h2 className="text-3xl font-bold text-center mb-4">
          Complete Security Pipeline
        </h2>
        <p className="text-cyber-muted text-center mb-16 max-w-xl mx-auto">
          From vulnerability detection to verified patches — everything in one workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl bg-cyber-card/50 border border-cyber-border/50
                hover:border-cyber-accent/30 hover:bg-cyber-card transition-all duration-300
                animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-cyber-accent/10 flex items-center justify-center
                text-cyber-accent mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-cyber-muted text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-cyber-border/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-cyber-muted text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-accent" />
              Next.js
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-green" />
              FastAPI
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-purple" />
              Gemma 4
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-orange" />
              TypeScript
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-yellow" />
              Tailwind CSS
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-red" />
              DigitalOcean
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
