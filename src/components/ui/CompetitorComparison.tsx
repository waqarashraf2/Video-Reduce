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
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-red-600" />
            <span>2026 WebAssembly Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            {t.vsFreeConvertTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t.vsFreeConvertSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3.5 py-2 ring-1 ring-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>{t.videoReduceAdvantage}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] sm:text-xs uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 font-bold text-slate-700">Key Feature</th>
              <th className="py-3 px-3 sm:px-4 font-bold text-red-600 bg-red-50/50 rounded-t-xl">
                VideoReduce (WebAssembly)
              </th>
              <th className="py-3 px-3 sm:px-4 font-bold text-slate-500">
                FreeConvert / Cloud Tools
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {t.freeConvertComparison.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                  {row.feature}
                </td>
                <td className="py-3.5 px-3 sm:px-4 bg-red-50/30 font-bold text-emerald-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{row.videoReduce}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{row.freeConvert}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">0 Upload Delay</div>
            <div className="text-[11px] text-slate-500">Local SIMD execution</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% Data Privacy</div>
            <div className="text-[11px] text-slate-500">Zero cloud storage</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Unlimited Multi-GB</div>
            <div className="text-[11px] text-slate-500">No paid subscriptions</div>
          </div>
        </div>
      </div>
    </section>
  );
};
