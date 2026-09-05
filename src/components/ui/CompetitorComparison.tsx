import React from "react";
import { CheckCircle2, XCircle, ShieldCheck, Zap, Lock, Sparkles } from "lucide-react";
import { SupportedLocale } from "@/config/i18n/locales";
import { getTranslations } from "@/config/i18n";

interface CompetitorComparisonProps {
  lang?: SupportedLocale;
}

export const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({
  lang = "en",
}) => {
  const t = getTranslations(lang);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-[#0b1120]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2026 WebAssembly Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t.vsFreeConvertTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.vsFreeConvertSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 px-3.5 py-2 ring-1 ring-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
          <ShieldCheck className="h-4 w-4" />
          <span>{t.videoReduceAdvantage}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-[11px] sm:text-xs uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 font-semibold">Key Feature</th>
              <th className="py-3 px-3 sm:px-4 font-bold text-blue-400 bg-blue-500/5 rounded-t-xl">
                VideoReduce (WebAssembly)
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold text-slate-400">
                FreeConvert / Cloud Tools
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {t.freeConvertComparison.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3 sm:px-4 font-medium text-slate-300">
                  {row.feature}
                </td>
                <td className="py-3.5 px-3 sm:px-4 bg-blue-500/5 font-semibold text-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{row.videoReduce}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-400/80 shrink-0" />
                    <span>{row.freeConvert}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/60 p-3.5 border border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">0 Upload Delay</div>
            <div className="text-[11px] text-slate-400">Local SIMD execution</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/60 p-3.5 border border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">100% Data Privacy</div>
            <div className="text-[11px] text-slate-400">Zero cloud storage</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/60 p-3.5 border border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Unlimited Multi-GB</div>
            <div className="text-[11px] text-slate-400">No paid subscriptions</div>
          </div>
        </div>
      </div>
    </section>
  );
};
