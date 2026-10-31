import Link from "next/link";
import {
  Shield,
  Search,
  Key,
  Zap,
  Bot,
  CheckCircle,
  ArrowRight,
  Code2,
  FileSearch,
  Wrench,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Code Scanner",
    description:
      "Paste code or upload Python files directly into our Monaco-powered editor for instant analysis.",
    color: "cyan",
  },
  {
    icon: Search,
    title: "SQL Injection Detection",
    description:
      "Detects f-strings, concatenation, .format(), and % operator patterns in SQL queries.",
    color: "orange",
  },
  {
    icon: Key,
    title: "Credential Detection",
    description:
      "Finds hardcoded passwords, API keys, AWS tokens, GitHub PATs, and Slack tokens.",
    color: "red",
  },
  {
    icon: Zap,
    title: "Unsafe Code Execution",
    description:
      "Flags eval(), exec(), os.system(), subprocess shell=True, and pickle.loads() risks.",
    color: "yellow",
  },
  {
    icon: Bot,
    title: "Gemma 4 AI Analysis",
    description:
      "Google Gemma 4 explains every vulnerability in plain language and suggests targeted fixes.",
    color: "emerald",
  },
  {
    icon: CheckCircle,
    title: "Verified Patches",
    description:
      "Re-scan patched code to prove the vulnerability is fixed — not just claimed.",
    color: "emerald",
  },
];

const steps = [
  {
    number: "01",
    icon: Code2,
    title: "Upload or Paste Code",
    desc: "Use the Monaco editor or drag-and-drop a .py file.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Scan for Vulnerabilities",
    desc: "AST-based scanners analyze your code without executing it.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Generate AI Patches",
    desc: "Gemma 4 explains each issue and produces a corrected version.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Download Report",
    desc: "Get a professional PDF security report with before/after comparison.",
  },
];

const colorMap: Record<string, string> = {
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  orange: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  red: "text-red-400 bg-red-400/10 border-red-400/20",
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function LandingPage() {
  return (
    <div className="cyber-grid min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Powered by Google Gemma 4 · DigitalOcean Gradient
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              PATCH
            </span>
            <span className="text-white">PILOT</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 font-mono mb-4">
            Find the flaw.{" "}
            <span className="text-cyan-400">Fix the code.</span>{" "}
            <span className="text-emerald-400">Prove the patch.</span>
          </p>

          <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
            AI-powered security scanner for Python code. Detect SQL injection, hardcoded credentials,
            unsafe eval, and more — then get Gemma 4 to fix it and re-scan to prove it works.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg transition-all duration-200 glow-cyan text-lg"
            >
              <Shield className="w-5 h-5" />
              Start Scanning
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200 text-lg"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to{" "}
              <span className="text-cyan-400">secure your code</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Six powerful security modules working together to find and fix vulnerabilities in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const cls = colorMap[feature.color];
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-4 ${cls}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How PATCHPILOT works
            </h2>
            <p className="text-gray-400 text-lg">Four steps from vulnerable code to verified fix.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative text-center">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
                  )}
                  <div className="relative z-10 inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-cyan-500/50 flex items-center justify-center mb-4 glow-cyan">
                      <Icon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <span className="font-mono text-xs text-cyan-500 mb-2">{step.number}</span>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-cyan-950/20">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to secure your code?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            No account needed. Paste your Python code and get a full security report in seconds.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 font-bold rounded-xl text-lg transition-all hover:opacity-90 hover:scale-105 duration-200"
          >
            <Shield className="w-6 h-6" />
            Scan Your Code Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
