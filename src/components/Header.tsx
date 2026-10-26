import React from 'react';
import { ShieldCheck, Download, Github, CheckCircle2, Monitor } from 'lucide-react';
import { Win7Config } from '../types';

interface HeaderProps {
  config: Win7Config;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ config, onDownloadZip, isDownloading }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* App Title & Repo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Monitor className="w-6 h-6 text-slate-950" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>Ezoo Win7 Release Architect</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v{config.electronVersion} (Win7 Ready)
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={`https://github.com/${config.repoOwner}/${config.repoName}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 font-mono transition-colors underline decoration-slate-700 underline-offset-2"
              >
                {config.repoOwner}/{config.repoName}
              </a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">إيقاف التحديث التلقائي + أتمتة Releases</span>
            </div>
          </div>
        </div>

        {/* Status badges & Download Zip button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">التحديث التلقائي:</span>
            <span className="font-semibold text-emerald-400">معطل نهائياً 🔒</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">نظام ويندوز 7:</span>
            <span className="font-semibold text-cyan-400">x64 و 32-bit</span>
          </div>

          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer text-sm disabled:opacity-50"
            title="تحميل جميع ملفات التهيئة والـ Workflows في ملف ZIP جاهز للرفع على GitHub"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'جاري تجهيز الحزمة...' : 'تحميل حزمة الملفات (ZIP)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
