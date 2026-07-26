"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";
import { MapPin, Archive, Play, Calendar, HelpCircle, Award, Sparkles, Share2, UploadCloud, Plus, X, AlertTriangle, Mail, Send, Copy, Check, Trophy, Eye, ShieldCheck, FileText } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

export default function Home() {
  const [dailyStatus, setDailyStatus] = useState<{ underConstruction: boolean; loaded: boolean }>({
    underConstruction: false,
    loaded: false,
  });
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [dailyScore, setDailyScore] = useState<number | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");

  // Submission States
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const [submitDifficulty, setSubmitDifficulty] = useState("easy");
  const [submitLatitude, setSubmitLatitude] = useState("");
  const [submitLongitude, setSubmitLongitude] = useState("");
  const [submitImageFile, setSubmitImageFile] = useState<File | null>(null);
  const [submitUploader, setSubmitUploader] = useState("");
  const [submitSubmitting, setSubmitSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Contact Modal States
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const CONTACT_EMAIL = "sam.morsics@gmail.com";

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = contactSubject || "Inquiry from UFGuessr";
    const body = `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`;
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setIsContactOpen(false);
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL || "");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFormMapClick = (lat: number, lng: number) => {
    setSubmitLatitude(lat.toFixed(6));
    setSubmitLongitude(lng.toFixed(6));
  };

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    if (!submitImageFile) {
      setSubmitError("Please select an image file to upload");
      setSubmitSubmitting(false);
      return;
    }

    try {
      // Compress the image client-side to bypass payload size limits
      const compressedImage = await compressImage(submitImageFile);

      const formData = new FormData();
      formData.append("name", submitName);
      formData.append("difficulty", submitDifficulty);
      formData.append("latitude", submitLatitude);
      formData.append("longitude", submitLongitude);
      formData.append("image", compressedImage);
      formData.append("uploader", submitUploader || "Anonymous");

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess("Landmark submitted successfully! It is now pending admin review.");
        setSubmitName("");
        setSubmitDifficulty("easy");
        setSubmitLatitude("");
        setSubmitLongitude("");
        setSubmitImageFile(null);
        setSubmitUploader("");
        setIsSubmitOpen(false); // Close the submission modal on successful submit
      } else {
        setSubmitError(data.error || "Failed to submit landmark.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Connection error submitting landmark.");
    } finally {
      setSubmitSubmitting(false);
    }
  };

  // Query Daily Game status to show live status badge on landing
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/game/daily");
        if (res.ok) {
          const data = await res.json();
          setDailyStatus({
            underConstruction: !!data.underConstruction,
            loaded: true,
          });

          // Check if today's daily challenge was completed in localStorage
          if (data.date) {
            const savedResult = localStorage.getItem(`ufguessr_daily_${data.date}`);
            if (savedResult) {
              try {
                const parsed = JSON.parse(savedResult);
                setDailyCompleted(true);
                setDailyScore(parsed.score ?? 0);
              } catch (e) {
                console.error("Failed to parse daily result from localStorage:", e);
              }
            }
          }
        }
      } catch {
        setDailyStatus({ underConstruction: false, loaded: false });
      }
    };
    fetchStatus();

    // Format current date in human readable layout
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setFormattedDate(today.toLocaleDateString(undefined, options));
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto gap-12 relative">

      {/* Hero Header Block */}
      <div className="flex flex-col items-center text-center gap-3 z-10 max-w-2xl mt-2 sm:mt-4">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 dark:from-blue-400 dark:via-blue-300 dark:to-orange-400 bg-clip-text text-transparent">
            UFGuessr
          </span>
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-blue-500/20 rounded-full text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3 w-3 text-orange-500" />
          <span>UF Location Guessing Game</span>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
          How well do you know the University of Florida campus? Explore high-definition campus imagery and pin matching locations on the interactive map.
        </p>
      </div>

      {/* Primary Action Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full z-10">
        
        {/* Daily Mode Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-10 dark:opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-orange-500/30 transition-all duration-300 group shadow-lg relative overflow-hidden h-full">
            
            {/* Daily Mode Status Badge */}
            {dailyStatus.loaded && (
              <div className="absolute top-4 right-4">
                {dailyStatus.underConstruction ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-yellow-400 border border-amber-500/30">
                    Locked
                  </span>
                ) : dailyCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="h-3 w-3" /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                    Live Today
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="bg-orange-100 dark:bg-orange-500/20 p-3 rounded-2xl w-fit text-orange-600 dark:text-orange-400 shadow-inner border border-orange-200 dark:border-orange-500/30">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Daily Challenge
                {formattedDate && (
                  <span className="block text-xs font-bold text-orange-700 dark:text-orange-400 mt-1 uppercase tracking-wider">
                    {formattedDate}
                  </span>
                )}
              </h2>

              {dailyCompleted ? (
                <div className="flex flex-col gap-2.5 my-0.5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    You&apos;ve completed today&apos;s challenge! Click below to review your guess, map distance, and score breakdown.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Today&apos;s Score: <span className="text-sm font-black text-slate-900 dark:text-white">{dailyScore?.toLocaleString() ?? 0}</span> / 5,000 pts</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Updates automatically at 00:00 (Midnight) Eastern Time (ET). Guess the location of the day, lock in your score, and share your results!
                </p>
              )}
            </div>

            <Link
              href="/game/daily"
              className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-orange-500/25 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transform active:scale-95 transition-all py-4 cursor-pointer"
            >
              {dailyCompleted ? (
                <>
                  <Eye className="h-4 w-4" /> Review Score & View Guess
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" /> Enter Daily Challenge
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Archive Mode Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-10 dark:opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 group shadow-lg relative h-full">
            <div className="flex flex-col gap-3">
              <div className="bg-blue-100 dark:bg-blue-600/20 p-3 rounded-2xl w-fit text-blue-600 dark:text-blue-400 shadow-inner border border-blue-200 dark:border-blue-500/30">
                <Archive className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Archive Game Mode</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Play classic 5-round games anytime. Locations are randomized and non-repeating.
              </p>
            </div>

            <Link
              href="/game/archive"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" /> Start Archive Game
            </Link>
          </div>
        </div>
      </div>

      {/* User Submission Feature Card */}
      <div className="flex flex-col gap-4 w-full z-10 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-10 dark:opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
        
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 text-sm font-bold flex items-center justify-between gap-3 shadow-md relative z-10">
            <span className="flex items-center gap-2">🎉 {submitSuccess}</span>
            <button 
              onClick={() => setSubmitSuccess("")} 
              className="text-xs font-extrabold underline hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="glass-card w-full p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg hover:border-emerald-500/30 transition-all duration-300 relative">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 dark:bg-emerald-950/60 p-2.5 rounded-2xl text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 shadow-sm">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="font-black text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Community Submissions</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Suggest a Campus Landmark</h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              Have a great photo of a hidden campus spot or iconic landmark? Upload your photo, specify its precise map coordinates, and submit it for review to be featured in the game!
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitSuccess("");
              setSubmitError("");
              setIsSubmitOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transform active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Submit Landmark
          </button>
        </div>
      </div>

      {/* Rules and Scoring Details Block */}
      <div className="flex flex-col w-full z-10 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-10 dark:opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
        <div className="glass-card w-full p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col gap-6 shadow-lg relative">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 border-b-2 border-slate-200 dark:border-white/5 pb-4 text-slate-900 dark:text-white">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            How to Play & Scoring
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="bg-blue-100 dark:bg-blue-500/10 p-2.5 rounded-2xl text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 h-fit mt-0.5 shadow-sm">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-900 dark:text-white">Drop the Pin</span>
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Examine the photo of a campus spot. Click on the map to drop your pin.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-orange-100 dark:bg-orange-500/10 p-2.5 rounded-2xl text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 h-fit mt-0.5 shadow-sm">
                <Award className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-900 dark:text-white">Perfect Proximity</span>
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Earn up to 5,000 points per round! Distance under 15 meters earns a perfect 5k.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 h-fit mt-0.5 shadow-sm">
                <Share2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-900 dark:text-white">Share Your Score</span>
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Copy your session results to your clipboard to easily share scores and map metrics with friends!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding credits & Social Links */}
      <div className="flex flex-col items-center text-center gap-4 z-10 border-t-2 border-slate-200 dark:border-white/5 w-full pt-6">
        {/* Policy & Contact Links Section */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsContactOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10 text-xs font-black text-slate-800 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-all duration-200 shadow-sm cursor-pointer min-h-[44px]"
          >
            <Mail className="h-4 w-4" />
            <span>Contact</span>
          </button>
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10 text-xs font-black text-slate-800 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200 shadow-sm min-h-[44px]"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10 text-xs font-black text-slate-800 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200 shadow-sm min-h-[44px]"
          >
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Terms of Service</span>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center gap-1 text-[11px] text-slate-700 dark:text-gray-400 font-extrabold uppercase tracking-widest">
          <span>UFGuessr is inspired by GeoGuessr</span>
          <span className="text-slate-700 dark:text-gray-400 lowercase font-semibold normal-case tracking-normal mt-0.5">Developed by Sam Morsics. All images belong to their respective uploaders.</span>
          <span className="text-slate-600 dark:text-gray-400 lowercase font-medium normal-case tracking-normal">To request an image takedown, please use the contact form.</span>
        </div>
      </div>

      {/* USER SUBMISSION MODAL */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-left bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <UploadCloud className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Submit a Campus Landmark
              </h2>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmissionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Inputs */}
              <div className="flex flex-col gap-4">
                {submitError && (
                  <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/60 border-2 border-red-400 text-red-950 dark:text-red-200 text-xs font-bold shadow-sm">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 text-xs font-bold shadow-sm">
                    {submitSuccess}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Landmark Name</label>
                  <input
                    type="text"
                    required
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                    placeholder="e.g. Century Tower"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Uploader Name (Your Credit)</label>
                  <input
                    type="text"
                    value={submitUploader}
                    onChange={(e) => setSubmitUploader(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                    placeholder="e.g. Albert the Gator (leave blank for Anonymous)"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Difficulty Rating</label>
                  <select
                    required
                    value={submitDifficulty}
                    onChange={(e) => setSubmitDifficulty(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="easy" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Easy (Well-known campus hubs)</option>
                    <option value="medium" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Medium (Standard library paths/halls)</option>
                    <option value="hard" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Hard (Niche brick walls/sub-halls)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={submitLatitude}
                      onChange={(e) => setSubmitLatitude(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                      placeholder="e.g. 29.6488"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={submitLongitude}
                      onChange={(e) => setSubmitLongitude(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                      placeholder="e.g. -82.3433"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    To specify coordinates, click on the UF campus map in the right-hand panel. Position the pin exactly over where you stood to take the photo!
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-t-2 border-slate-200 dark:border-slate-800 pt-4">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Landmark Image File (Max 5MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setSubmitImageFile(e.target.files?.[0] || null)}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:shadow-md cursor-pointer text-slate-900 dark:text-white font-semibold text-xs"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-2 border-t-2 border-slate-200 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitSubmitting}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                  >
                    {submitSubmitting ? "Submitting..." : "Submit Photo"}
                  </button>
                </div>
              </div>

              {/* Right Column: Coordinate Map Pin Selector */}
              <div className="flex flex-col h-[300px] md:h-auto min-h-[350px]">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-bounce" /> Click map to select coordinates
                </label>
                <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-md">
                  <DynamicMap
                    onMapClick={handleFormMapClick}
                    userGuess={submitLatitude && submitLongitude ? [parseFloat(submitLatitude), parseFloat(submitLongitude)] : null}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col gap-5 text-left bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Contact Developer
              </h2>
              <button
                onClick={() => setIsContactOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  placeholder="e.g. Albert Gator"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Your Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  placeholder="e.g. albert@ufl.edu"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  placeholder="e.g. Feedback about daily mode"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-sm"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-2 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={copyEmailToClipboard}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  {copiedEmail ? "Copied!" : "Copy Email"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Open Mail Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
