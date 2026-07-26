import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  UploadCloud,
  Ban,
  ArrowLeft,
  GraduationCap,
  Mail,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "UFGuessr - Terms of Service",
  description:
    "UFGuessr Terms of Service governing acceptable use, user-generated landmark photo submissions, intellectual property, and service disclaimers.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://ufguessr.com/terms",
  },
};

export default function TermsPage() {
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
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Last Updated: {lastUpdated} &bull; Independent Student Project
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mt-2 font-medium">
          Welcome to UFGuessr. By accessing or playing UFGuessr, submitting campus landmark photos, or exploring the application, you agree to comply with these Terms of Service.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <UploadCloud className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Content Rights</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            You retain ownership of photos you submit and grant UFGuessr a non-exclusive license to display them.
          </p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Ban className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fair Play</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            Automated bot scraping, rate-limit bypassing, or daily score forgery is strictly prohibited.
          </p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 w-fit">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Non-Affiliated</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            UFGuessr is an independent student project and is not affiliated with the University of Florida.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col gap-8 text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms & Educational Purpose
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr is a free, non-profit geographic exploration web application created for educational and campus exploration purposes. By accessing or using the website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. User Submissions & Image Licensing
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr allows users to submit campus landmark photos and coordinates for community gameplay review. By submitting content to UFGuessr:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5 font-medium">
            <li><strong>Ownership Representation:</strong> You represent and warrant that you own or have obtained all necessary rights, licenses, and permissions to submit the photo.</li>
            <li><strong>License Grant:</strong> You grant UFGuessr a worldwide, non-exclusive, royalty-free, perpetual license to host, store, resize, display, and distribute the image solely for gameplay.</li>
            <li><strong>Prohibited Content:</strong> You agree not to upload photos containing personally identifiable individuals, private property without authorization, offensive content, or copyrighted material you do not own.</li>
            <li><strong>Copyright / DMCA Takedown Requests:</strong> If you believe a photo hosted on UFGuessr infringes your copyright or privacy, contact us at <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">sam.morsics@gmail.com</code> with specific details of the image and its location for prompt review and removal.</li>
          </ul>
        </section>

        <hr className="border-white/10" />

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
              <Ban className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Acceptable Use & Fair Play
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            You agree to use UFGuessr only for lawful and intended gameplay purposes. You agree not to:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5 font-medium">
            <li>Use automated scripts, bots, spiders, or crawlers to harvest game data, coordinates, or media files.</li>
            <li>Attempt to bypass rate limits (e.g., submission hourly caps) or tamper with API requests.</li>
            <li>Submit false, misleading, or abusive landmark submissions.</li>
            <li>Interfere with server integrity or disrupt other users&apos; access to the application.</li>
            <li><strong>Enforcement:</strong> The maintainers reserve the right to block access, invalidate scores, or filter network identifiers/hashes for any user violating fair play rules or disrupting application services.</li>
          </ul>
        </section>

        <hr className="border-white/10" />

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Institutional Non-Affiliation Disclaimer
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr is an independent student project developed and operated by University of Florida students. UFGuessr is <strong>not officially affiliated with, endorsed by, sponsored by, or operated by the University of Florida or any official university department</strong>. All University of Florida trademarks, campus building names, and logos referenced are used under fair use for identification and geographic location purposes only.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Disclaimer of Warranties & Limitation of Liability
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            UFGuessr is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, express or implied. The developers do not guarantee uninterrupted server operation, error-free gameplay, or exact precision of geographic coordinate pins. In no event shall the project maintainers be liable for any indirect, incidental, or consequential damages resulting from your use of the website.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6. Changes to Terms
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            The maintainers reserve the right to modify or replace these Terms of Service at any time. Continued use of UFGuessr following the posting of any changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Section 7 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              7. Contact & Inquiries
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            If you have questions regarding these Terms of Service or wish to submit an intellectual property inquiry, please contact:
          </p>
          <div className="p-4 rounded-2xl glass border border-white/10 w-fit text-sm font-semibold text-blue-600 dark:text-blue-400">
            sam.morsics@gmail.com
          </div>
        </section>
      </div>
    </div>
  );
}
