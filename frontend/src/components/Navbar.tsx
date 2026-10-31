'use client';

import { AppView } from '@/types';
import {
  Shield,
  ScanLine,
  FileText,
  Wrench,
  ClipboardList,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasScan: boolean;
  hasPatch: boolean;
  onNewScan: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  hasScan,
  hasPatch,
  onNewScan,
}: NavbarProps) {
  const navItems: { view: AppView; label: string; icon: React.ReactNode; enabled: boolean }[] = [
    { view: 'scanner', label: 'Scanner', icon: <ScanLine size={16} />, enabled: true },
    { view: 'results', label: 'Results', icon: <FileText size={16} />, enabled: hasScan },
    { view: 'patch', label: 'Patch', icon: <Wrench size={16} />, enabled: hasPatch },
    { view: 'report', label: 'Report', icon: <ClipboardList size={16} />, enabled: hasScan },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-surface/95 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-cyber-accent hover:text-white transition-colors"
          >
            <Shield size={24} className="text-cyber-accent" />
            <span className="font-bold text-lg tracking-wide">PATCHPILOT</span>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => item.enabled && onNavigate(item.view)}
                disabled={!item.enabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    currentView === item.view
                      ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30'
                      : item.enabled
                      ? 'text-cyber-muted hover:text-cyber-text hover:bg-white/5'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}

            <div className="w-px h-8 bg-cyber-border mx-2" />

            <button
              onClick={onNewScan}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30
                hover:bg-cyber-accent/20 transition-all"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Scan</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
