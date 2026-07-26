import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MapPin, Trophy, Swords, Compass, Camera, Target } from "lucide-react";
import ShareCardClient from "./ShareCardClient";

interface SharePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const statId = parseInt(params.id, 10);
  if (isNaN(statId)) {
    return {
      title: "UFGuessr Daily Challenge",
      description: "You've been challenged to the UF Campus Daily Challenge!",
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
    const title = `🐊 Daily Challenge: Can you beat ${scoreStr} pts?`;
    const description = `A friend scored ${scoreStr} pts (${distStr} off) on today's UF campus daily challenge. Accept the challenge and play now!`;

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
      title: "UFGuessr Daily Challenge",
      description: "You've been challenged to today's UF Campus Daily Challenge!",
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

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900 text-white min-h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-lg w-full flex flex-col items-center gap-5 glass-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* UF Brand Header */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-600 to-orange-500 p-2.5 rounded-2xl text-white shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-orange-400 bg-clip-text text-transparent">
            UFGuessr
          </span>
        </div>

        {/* Challenge Invitation Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-black text-orange-400 uppercase tracking-wider animate-pulse">
          <Swords className="h-4 w-4 text-orange-400" />
          <span>You&apos;ve Been Challenged!</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Can you beat your friend&apos;s score?
          </h1>
          <p className="text-xs text-gray-400">
            Daily Challenge ({stat.date}) • Test your UF campus knowledge!
          </p>
        </div>

        {/* Benchmark / Target Cards (Framed as Score To Beat) */}
        <div className="w-full flex flex-col gap-3 my-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            TARGET TO BEAT
          </span>
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-yellow-500/30 shadow-inner">
              <Trophy className="h-5 w-5 text-yellow-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Score to Beat</span>
              <span className="font-black text-xl sm:text-2xl text-yellow-400 mt-0.5">
                {score.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">/ 5,000 pts</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 shadow-inner">
              <Compass className="h-5 w-5 text-blue-400 mb-1" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Accuracy to Beat</span>
              <span className="font-black text-xl sm:text-2xl text-blue-400 mt-0.5">
                {formattedDistance}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">Off Target</span>
            </div>
          </div>
        </div>

        {/* Challenge Steps / Rules */}
        <div className="w-full grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-[11px] font-semibold text-gray-300">
          <div className="flex flex-col items-center gap-1 text-center">
            <Camera className="h-4 w-4 text-blue-400" />
            <span>1. View Photo</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Target className="h-4 w-4 text-orange-400" />
            <span>2. Drop Pin</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>3. Beat Score</span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <ShareCardClient statId={stat.id} score={score} dateStr={stat.date} distanceStr={formattedDistance} />
      </div>
    </div>
  );
}
