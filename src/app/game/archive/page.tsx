"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDistanceInMeters, calculateScore } from "@/lib/geo";
import DynamicMap from "@/components/DynamicMap";
import { MapPin, Trophy, RefreshCw, ChevronRight, Maximize2, Check, HelpCircle, Eye, X, Loader2, Camera } from "lucide-react";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  difficulty: string;
  uploader?: string | null;
}

interface RoundResult {
  location: Location;
  guess: [number, number];
  distance: number;
  score: number;
}

export default function ArchiveGamePage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [userGuess, setUserGuess] = useState<[number, number] | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [roundsHistory, setRoundsData] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [peekPhoto, setPeekPhoto] = useState(false);

  // Initialize standard game mode
  const startNewGame = async () => {
    setLoading(true);
    setLocations([]);
    setCurrentRound(0);
    setUserGuess(null);
    setHasGuessed(false);
    setRoundResult(null);
    setRoundsData([]);
    setTotalScore(0);
    setGameFinished(false);

    try {
      const res = await fetch("/api/game/archive");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.locations.length > 0) {
          setLocations(data.locations);
        }
      }
    } catch (err) {
      console.error("Failed to fetch game locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (!hasGuessed) {
      setUserGuess([lat, lng]);
    }
  };

  const handleGuess = () => {
    if (!userGuess || hasGuessed || locations.length === 0) return;

    const target = locations[currentRound];
    const dist = getDistanceInMeters(
      userGuess[0],
      userGuess[1],
      target.latitude,
      target.longitude
    );

    const score = calculateScore(dist);

    const result: RoundResult = {
      location: target,
      guess: userGuess,
      distance: dist,
      score,
    };

    setRoundResult(result);
    setHasGuessed(true);
    setTotalScore((prev) => prev + score);
    setRoundsData((prev) => [...prev, result]);
  };

  const handleNextRound = () => {
    if (currentRound < locations.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setUserGuess(null);
      setHasGuessed(false);
      setRoundResult(null);
    } else {
      setGameFinished(true);
    }
  };

  // Performance summary based on score
  const getPerformanceSummary = (score: number) => {
    const maxPossible = locations.length * 5000;
    const ratio = score / maxPossible;

    if (ratio >= 0.9) return { text: "Amazing job! Your knowledge of the campus layout is absolute perfection.", color: "text-orange-700 dark:text-orange-400 font-extrabold" };
    if (ratio >= 0.7) return { text: "Excellent layout knowledge! You walk with standard Gator pride.", color: "text-blue-600 dark:text-blue-400 font-bold" };
    if (ratio >= 0.4) return { text: "Pretty good! You found your way around campus comfortably.", color: "text-emerald-700 dark:text-emerald-400 font-semibold" };
    return { text: "A good effort! Grab a campus map and try playing another session.", color: "text-gray-600 dark:text-gray-300 font-medium" };
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold">Assembling UF Campus...</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Selecting landmarks and rendering the map.
          </p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center flex flex-col gap-4">
          <HelpCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto" />
          <h2 className="text-xl font-bold">No Landmarks Available</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            The standard location backlog is empty. Please contact an admin to seed or upload campus photos.
          </p>
          <Link href="/" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentLoc = locations[currentRound];

  // Render Game Summary screen
  if (gameFinished) {
    const summary = getPerformanceSummary(totalScore);

    return (
      <div className="flex-1 w-full flex flex-col items-center p-4 sm:p-8 max-w-6xl mx-auto gap-6">
        {/* Header Summary */}
        <div className="glass-card w-full p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center gap-3">
          <Trophy className="h-14 w-14 text-amber-500 animate-bounce" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Game Completed!</h1>
          
          <div className="mt-2 flex flex-col items-center">
            <span className="text-5xl font-black bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
              {totalScore.toLocaleString()}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-bold tracking-widest mt-1">TOTAL POINTS OUT OF {locations.length * 5000}</span>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4 max-w-lg">
            <p className={`text-base sm:text-lg ${summary.color}`}>{summary.text}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={startNewGame}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/10"
            >
              <RefreshCw className="h-4 w-4" /> Play Again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 dark:hover:bg-white/5 font-bold transition-all border border-white/10"
            >
              Return Home
            </Link>
          </div>
        </div>

        {/* Master Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Master Map */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-auto min-h-[350px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Game Map Summary
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300">All 5 rounds plotted</span>
            </div>
            <div className="flex-1 relative">
              {/* Plot all 5 markers on a custom summary map */}
              <DynamicMap
                readonly={true}
                showResult={true}
                summaryRounds={roundsHistory.map((r, idx) => ({
                  guess: r.guess,
                  actualLocation: [r.location.latitude, r.location.longitude],
                  locationName: r.location.name,
                  roundNumber: idx + 1,
                }))}
              />
            </div>
          </div>

          {/* Rounds Detailed List */}
          <div className="flex flex-col gap-4">
            <h2 className="font-extrabold text-xl tracking-tight pl-2">Round Details</h2>
            {roundsHistory.map((round, idx) => (
              <div
                key={round.location.id}
                className="glass-card p-4 rounded-xl flex items-center gap-4 hover:scale-[1.01] transition-transform duration-250 border border-white/5"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800 border border-white/10">
                  <Image
                    src={round.location.imageUrl}
                    alt={round.location.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Text Data */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      Round {idx + 1}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      round.location.difficulty === "easy"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : round.location.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-700 dark:text-yellow-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}>
                      {round.location.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{round.location.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    By: <span className="font-medium text-slate-800 dark:text-slate-200">{round.location.uploader || "Anonymous"}</span> • Distance: <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {round.distance < 1000 ? `${Math.round(round.distance)}m` : `${(round.distance / 1000).toFixed(2)}km`}
                    </span>
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex flex-col items-end pr-2">
                  <span className="font-black text-xl text-blue-600 dark:text-blue-400">
                    {round.score}
                  </span>
                  <span className="text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col relative h-[calc(100dvh-57px)] sm:h-[calc(100dvh-65px)] max-h-[calc(100dvh-57px)] sm:max-h-[calc(100dvh-65px)] overflow-hidden">
      
      {/* 1. Full Image Showcase Area */}
      <div className="relative bg-slate-950 flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <Image
          src={currentLoc.imageUrl}
          alt="Target Location landmark"
          fill
          className="object-contain pointer-events-none select-none filter brightness-95"
          sizes="100vw"
          priority
          referrerPolicy="no-referrer"
        />

        {/* Top Info Card & Hint Pill Container */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-24px)] sm:max-w-xs">
          {/* UI Overlay Card for Round and Score */}
          <div className="glass-dark p-3.5 sm:p-5 rounded-2xl flex flex-col gap-1 border border-white/10 text-white w-full shadow-2xl">
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Archive Mode</span>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                currentLoc.difficulty === "easy"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : currentLoc.difficulty === "medium"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {currentLoc.difficulty}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black mt-1">Round {currentRound + 1} of 5</h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-300 font-medium">
              <Camera className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <span>Photo by <span className="font-bold text-white">{currentLoc.uploader || "Anonymous"}</span></span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span>Total Score: <span className="text-yellow-400 font-extrabold">{totalScore.toLocaleString()}</span></span>
            </div>
          </div>

          {/* Hint prompt pill aligned below and matching width of top container */}
          {!hasGuessed && (
            <div className="glass-dark py-2 px-3.5 rounded-2xl border border-white/10 text-white text-xs font-medium shadow-2xl flex items-center justify-center gap-1.5 w-full text-center">
              <HelpCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <span className="truncate sm:whitespace-normal">Examine landmark, then pin matching spot on map!</span>
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
      )}      {/* 2. Interactive Map Container */}
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
          {isMapFullscreen && peekPhoto && currentLoc && (
            <div
              className="fixed top-16 left-4 z-[99999] max-w-sm w-[calc(100vw-32px)] sm:w-80 rounded-2xl glass-dark p-2 border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-950">
                <Image
                  src={currentLoc.imageUrl}
                  alt="Landmark Peek"
                  fill
                  className="object-contain"
                  sizes="320px"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] text-gray-200 flex items-center gap-1 pointer-events-none">
                  <Camera className="h-3 w-3 text-blue-400" />
                  <span>Photo by <span className="font-semibold text-white">{currentLoc.uploader || "Anonymous"}</span></span>
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
              actualLocation={hasGuessed ? [currentLoc.latitude, currentLoc.longitude] : null}
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
              /* If has guessed, show round results and next round action */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 uppercase font-bold tracking-wider">Distance Off</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {roundResult?.distance && roundResult.distance < 1000
                        ? `${Math.round(roundResult.distance)}m`
                        : `${((roundResult?.distance || 0) / 1000).toFixed(2)}km`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 uppercase font-bold tracking-wider">Earned Score</span>
                    <span className="font-black text-xs sm:text-base text-emerald-700 dark:text-emerald-400">
                      +{roundResult?.score} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 min-w-0 flex-1 truncate" title={`${currentLoc.name} (Photo by ${currentLoc.uploader || "Anonymous"})`}>
                    {currentLoc.name} <span className="font-normal text-gray-600 dark:text-gray-400">• Photo by {currentLoc.uploader || "Anonymous"}</span>
                  </div>
                  <button
                    onClick={handleNextRound}
                    className="inline-flex items-center justify-center text-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer flex-shrink-0"
                  >
                    {currentRound < locations.length - 1 ? (
                      <span className="inline-flex items-center justify-center gap-1 text-center">
                        <span>Next Round</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1 text-center">
                        <span>View Results</span>
                        <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
