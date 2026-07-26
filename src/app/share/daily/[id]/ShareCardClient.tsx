"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Share2, Swords } from "lucide-react";

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
          title: `UFGuessr Daily Challenge Result (${score.toLocaleString()} pts)`,
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
    <div className="w-full flex flex-col gap-3 mt-1">
      <Link
        href="/game/daily"
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-blue-600 hover:from-orange-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2.5 group cursor-pointer"
      >
        <Swords className="h-5 w-5 text-yellow-300" />
        <span>Accept Challenge &amp; Play Now</span>
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
            <span className="text-emerald-400">Challenge Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-blue-400" />
            <span>Share Challenge Link</span>
          </>
        )}
      </button>
    </div>
  );
}
