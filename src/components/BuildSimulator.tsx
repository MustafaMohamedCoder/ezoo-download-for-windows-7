import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, Terminal, ExternalLink, Sparkles, Package } from 'lucide-react';
import { Win7Config } from '../types';

interface BuildSimulatorProps {
  config: Win7Config;
}

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'warn' | 'dim' | 'command';
  time: string;
}

export const BuildSimulator: React.FC<BuildSimulatorProps> = ({ config }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const steps = [
    'استنساخ المستودع (Checkout)',
    'إعداد Node.js 18',
    'تثبيت الحزم (npm install)',
    'بناء نسخ Win7 (electron-builder)',
    'إنشاء GitHub Release ورفع الملفات'
  ];

  const startSimulation = () => {
    setIsRunning(true);
    setIsFinished(false);
    setLogs([]);
    setCurrentStepIndex(0);

    const logSequence: { line: string; type: LogLine['type']; delay: number; step: number }[] = [
      { line: `🚀 بدء تنفيذ Workflow: Build & Release for Windows 7 (job: build-and-release)`, type: 'info', delay: 400, step: 0 },
      { line: `> git clone https://github.com/${config.repoOwner}/${config.repoName}.git`, type: 'command', delay: 800, step: 0 },
      { line: `✔ HEAD is now at 8b4ef21 feat: Support Windows 7, disable auto-update`, type: 'success', delay: 1200, step: 0 },
      
      { line: `> actions/setup-node@v4: Resolving node version 18...`, type: 'command', delay: 1700, step: 1 },
      { line: `✔ Node.js version 18.20.2 and npm 10.5.0 configured with npm cache`, type: 'success', delay: 2200, step: 1 },

      { line: `> npm install --legacy-peer-deps`, type: 'command', delay: 2700, step: 2 },
      { line: `[info] Auditing dependencies...`, type: 'dim', delay: 3100, step: 2 },
      { line: `✔ Electron pinned to v22.3.27 (Official Windows 7 final LTS)`, type: 'success', delay: 3500, step: 2 },
      { line: `✔ Auto-updater libraries absent: NO update telemetry or background downloads`, type: 'success', delay: 3900, step: 2 },
      { line: `✔ Added 248 packages in 4.2s`, type: 'dim', delay: 4200, step: 2 },

      { line: `> NODE_SKIP_PLATFORM_CHECK=1 npm run build:win7`, type: 'command', delay: 4700, step: 3 },
      { line: `[electron-builder] Packaging app for platform: win32 arch: x64, ia32`, type: 'info', delay: 5200, step: 3 },
      { line: `[electron-builder] Target: NSIS (installer) & Portable`, type: 'dim', delay: 5600, step: 3 },
      { line: `[electron-builder] Injected Win7 safety flags: disable-gpu, ignore-certificate-errors`, type: 'info', delay: 6100, step: 3 },
      { line: `✔ Built: dist/${config.appDisplayName}-Setup-${config.version}-x64.exe (67.8 MB)`, type: 'success', delay: 6800, step: 3 },
      { line: `✔ Built: dist/${config.appDisplayName}-Setup-${config.version}-ia32.exe (62.3 MB)`, type: 'success', delay: 7400, step: 3 },
      { line: `✔ Built: dist/${config.appDisplayName}-Portable-${config.version}-x64.exe (64.9 MB)`, type: 'success', delay: 8000, step: 3 },

      { line: `> softprops/action-gh-release@v2: Creating release v${config.version}...`, type: 'command', delay: 8600, step: 4 },
      { line: `[gh-release] Uploading asset: dist/${config.appDisplayName}-Setup-${config.version}-x64.exe`, type: 'info', delay: 9200, step: 4 },
      { line: `[gh-release] Uploading asset: dist/${config.appDisplayName}-Setup-${config.version}-ia32.exe`, type: 'info', delay: 9800, step: 4 },
      { line: `[gh-release] Uploading asset: dist/${config.appDisplayName}-Portable-${config.version}-x64.exe`, type: 'info', delay: 10400, step: 4 },
      { line: `🎉 Release v${config.version} published successfully in GitHub Releases section!`, type: 'success', delay: 11000, step: 4 }
    ];

    logSequence.forEach(({ line, type, delay, step }) => {
      setTimeout(() => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLogs((prev) => [...prev, { text: line, type, time: timeStr }]);
        setCurrentStepIndex(step);

        if (step === 4 && delay === 11000) {
          setIsRunning(false);
          setIsFinished(true);
        }
      }, delay);
    });
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              محاكي بناء سير عمل GitHub Actions المباشر
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            شاهد بالتفصيل ما سيحدث على خوادم GitHub بمجرد رفع الكود وتشغيل الورك فلو، وكيف يتم حزم التطبيق ورفعه في قسم Releases.
          </p>
        </div>

        <button
          onClick={startSimulation}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>جاري محاكاة البناء في السحابة...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>بدء محاكاة البناء السحابي (Live Run)</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Steps Indicator */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {steps.map((st, sIdx) => {
          const isDone = isFinished || currentStepIndex > sIdx;
          const isCurrent = isRunning && currentStepIndex === sIdx;
          return (
            <div
              key={sIdx}
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 animate-pulse'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-mono">
                  {sIdx + 1}
                </span>
              )}
              <span className="truncate">{st}</span>
            </div>
          );
        })}
      </div>

      {/* Terminal Output */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[420px]">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="text-[11px] font-mono text-slate-400 mr-2">
              GitHub Runner: windows-latest (x64) • {config.repoOwner}/{config.repoName}
            </span>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            {isRunning ? 'RUNNING ⚡' : isFinished ? 'COMPLETED (SUCCESS) ✅' : 'IDLE ⏸️'}
          </span>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 ltr text-left"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p className="text-xs">اضغط على زر "بدء محاكاة البناء السحابي" لتشغيل سير العمل الافتراضي</p>
            </div>
          ) : (
            logs.map((log, lIdx) => (
              <div key={lIdx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 select-none text-[10px]">{log.time}</span>
                <span
                  className={
                    log.type === 'command'
                      ? 'text-cyan-400 font-bold'
                      : log.type === 'success'
                      ? 'text-emerald-400 font-medium'
                      : log.type === 'dim'
                      ? 'text-slate-500'
                      : 'text-slate-200'
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Finished Release Preview Modal / Card */}
      {isFinished && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-bold text-white">
                تم إنشاء الإصدار بنجاح في قسم Releases 🎉
              </h4>
            </div>
            <a
              href={`https://github.com/${config.repoOwner}/${config.repoName}/releases`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
            >
              <span>زيارة قسم Releases على GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            الآن بعد رفع ملفاتك إلى GitHub، سيكون بإمكان أي شخص على ويندوز 7 تنزيل التطبيق وتشغيله مباشرة دون أي مشكلة أو كراش:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Package className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-slate-100 block truncate">
                  {config.appDisplayName}-Setup-x64.exe
                </span>
                <span className="text-[10px] text-slate-400">مثبت لنواة 64-bit (Win 7/8/10/11)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Package className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-slate-100 block truncate">
                  {config.appDisplayName}-Setup-ia32.exe
                </span>
                <span className="text-[10px] text-slate-400">مثبت لنواة 32-bit (الأجهزة القديمة)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Package className="w-5 h-5 text-purple-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-slate-100 block truncate">
                  {config.appDisplayName}-Portable-x64.exe
                </span>
                <span className="text-[10px] text-slate-400">نسخة بورتابل بدون تثبيت</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
