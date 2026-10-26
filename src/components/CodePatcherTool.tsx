import React, { useState } from 'react';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FileJson,
  FileCode2
} from 'lucide-react';
import { analyzeAndPatchPackageJson, analyzeAndPatchMainJs } from '../utils/codePatcher';
import { AnalysisResult } from '../types';

const SAMPLE_BROKEN_PACKAGE_JSON = `{
  "name": "ezoo-download",
  "version": "1.0.0",
  "description": "Ezoo Downloader App",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder"
  },
  "dependencies": {
    "electron-updater": "^6.1.4",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1"
  }
}`;

const SAMPLE_BROKEN_MAIN_JS = `const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  });

  win.loadURL('https://ezoo.app');

  // هذا الكود يتسبب في تحميل تحديثات غير متوافقة ويعطل التطبيق في ويندوز 7!
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(createWindow);
`;

export const CodePatcherTool: React.FC = () => {
  const [mode, setMode] = useState<'package' | 'main'>('package');
  const [inputCode, setInputCode] = useState(SAMPLE_BROKEN_PACKAGE_JSON);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunAnalysis = () => {
    if (mode === 'package') {
      const res = analyzeAndPatchPackageJson(inputCode);
      setAnalysis(res);
    } else {
      const res = analyzeAndPatchMainJs(inputCode);
      setAnalysis(res);
    }
  };

  const handleLoadSample = (type: 'package' | 'main') => {
    setMode(type);
    if (type === 'package') {
      setInputCode(SAMPLE_BROKEN_PACKAGE_JSON);
      setAnalysis(analyzeAndPatchPackageJson(SAMPLE_BROKEN_PACKAGE_JSON));
    } else {
      setInputCode(SAMPLE_BROKEN_MAIN_JS);
      setAnalysis(analyzeAndPatchMainJs(SAMPLE_BROKEN_MAIN_JS));
    }
  };

  const handleCopyPatched = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.patchedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              أداة الفحص والترقيع التلقائي لملفات تطبيقك الحالية
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            إذا كان لديك مشروع قائم بالفعل على GitHub، الصق محتوى ملف <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">package.json</code> أو <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">main.js</code> هنا لفحص مشاكل ويندوز 7 وإزالة التحديث التلقائي فوراً.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => handleLoadSample('package')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              mode === 'package'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>فحص package.json</span>
          </button>
          <button
            onClick={() => handleLoadSample('main')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              mode === 'main'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>فحص main.js</span>
          </button>
        </div>
      </div>

      {/* Editor & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Input Code */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span>الكود الحالي في مشروعك</span>
              <span className="text-[10px] text-slate-400 font-normal">(يمكنك لصق كودك هنا وتعديله)</span>
            </span>
            <button
              onClick={() => handleLoadSample(mode)}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
            >
              تحميل نموذج افتراضي
            </button>
          </div>

          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs font-mono text-slate-200 resize-none focus:outline-none focus:border-emerald-500/50 ltr text-left leading-relaxed"
            placeholder={mode === 'package' ? 'الصق محتوى package.json هنا...' : 'الصق محتوى main.js هنا...'}
          />

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleRunAnalysis}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>فحص وترقيع المشاكل الآن</span>
            </button>
          </div>
        </div>

        {/* Right: Analysis & Patched Output */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>النسخة المرقعة والمتوافقة 100% مع Windows 7</span>
            </span>

            {analysis && (
              <button
                onClick={handleCopyPatched}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النتيجة</span>
                  </>
                )}
              </button>
            )}
          </div>

          {analysis ? (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Issues detected pills */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {analysis.issues.map((iss, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                      iss.type === 'critical'
                        ? 'bg-red-950/30 border-red-500/30 text-red-200'
                        : iss.type === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    }`}
                  >
                    {iss.type === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : iss.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="font-bold block">{iss.title}</span>
                      <p className="text-[11px] text-slate-300 opacity-90">{iss.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Patched code viewer */}
              <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-emerald-300 overflow-y-auto ltr text-left whitespace-pre">
                {analysis.patchedContent}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-400">لم يتم تشغيل الفحص بعد</p>
                <p className="text-xs text-slate-500 mt-1">اضغط على زر "فحص وترقيع المشاكل الآن" لرؤية النتيجة هنا</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
