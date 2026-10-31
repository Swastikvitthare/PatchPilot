import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="font-bold text-sm">
              <span className="text-cyan-400">PATCH</span>
              <span className="text-white">PILOT</span>
            </span>
            <span className="text-gray-600 text-sm">© 2026</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-800 bg-gray-900">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">Powered by</span>
            <span className="text-xs text-emerald-400 font-semibold ml-1">Google Gemma 4</span>
            <span className="text-gray-600 text-xs mx-1">·</span>
            <span className="text-xs text-gray-400">DigitalOcean Gradient</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
            <Link href="/scanner" className="hover:text-gray-300 transition-colors">Scanner</Link>
            <a
              href="https://github.com/Swastikvitthare/PatchPilot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
