"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDistanceInMeters, calculateScore } from "@/lib/geo";
import DynamicMap from "@/components/DynamicMap";
import { MapPin, Trophy, Share2, Check, Construction, ArrowRight, HelpCircle, Lock, Maximize2, Minimize2 } from "lucide-react";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  difficulty: string;
}

export default function DailyGamePage() {
  const [loading, setLoading] = useState(true);
  const [underConstruction, setUnderConstruction] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [userGuess, setUserGuess] = useState<[number, number] | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [splitScreen, setSplitScreen] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Load Daily Game State
  const fetchDailyGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/daily");
      if (res.ok) {
        const data = await res.json();
        
        if (data.underConstruction) {
          setUnderConstruction(true);
          setLoading(false);
          return;
        }

        setUnderConstruction(false);
        setLocation(data.location);
        setDateStr(data.date);

        // Check if player already completed today's daily
        const savedResult = localStorage.getItem(`ufguessr_daily_${data.date}`);
        if (savedResult) {
          const parsed = JSON.parse(savedResult);
          setUserGuess(parsed.guess);
          setHasGuessed(true);
          setScore(parsed.score);
          setDistance(parsed.distance);
        }
      }
    } catch (err) {
      console.error("Failed to load daily game:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyGame();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (!hasGuessed) {
      setUserGuess([lat, lng]);
    }
  };

  const handleGuess = () => {
    if (!userGuess || hasGuessed || !location || !dateStr) return;

    const dist = getDistanceInMeters(
      userGuess[0],
      userGuess[1],
      location.latitude,
      location.longitude
    );

    const calculatedScore = calculateScore(dist);

    setDistance(dist);
    setScore(calculatedScore);
    setHasGuessed(true);

    // Persist result in localStorage to block multiple submissions
    localStorage.setItem(
      `ufguessr_daily_${dateStr}`,
      JSON.stringify({
        guess: userGuess,
        score: calculatedScore,
        distance: dist,
        date: dateStr,
      })
    );
  };

  const handleShare = () => {
    if (!location) return;
    const formattedDistance = distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(2)}km`;
    const shareText = `UFGuessr Daily Challenge 🐊 (${dateStr})\n📍 Distance: ${formattedDistance} off\n🏆 Score: ${score.toLocaleString()} / 5,000 pts!\n\nCan you beat me? Play now: ${window.location.origin}/game/daily`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
          <div className="animate-spin h-10 w-10 text-blue-500" />
          <h2 className="text-xl font-bold">Querying Midnight ET Queue...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Checking feature flags and fetching today&apos;s campus location.
          </p>
        </div>
      </div>
    );
  }

  // Under Construction view
  if (underConstruction) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900 text-white">
        <div className="max-w-xl w-full text-center flex flex-col items-center gap-6 glass-dark p-8 sm:p-12 rounded-3xl border border-yellow-500/20 shadow-2xl relative overflow-hidden">
          
          {/* Construction Stripes Border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-slate-950 to-yellow-500 bg-[length:40px_100%] animate-[dash_2s_linear_infinite]" />
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-full text-yellow-500 animate-pulse mt-4">
            <Construction className="h-14 w-14" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Under Construction
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Daily Game Mode is Locked</h1>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Our campus photographers are currently hard at work uploading more high-resolution landmarks of UF.
              Check back soon for the Daily Midnight ET competition!
            </p>
          </div>

          <div className="border-t border-white/10 w-full pt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link
              href="/game/archive"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              Play Archive Mode <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass-dark hover:bg-white/10 font-semibold text-sm transition-all border border-white/10 flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center flex flex-col gap-4">
          <HelpCircle className="h-12 w-12 text-orange-500 mx-auto" />
          <h2 className="text-xl font-bold">No Daily Game Available</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active queue item found for today, and database has no fallback locations.
          </p>
          <Link href="/" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full flex relative ${splitScreen ? "flex-col md:flex-row h-[calc(100vh-65px)]" : "flex-col"}`}>
      
      {/* 1. Full Image Showcase Area */}
      <div className={`relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden ${splitScreen ? "w-full md:w-1/2 h-1/2 md:h-full" : "min-h-[calc(100vh-180px)]"}`}>
        <Image
          src={location.imageUrl}
          alt="Daily Target Location"
          fill
          className="object-contain pointer-events-none select-none filter brightness-95"
          sizes="100vw"
          priority
          referrerPolicy="no-referrer"
        />

        {/* UI Overlay Card for Daily Info */}
        <div className="absolute top-4 left-4 z-10 glass-dark p-3.5 sm:p-5 rounded-2xl flex flex-col gap-1 border border-white/10 text-white max-w-xs shadow-2xl">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Daily Challenge</span>
            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
              location.difficulty === "easy"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : location.difficulty === "medium"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {location.difficulty}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black mt-1">{dateStr}</h2>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-sm font-semibold text-gray-300">
            <span>One attempt per day</span>
          </div>
        </div>

        {/* Floating Controller / Toggle for layouts */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setSplitScreen(!splitScreen)}
            className="p-3 rounded-xl glass-dark text-white border border-white/10 hover:bg-white/10 transition-colors shadow-2xl"
            title={splitScreen ? "Toggle Full Image" : "Toggle Split Screen"}
          >
            <ArrowRight className="h-4 w-4 rotate-95" />
          </button>
        </div>

        {/* Bottom Banner/Hint prompt */}
        {!hasGuessed && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 glass-dark py-2 px-5 rounded-full border border-white/10 text-white text-xs font-medium shadow-2xl flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>This is the daily competitive map. Submit your guess to lock in your score!</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Map Container */}
      <div
        className={`transition-all duration-300 ${
          isMapFullscreen
            ? "fixed inset-0 w-screen h-[100dvh] z-50 bg-slate-900 p-0 rounded-none"
            : splitScreen
            ? "z-20 w-full md:w-1/2 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-white/10 bg-slate-900"
            : `z-20 absolute bottom-6 right-6 ${
                mapExpanded
                  ? "w-[340px] h-[280px] sm:w-[500px] sm:h-[400px]"
                  : "w-[260px] h-[180px] sm:w-[320px] sm:h-[240px]"
              } group shadow-2xl hover:border-blue-500/30 border border-white/10 bg-slate-50 dark:bg-slate-900/90 rounded-2xl overflow-hidden p-1.5`
        }`}
        onMouseEnter={() => !splitScreen && !isMapFullscreen && setMapExpanded(true)}
        onMouseLeave={() => !splitScreen && !isMapFullscreen && setMapExpanded(false)}
      >
        <div className="w-full h-full relative flex flex-col">
          {/* Small floating header inside map for floating mode */}
          {!splitScreen && !isMapFullscreen && (
            <div className="absolute top-3 left-3 z-[1002] glass-dark py-1 px-2.5 rounded-lg border border-white/10 text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1 pointer-events-none">
              <MapPin className="h-3 w-3 text-blue-400" />
              <span>Campus Map</span>
            </div>
          )}

          {/* Fullscreen / Exit Controls */}
          {isMapFullscreen ? (
            <button
              onClick={() => setIsMapFullscreen(false)}
              className="absolute top-4 right-4 z-[1002] flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-2xl border border-orange-500/20"
            >
              <Minimize2 className="h-4 w-4" /> Exit Fullscreen
            </button>
          ) : (
            <button
              onClick={() => setIsMapFullscreen(true)}
              className="absolute top-3 right-3 z-[1002] p-2 rounded-lg glass-dark text-white border border-white/10 hover:bg-white/15 transition-colors shadow-lg"
              title="Fullscreen Map"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Map view */}
          <div className="flex-1 relative min-h-0">
            <DynamicMap
              onMapClick={handleMapClick}
              userGuess={userGuess}
              actualLocation={hasGuessed ? [location.latitude, location.longitude] : null}
              showResult={hasGuessed}
              readonly={hasGuessed}
            />
          </div>

          {/* Control Bar: Pin placement & Guess action */}
          <div className="p-3 bg-white/95 dark:bg-slate-900/95 border-t border-gray-100 dark:border-white/10 flex flex-col gap-2 rounded-b-xl">
            {/* If has not guessed, show guess validation status or guide */}
            {!hasGuessed ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {userGuess ? (
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Pin dropped
                    </span>
                  ) : (
                    "No pin selected yet"
                  )}
                </span>
                <button
                  onClick={handleGuess}
                  disabled={!userGuess}
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-gray-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:shadow-none"
                >
                  Guess
                </button>
              </div>
            ) : (
              /* If has guessed, show daily results and sharing action */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Distance Off</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                      {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(2)}km`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Score Earned</span>
                    <span className="font-black text-xl text-yellow-500">
                      {score.toLocaleString()} / 5,000 pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-bold text-gray-600 dark:text-gray-300 max-w-[130px] truncate" title={location.name}>
                    {location.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" /> Share Score
                        </>
                      )}
                    </button>
                    <Link
                      href="/"
                      className="px-3.5 py-2 rounded-xl glass hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 font-bold text-xs"
                    >
                      Home
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
