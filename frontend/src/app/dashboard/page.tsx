"use client";
import Link from "next/link";
import {
  Shield, Search, AlertTriangle, CheckCircle, ArrowRight,
  Code2, FileText, TrendingUp, Zap,
} from "lucide-react";

const stats = [
  { label: "Total Scans", value: "0", icon: Search, color: "cyan" },
  { label: "Vulnerabilities Found", value: "0", icon: AlertTriangle, color: "orange" },
  { label: "Patches Applied", value: "0", icon: CheckCircle, color: "emerald" },
  { label: "Files Secured", value: "0", icon: Shield, color: "blue" },
];

const quickActions = [
  {
    title: "New Scan",
    desc: "Scan Python code for security vulnerabilities",
    icon: Search,
    href: "/scanner",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    title: "Load Demo",
    desc: "See PATCHPILOT scan a vulnerable example file",
    icon: Code2,
    href: "/scanner?demo=true",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "View Docs",
    desc: "Architecture and deployment documentation",
    icon: FileText,
    href: "https://github.com/your-username/patchpilot",
    color: "from-purple-500 to-purple-600",
  },
];

const tips = [
  "Paste Python code or upload a .py file to scan for vulnerabilities.",
  "PATCHPILOT never executes your code — all analysis is done via AST parsing.",
  "Use the Re-scan feature to verify that AI-generated patches fix the issue.",
  "Download the PDF report to share findings with your team.",
  "Gemma 4 provides plain-language explanations of each vulnerability.",
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Welcome to PATCHPILOT. Start a scan or review the quick actions below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              cyan: "text-cyan-400 bg-cyan-400/10",
              orange: "text-orange-400 bg-orange-400/10",
              emerald: "text-emerald-400 bg-emerald-400/10",
              blue: "text-blue-400 bg-blue-400/10",
            };
            return (
              <div key={stat.label} className="p-6 rounded-xl bg-gray-900 border border-gray-800">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-200 block"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-semibold text-white mb-1">{action.title}</div>
                    <div className="text-gray-400 text-sm">{action.desc}</div>
                  </Link>
                );
              })}
            </div>

            {/* Start scan CTA */}
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-cyan-950/50 to-emerald-950/50 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Ready to scan?</h3>
                  <p className="text-gray-400 text-sm">
                    Paste Python code into the editor and get instant security analysis.
                  </p>
                </div>
                <Link
                  href="/scanner"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg transition-all"
                >
                  Scan Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tips Panel */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Tips
            </h2>
            <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
              <ul className="space-y-4">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-400 text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
