import Link from "next/link";
import { Shield, Github, LayoutDashboard, Search, ExternalLink } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
              <Shield className="w-4.5 h-4.5 text-cyan-400" style={{ width: "18px", height: "18px" }} />
            </div>
            <span className="font-black text-lg tracking-tight">
              <span className="text-cyan-400">PATCH</span>
              <span className="text-white">PILOT</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              Scanner
            </Link>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <a
              href="https://github.com/Swastikvitthare/PatchPilot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 transition-all text-sm"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg transition-all text-sm"
            >
              <Search className="w-3.5 h-3.5" />
              Scan Code
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
