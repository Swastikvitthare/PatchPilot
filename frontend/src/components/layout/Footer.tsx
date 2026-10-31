import React from "react";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4 text-cyan-400/60" />
            <span>
              &copy; {new Date().getFullYear()} PATCHPILOT. All rights reserved.
            </span>
          </div>

          {/* Powered By */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by Gemma 4
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <a href="/scanner" className="hover:text-gray-300 transition-colors">
              Scanner
            </a>
            <a
              href="/dashboard"
              className="hover:text-gray-300 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
