import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MapPin, Trophy, Sparkles, Compass } from "lucide-react";
import ShareCardClient from "./ShareCardClient";

interface SharePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const statId = parseInt(params.id, 10);
  if (isNaN(statId)) {
    return {
      title: "UFGuessr Daily Challenge Result",
      description: "Check out this UFGuessr Daily Challenge result!",
    };
  }

  try {
    const stat = await prisma.dailyStat.findUnique({
      where: { id: statId },
    });

    if (!stat) {
      return {
        title: "UFGuessr Daily Challenge",
        description: "Explore the University of Florida campus and test your geographic knowledge!",
      };
    }

    const distStr = stat.distance < 1000 ? `${Math.round(stat.distance)}m` : `${(stat.distance / 1000).toFixed(2)}km`;
    const scoreStr = stat.score.toLocaleString();
    const title = `UFGuessr Daily (${stat.date}): ${scoreStr} pts!`;
    const description = `Scored ${scoreStr} / 5,000 pts (${distStr} off) on today's UF campus daily challenge. Can you beat me?`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "UFGuessr",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "UFGuessr Daily Challenge Result",
      description: "Check out this score on UFGuessr Daily Challenge!",
    };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const statId = parseInt(params.id, 10);
  if (isNaN(statId)) {
    notFound();
  }

  let stat = null;
  try {
    stat = await prisma.dailyStat.findUnique({
      where: { id: statId },
    });
  } catch (e) {
    console.error("Failed to load share stat:", e);
  }

  if (!stat) {
    notFound();
  }

  const formattedDistance = stat.distance < 1000 ? `${Math.round(stat.distance)}m` : `${(stat.distance / 1000).toFixed(2)}km`;
  const score = stat.score;

  let stars = 5;
  if (score >= 4800) stars = 5;
  else if (score >= 4000) stars = 4;
  else if (score >= 2800) stars = 3;
  else if (score >= 1500) stars = 2;
  else stars = 1;

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900 text-white min-h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-lg w-full flex flex-col items-center gap-6 glass-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* UF Brand Header */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-600 to-orange-500 p-2.5 rounded-2xl text-white shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-orange-400 bg-clip-text text-transparent">
            UFGuessr
          </span>
        </div>

        {/* Date & Challenge Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-orange-400">
          <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
          <span>Daily Challenge ({stat.date})</span>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl transition-transform ${
                star <= stars ? "text-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-gray-700 opacity-40"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Results Grid Box */}
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 my-2">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-yellow-500/20 shadow-inner">
            <Trophy className="h-5 w-5 text-yellow-400 mb-1" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Score</span>
            <span className="font-black text-xl sm:text-2xl text-yellow-400 mt-0.5">
              {score.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">/ 5,000 pts</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-blue-500/20 shadow-inner">
            <Compass className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Distance Off</span>
            <span className="font-black text-xl sm:text-2xl text-blue-400 mt-0.5">
              {formattedDistance}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">Accuracy</span>
          </div>
        </div>

        {stat.locationName && (
          <p className="text-xs sm:text-sm text-gray-300 font-medium bg-slate-800/40 px-4 py-2 rounded-xl border border-white/5 w-full truncate">
            📍 Landmark: <span className="font-bold text-white">{stat.locationName}</span>
          </p>
        )}

        {/* Interactive Actions */}
        <ShareCardClient statId={stat.id} score={score} dateStr={stat.date} distanceStr={formattedDistance} />
      </div>
    </div>
  );
}
