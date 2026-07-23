"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DynamicMap from "@/components/DynamicMap";
import { MapPin, Trophy, Play, Calendar, HelpCircle, Award, Sparkles, Share2, UploadCloud, Plus, X, AlertTriangle } from "lucide-react";

export default function Home() {
  const [dailyStatus, setDailyStatus] = useState<{ underConstruction: boolean; loaded: boolean }>({
    underConstruction: false,
    loaded: false,
  });
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

    const formData = new FormData();
    formData.append("name", submitName);
    formData.append("difficulty", submitDifficulty);
    formData.append("latitude", submitLatitude);
    formData.append("longitude", submitLongitude);
    formData.append("image", submitImageFile);
    formData.append("uploader", submitUploader || "Anonymous");

    try {
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
      {/* Abstract Background Gator Blobs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header Block */}
      <div className="flex flex-col items-center text-center gap-4 z-10 max-w-2xl mt-4 sm:mt-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-blue-500/20 rounded-full text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3 w-3 text-orange-500" />
          <span>UF Location Guessing Game</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 dark:from-blue-400 dark:via-blue-300 dark:to-orange-400 bg-clip-text text-transparent">
            UFGuessr
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
          How well do you know the University of Florida campus? Explore high-definition campus imagery and pin matching locations on the interactive map.
        </p>
      </div>

      {/* Primary Action Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full z-10">
        
        {/* Archive Mode Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-blue-500/20 transition-all duration-300 group shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="bg-blue-600/15 p-3 rounded-2xl w-fit text-blue-600 dark:text-blue-400 shadow-inner">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Archive Game Mode</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Play classic 5-round games anytime. Locations are randomized and non-repeating.
            </p>
          </div>

          <Link
            href="/game/archive"
            className="w-full py-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15 transform active:scale-95 transition-all py-3.5"
          >
            <Play className="h-4 w-4 fill-white" /> Start Archive Game
          </Link>
        </div>

        {/* Daily Mode Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-orange-500/20 transition-all duration-300 group shadow-lg relative overflow-hidden">
          
          {/* Daily Mode Status Badge */}
          {dailyStatus.loaded && (
            <div className="absolute top-4 right-4">
              {dailyStatus.underConstruction ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                  Locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Live Today
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="bg-orange-500/15 p-3 rounded-2xl w-fit text-orange-500 shadow-inner">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Daily Challenge
              {formattedDate && (
                <span className="block text-xs font-bold text-orange-500 mt-1 uppercase tracking-wider">
                  {formattedDate}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Updates automatically at 00:00 (Midnight) Eastern Time (ET). Guess the location of the day, lock in your score, and share your results!
            </p>
          </div>

          <Link
            href="/game/daily"
            className="w-full py-4.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/15 transform active:scale-95 transition-all py-3.5"
          >
            <Calendar className="h-4 w-4" /> Enter Daily Challenge
          </Link>
        </div>
      </div>

      {/* User Submission Feature Card */}
      <div className="glass-card w-full p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 shadow-lg hover:border-emerald-500/20 transition-all duration-300">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
              <UploadCloud className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-[10px] sm:text-xs text-emerald-500 uppercase tracking-widest">Community Submissions</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight mt-1">Suggest a Campus Landmark</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Have a great photo of a hidden campus spot or iconic landmark? Upload your photo, specify its precise map coordinates, and submit it for review to be featured in the game!
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitSuccess("");
            setSubmitError("");
            setIsSubmitOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 transform active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Submit Landmark
        </button>
      </div>

      {/* Rules and Scoring Details Block */}
      <div className="glass-card w-full p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col gap-6 z-10 shadow-lg">
        <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          How to Play & Scoring
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500 h-fit mt-0.5">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm">Drop the Pin</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Examine the photo of a campus spot. Click on the map to drop your pin.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-orange-500/10 p-2 rounded-xl text-orange-500 h-fit mt-0.5">
              <Award className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm">Perfect Proximity</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Earn up to 5,000 points per round! Distance under 15 meters earns a perfect 5k.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500 h-fit mt-0.5">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm">Share Your Score</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Copy your session results to your clipboard to easily share scores and map metrics with friends!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding credits */}
      <div className="flex flex-col items-center text-center gap-1.5 z-10 text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-gray-100 dark:border-white/5 w-full pt-6">
        <span>UFGuessr is built for fans of the University of Florida</span>
        <span className="text-gray-400 dark:text-gray-600 lowercase font-medium normal-case tracking-normal">Developed by Sam Morsics. All images belong to their respective Creative Commons authors.</span>
      </div>

      {/* USER SUBMISSION MODAL */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-4xl w-full rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-left">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <h2 className="text-xl font-extrabold">Submit a Campus Landmark</h2>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmissionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Inputs */}
              <div className="flex flex-col gap-3">
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                    {submitSuccess}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Landmark Name</label>
                  <input
                    type="text"
                    required
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                    placeholder="e.g. Century Tower"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uploader Name (Your Credit)</label>
                  <input
                    type="text"
                    value={submitUploader}
                    onChange={(e) => setSubmitUploader(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                    placeholder="e.g. Albert the Gator (leave blank for Anonymous)"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Difficulty Rating</label>
                  <select
                    required
                    value={submitDifficulty}
                    onChange={(e) => setSubmitDifficulty(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                  >
                    <option value="easy" className="bg-slate-950">Easy (Well-known campus hubs)</option>
                    <option value="medium" className="bg-slate-950">Medium (Standard library paths/halls)</option>
                    <option value="hard" className="bg-slate-950">Hard (Niche brick walls/sub-halls)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={submitLatitude}
                      onChange={(e) => setSubmitLatitude(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/5 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                      placeholder="e.g. 29.6488"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={submitLongitude}
                      onChange={(e) => setSubmitLongitude(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/5 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                      placeholder="e.g. -82.3433"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 flex items-start gap-1 p-2 bg-slate-900/10 dark:bg-slate-950/20 border border-white/5 rounded-lg leading-relaxed">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>
                    To specify coordinates, click on the UF campus map in the right-hand panel. Click to position the pin exactly over where you stood to take the photo!
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Landmark Image File (Max 5MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setSubmitImageFile(e.target.files?.[0] || null)}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 file:cursor-pointer cursor-pointer border border-dashed border-gray-200 dark:border-white/10 p-2 rounded-xl text-white"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-gray-100 dark:border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="px-5 py-2.5 rounded-xl glass hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-white border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-gray-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-emerald-500/10"
                  >
                    {submitSubmitting ? "Submitting..." : "Submit Photo"}
                  </button>
                </div>
              </div>

              {/* Right Column: Coordinate Map Pin Selector */}
              <div className="flex flex-col h-[300px] md:h-auto min-h-[350px]">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-500 animate-bounce" /> Click map to select coordinates
                </label>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
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
    </div>
  );
}
