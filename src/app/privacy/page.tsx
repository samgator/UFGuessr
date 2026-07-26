import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Server,
  EyeOff,
  Cookie,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Key,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "UFGuessr - Privacy Policy",
  description:
    "Learn about how UFGuessr protects user privacy through IP anonymization, salted SHA-256 hashing, minimal data collection, and local storage policies.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://ufguessr.com/privacy",
  },
};

export default function PrivacyPage() {
  const lastUpdated = "July 26, 2026";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Back to Home Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-xl glass border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-transparent to-orange-500/10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-orange-500 text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Last Updated: {lastUpdated} &bull; Independent Student Project
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mt-2 font-medium">
          UFGuessr is committed to protecting player privacy. We collect minimal technical data necessary to prevent game abuse and run analytics, and we strictly anonymize and hash network identifiers.
        </p>
      </div>

      {/* Key Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">IP Anonymization</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            IP addresses are masked and hashed using SHA-256 before storage. We never store raw IP addresses.
          </p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Tracking Cookies</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            We do not use advertising, cross-site, or third-party tracking cookies.
          </p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 w-fit">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Anti-Abuse Only</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            Data is strictly used for rate-limiting submissions and single daily game validation.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col gap-8 text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. IP Address Anonymization & Cryptographic Hashing Policy
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            When you interact with UFGuessr (such as completing a Daily Challenge or submitting a landmark photo for community review), your network request transmits a standard HTTP header containing your IP address.
          </p>
          <div className="bg-slate-900/90 text-slate-200 p-4 rounded-2xl font-mono text-xs border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-white/10 pb-2">
              <CheckCircle2 className="h-4 w-4" /> Technical Anonymization & Cryptographic Salt Specification
            </div>
            <p>1. <span className="text-blue-400">Octet Masking:</span> IPv4 addresses are truncated (e.g., <code className="text-amber-300">192.168.1.150</code> becomes <code className="text-amber-300">192.168.1.0</code>) and IPv6 addresses are masked to host prefixes.</p>
            <p>2. <span className="text-blue-400">Salted SHA-256 Hashing:</span> The masked address is concatenated with a secret server salt (<code className="text-amber-300">PRIVACY_SALT</code>) maintained exclusively in secure environment variables.</p>
            <p>3. <span className="text-blue-400">Storage Output:</span> Only an irreversible, truncated hash format (e.g., <code className="text-amber-300">anon_a1b2c3d4e5f67890</code>) is written to database logs.</p>
          </div>
          <p className="text-sm leading-relaxed">
            Because the secret salt is kept strictly isolated in server-side environment variables and is never exposed in client bundles, hashes cannot be reverse-mapped, brute-forced, or correlated using rainbow tables against public IP address ranges. This guarantees that raw IP addresses cannot be recovered from our server records.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Information We Collect
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr collects the absolute minimum dataset required to operate the application safely and reliably:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5 font-medium">
            <li><strong>Anonymized Identifier:</strong> Salted SHA-256 hash of your anonymized IP address.</li>
            <li><strong>User-Agent String:</strong> Basic browser type and operating system version (used for responsive design diagnostics).</li>
            <li><strong>Gameplay Performance Data:</strong> Guesses, target coordinates, score (out of 5,000 pts), distance off (in meters), and completion timestamps.</li>
            <li><strong>Submitted Content:</strong> Landmark titles, geographic coordinates, difficulty, uploader alias, and photo media submitted voluntarily through the Community Submission feature.</li>
          </ul>
        </section>

        <hr className="border-white/10" />

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400">
              <Cookie className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Local Storage & Client Cookies
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr does not use tracking cookies. We utilize standard browser <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code> to maintain your session state locally on your device:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl glass border border-white/10">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">ufguessr_daily_&lt;date&gt;</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Stores your daily challenge score and attempt status locally to prevent re-attempts within 24 hours.</p>
            </div>
            <div className="p-3.5 rounded-xl glass border border-white/10">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">theme & reduced_motion</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Remembers your dark/light mode preference and animation performance settings.</p>
            </div>
          </div>
        </section>

        <hr className="border-white/10" />

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <Server className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Infrastructure & Third-Party Services
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr is hosted on serverless architecture and uses select third-party service providers:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5 font-medium">
            <li><strong>Vercel Analytics:</strong> Privacy-focused web analytics that collects aggregated metric trends without using cookies or persistent user tracking.</li>
            <li><strong>Supabase / PostgreSQL:</strong> Secure database storage for landmark locations, daily queues, and daily stats.</li>
          </ul>
        </section>

        <hr className="border-white/10" />

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Operator & Institutional Non-Affiliation Disclaimer
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr is an independent, non-profit student geographic exploration project developed and maintained by University of Florida students. UFGuessr is <strong>not officially affiliated with, endorsed by, operated by, or sponsored by the University of Florida or any official university department</strong>. This application is maintained independently for educational and community exploration purposes.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6. Contact Us & Data Requests
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            If you have questions about this Privacy Policy, wish to report a privacy concern, or request deletion of a landmark submission you uploaded, please contact us at:
          </p>
          <div className="p-4 rounded-2xl glass border border-white/10 w-fit text-sm font-semibold text-blue-600 dark:text-blue-400">
            sam.morsics@gmail.com
          </div>
        </section>
      </div>
    </div>
  );
}

