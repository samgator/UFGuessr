"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDistanceInMeters, calculateScore } from "@/lib/geo";
import DynamicMap from "@/components/DynamicMap";
import { MapPin, Trophy, Share2, Check, Construction, ArrowRight, HelpCircle, Lock, Maximize2, Eye, X, Loader2, Camera } from "lucide-react";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  difficulty: string;
  uploader?: string | null;
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
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [peekPhoto, setPeekPhoto] = useState(false);
  const [statId, setStatId] = useState<number | null>(null);
  const [hasShared, setHasShared] = useState(false);

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
          if (parsed.statId) setStatId(parsed.statId);
          if (parsed.shared) setHasShared(true);
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

  const handleGuess = async () => {
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

    let newStatId: number | null = null;
    try {
      const res = await fetch("/api/game/daily/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          score: calculatedScore,
          distance: dist,
          locationId: location.id,
          locationName: location.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.statId) {
          newStatId = data.statId;
          setStatId(data.statId);
        }
      }
    } catch (err) {
      console.error("Failed to log daily stat:", err);
    }

    // Persist result in localStorage to block multiple submissions
    localStorage.setItem(
      `ufguessr_daily_${dateStr}`,
      JSON.stringify({
        guess: userGuess,
        score: calculatedScore,
        distance: dist,
        date: dateStr,
        statId: newStatId,
        shared: false,
      })
    );
  };

  const handleShare = async () => {
    if (!location) return;
    const formattedDistance = distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(2)}km`;
    const shareText = `UFGuessr Daily Challenge 🐊 (${dateStr})\n📍 Distance: ${formattedDistance} off\n🏆 Score: ${score.toLocaleString()} / 5,000 pts!\n\nCan you beat me? Play now: ${window.location.origin}/game/daily`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (!hasShared) {
      setHasShared(true);
      try {
        await fetch("/api/game/daily/stats", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            statId: statId || undefined,
            date: dateStr,
          }),
        });

        const savedResult = localStorage.getItem(`ufguessr_daily_${dateStr}`);
        if (savedResult) {
          const parsed = JSON.parse(savedResult);
          localStorage.setItem(
            `ufguessr_daily_${dateStr}`,
            JSON.stringify({ ...parsed, shared: true })
          );
        }
      } catch (err) {
        console.error("Failed to update share stat:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold">Querying The Queue...</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Fetching today&apos;s campus location.
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
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-full text-amber-500 dark:text-yellow-400 animate-pulse mt-4">
            <Construction className="h-14 w-14" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-amber-600 dark:text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Under Construction
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Daily Game Mode is Locked</h1>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              We are currently working on uploading more daily locations.
              Check back soon for the Daily!
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
          <HelpCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto" />
          <h2 className="text-xl font-bold">No Daily Game Available</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
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
    <div className="flex-1 w-full flex flex-col relative h-[calc(100dvh-57px)] sm:h-[calc(100dvh-65px)] max-h-[calc(100dvh-57px)] sm:max-h-[calc(100dvh-65px)] overflow-hidden">
      
      {/* 1. Full Image Showcase Area */}
      <div className="relative bg-slate-950 flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <Image
          src={location.imageUrl}
          alt="Daily Target Location"
          fill
          className="object-contain pointer-events-none select-none filter brightness-95"
          sizes="100vw"
          priority
          referrerPolicy="no-referrer"
        />

        {/* Top Info Card & Hint Pill Container */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-24px)] sm:max-w-xs">
          {/* UI Overlay Card for Daily Info */}
          <div className="glass-dark p-3.5 sm:p-5 rounded-2xl flex flex-col gap-1 border border-white/10 text-white w-full shadow-2xl">
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
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-300 font-medium">
              <Camera className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <span>Photo by <span className="font-bold text-white">{location.uploader || "Anonymous"}</span></span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-sm font-semibold text-gray-300">
              <span>One attempt per day</span>
            </div>
          </div>

          {/* Hint prompt pill aligned below and matching width of top container */}
          {!hasGuessed && (
            <div className="glass-dark py-2 px-3.5 rounded-2xl border border-white/10 text-white text-xs font-medium shadow-2xl flex items-center justify-center gap-1.5 w-full text-center">
              <Trophy className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span className="truncate sm:whitespace-normal">Submit your guess to lock in today&apos;s score!</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Responsive Navigation Dock Bar */}
      {!isMapFullscreen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-900/95 backdrop-blur-md border-t border-white/10 shadow-2xl">
          <button
            onClick={() => {
              setIsMapFullscreen(false);
              setMapExpanded(false);
            }}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isMapFullscreen && !mapExpanded
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            <Eye className="h-4 w-4" /> Photo
          </button>
          <button
            onClick={() => {
              setIsMapFullscreen(false);
              setMapExpanded(!mapExpanded);
            }}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mapExpanded && !isMapFullscreen
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            <MapPin className="h-4 w-4" />{" "}
            {hasGuessed
              ? mapExpanded
                ? "Hide Map"
                : "Review Map"
              : mapExpanded
              ? "Small Map"
              : "Expand Map"}
          </button>
          <button
            onClick={() => setIsMapFullscreen(true)}
            className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" /> Full Map
          </button>
        </div>
      )}

      {/* 2. Interactive Map Container */}
      <div
        className={`transition-all duration-300 ${
          isMapFullscreen
            ? "fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-900 p-0 rounded-none map-fullscreen"
            : `z-40 md:z-20 absolute bottom-[calc(68px+env(safe-area-inset-bottom))] md:bottom-6 right-3 md:right-6 ${
                mapExpanded
                  ? "w-[calc(100vw-24px)] md:w-[500px] h-[320px] md:h-[400px]"
                  : hasGuessed
                  ? "w-[calc(100vw-24px)] md:w-[320px] h-auto md:h-[240px]"
                  : "w-[240px] h-[160px] md:w-[320px] md:h-[240px]"
              } group shadow-2xl hover:border-blue-500/30 border border-white/10 bg-slate-50 dark:bg-slate-900/90 rounded-2xl overflow-hidden p-1.5`
        }`}
        onMouseEnter={() => !isMapFullscreen && setMapExpanded(true)}
        onMouseLeave={() => !isMapFullscreen && setMapExpanded(false)}
      >
        <div className="w-full h-full relative flex flex-col">
          
          {/* Top Control Bar for Fullscreen Map (Highest Z-Index & Isolated Touch Events) */}
          {isMapFullscreen ? (
            <div
              className="fixed top-0 left-0 right-0 z-[99999] p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] bg-slate-900/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPeekPhoto(!peekPhoto);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-dark text-white font-bold text-xs hover:bg-white/15 transition-all border border-white/10 cursor-pointer min-h-[44px]"
              >
                <Eye className="h-4 w-4 text-blue-400" />
                <span>{peekPhoto ? "Hide Photo" : "Peek Photo"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsMapFullscreen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 active:bg-orange-700 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl border border-orange-500/30 cursor-pointer min-h-[44px]"
              >
                <X className="h-4 w-4" /> Close Map
              </button>
            </div>
          ) : (
            /* Floating mode controls */
            <div className={`absolute top-3 right-3 z-[1002] ${hasGuessed ? "hidden md:block" : "block"}`}>
              <button
                type="button"
                onClick={() => setIsMapFullscreen(true)}
                className="p-2 rounded-lg glass-dark text-white border border-white/10 hover:bg-white/15 transition-colors shadow-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Fullscreen Map"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Peek Photo Overlay Modal when in Fullscreen Map */}
          {isMapFullscreen && peekPhoto && location && (
            <div
              className="fixed top-16 left-4 z-[99999] max-w-sm w-[calc(100vw-32px)] sm:w-80 rounded-2xl glass-dark p-2 border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-950">
                <Image
                  src={location.imageUrl}
                  alt="Landmark Peek"
                  fill
                  className="object-contain"
                  sizes="320px"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] text-gray-200 flex items-center gap-1 pointer-events-none">
                  <Camera className="h-3 w-3 text-blue-400" />
                  <span>Photo by <span className="font-semibold text-white">{location.uploader || "Anonymous"}</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => setPeekPhoto(false)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Map view */}
          <div className={`flex-1 relative min-h-0 ${hasGuessed && !mapExpanded && !isMapFullscreen ? "hidden md:block" : "block"}`}>
            <DynamicMap
              onMapClick={handleMapClick}
              userGuess={userGuess}
              actualLocation={hasGuessed ? [location.latitude, location.longitude] : null}
              showResult={hasGuessed}
              readonly={hasGuessed}
              isMapFullscreen={isMapFullscreen}
            />
          </div>

          {/* Control Bar: Pin placement & Guess action */}
          <div className="p-3 bg-white/95 dark:bg-slate-900/95 border-t border-gray-100 dark:border-white/10 flex flex-col gap-2 rounded-b-xl z-[1001]">
            {/* If has not guessed, show guess validation status or guide */}
            {!hasGuessed ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {userGuess ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Pin dropped
                    </span>
                  ) : (
                    "No pin selected yet"
                  )}
                </span>
                <button
                  onClick={handleGuess}
                  disabled={!userGuess}
                  className="min-h-[44px] min-w-[44px] px-6 py-2.5 md:py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-gray-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:shadow-none cursor-pointer flex items-center justify-center"
                >
                  Guess
                </button>
              </div>
            ) : (
              /* If has guessed, show daily results and sharing action */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 uppercase font-bold tracking-wider">Distance Off</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(2)}km`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 uppercase font-bold tracking-wider">Score Earned</span>
                    <span className="font-black text-xs sm:text-base text-amber-600 dark:text-yellow-400">
                      {score.toLocaleString()} / 5,000 pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 min-w-0 flex-1 truncate" title={`${location.name} (Photo by ${location.uploader || "Anonymous"})`}>
                    {location.name} <span className="font-normal text-gray-600 dark:text-gray-400">• Photo by {location.uploader || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-1 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" /> Share
                        </>
                      )}
                    </button>
                    <Link
                      href="/"
                      className="flex items-center justify-center min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl glass hover:bg-white/10 dark:hover:bg-white/5 text-slate-800 dark:text-gray-200 font-bold text-[11px] sm:text-xs border border-white/10"
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
