"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Share2, Play } from "lucide-react";

interface ShareCardClientProps {
  statId: number;
  score: number;
  dateStr: string;
  distanceStr: string;
}

export default function ShareCardClient({ statId, score, dateStr, distanceStr }: ShareCardClientProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/daily/${statId}` : `/share/daily/${statId}`;

  const handleCopyLink = () => {
    const textToShare = `UFGuessr Daily Challenge 🐊 (${dateStr})\n📍 Distance: ${distanceStr} off\n🏆 Score: ${score.toLocaleString()} / 5,000 pts!\n\nCan you beat my score? Play here: ${shareUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `UFGuessr Daily Result (${score.toLocaleString()} pts)`,
          text: textToShare,
          url: shareUrl,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          });
        });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 mt-2">
      <Link
        href="/game/daily"
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Play className="h-4 w-4 fill-white" />
        <span>Play Today&apos;s Challenge</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </Link>

      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-gray-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400">Share Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-blue-400" />
            <span>Copy / Share Challenge Link</span>
          </>
        )}
      </button>
    </div>
  );
}
