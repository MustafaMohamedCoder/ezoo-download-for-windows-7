import React from 'react';
import { Settings, Cpu, ShieldAlert, GitBranch, PackageCheck, Layers } from 'lucide-react';
import { Win7Config } from '../types';

interface ConfigPanelProps {
  config: Win7Config;
  onChange: (updated: Partial<Win7Config>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">إعدادات بناء التطبيق وتوافق ويندوز 7</h2>
            <p className="text-xs text-slate-400">تخصيص المعماريات وإلغاء التحديث التلقائي وشروط تشغيل GitHub Actions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Section 1: Basic App Details */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 border-b border-slate-800/60 pb-2">
            <PackageCheck className="w-4 h-4" />
            <span>بيانات التطبيق والمستودع</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">اسم التطبيق المعروض (Product Name)</label>
            <input
              type="text"
              value={config.appDisplayName}
              onChange={(e) => onChange({ appDisplayName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="Ezoo Download"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">اسم الحزمة البرمجي (Package Name)</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => onChange({ appName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              placeholder="ezoo-download"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">رقم الإصدار</label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => onChange({ version: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">نسخة Electron</label>
              <input
                type="text"
                disabled
                value={config.electronVersion}
                className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono cursor-not-allowed"
                title="Electron 22.3.27 هو الإصدار المعتمد والنهائي لدعم ويندوز 7"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Windows 7 Architectures & Formats */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 border-b border-slate-800/60 pb-2">
            <Cpu className="w-4 h-4" />
            <span>المعماريات وصيغ ملفات التشغيل</span>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
                <span>بناء معمارية 64-bit (x64)</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">شائع</span>
              </span>
              <input
                type="checkbox"
                checked={config.buildX64}
                onChange={(e) => onChange({ buildX64: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
                <span>بناء معمارية 32-bit (ia32)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                  مهم لأجهزة Win7 القديمة
                </span>
              </span>
              <input
                type="checkbox"
                checked={config.buildIa32}
                onChange={(e) => onChange({ buildIa32: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
              />
            </label>

            <div className="pt-2 border-t border-slate-800/50 flex gap-2">
              <label className="flex-1 flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-300">ملف تثبيت (Setup.exe)</span>
                <input
                  type="checkbox"
                  checked={config.buildInstaller}
                  onChange={(e) => onChange({ buildInstaller: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded"
                />
              </label>

              <label className="flex-1 flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-300">نسخة محمولة (Portable.exe)</span>
                <input
                  type="checkbox"
                  checked={config.buildPortable}
                  onChange={(e) => onChange({ buildPortable: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Win7 Fixes & GitHub Release Triggers */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 border-b border-slate-800/60 pb-2">
            <GitBranch className="w-4 h-4" />
            <span>مشغلات GitHub Release والتوافق</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-medium text-slate-200 block">البناء عند الرفع المباشر على main/master</span>
                <span className="text-[10px] text-slate-400">يبني إصدار فور تشغيل git push</span>
              </div>
              <input
                type="checkbox"
                checked={config.triggerOnPushMain}
                onChange={(e) => onChange({ triggerOnPushMain: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-medium text-slate-200 block">البناء عند إنشاء Tag (مثل v1.0.0)</span>
                <span className="text-[10px] text-slate-400">المعيار الموصى به في مشاريع GitHub</span>
              </div>
              <input
                type="checkbox"
                checked={config.triggerOnTag}
                onChange={(e) => onChange({ triggerOnTag: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-medium text-slate-200 block">تخطي أخطاء شهادات SSL القديمة</span>
                <span className="text-[10px] text-slate-400">يحل مشكلة شهادات Let's Encrypt المنتهية في Win7</span>
              </div>
              <input
                type="checkbox"
                checked={config.bypassOldSslErrors}
                onChange={(e) => onChange({ bypassOldSslErrors: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Auto-update Banner notice */}
      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">
              حماية تامة من التحديث التلقائي (Auto-Update Disabled Permanently)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تم ضبط إعدادات الحزم وElectron على <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">publish: null</code> واستبدال مكتبات <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">autoUpdater</code> بدوال وهمية تمنع تحميل أي تحديث خارجي يفسد توافقية ويندوز 7.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
          مُؤمن بنسبة 100%
        </span>
      </div>

    </div>
  );
};
