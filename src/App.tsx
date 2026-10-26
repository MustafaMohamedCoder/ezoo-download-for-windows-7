import React, { useState, useMemo } from 'react';
import {
  FileCode,
  FolderGit2,
  Settings,
  Wrench,
  Terminal,
  HelpCircle,
  Download,
  CheckCircle,
  Github,
  Monitor,
  Shield,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { FileViewer } from './components/FileViewer';
import { GitHubWorkflowGuide } from './components/GitHubWorkflowGuide';
import { CodePatcherTool } from './components/CodePatcherTool';
import { BuildSimulator } from './components/BuildSimulator';
import { TroubleshootingWin7 } from './components/TroubleshootingWin7';
import { defaultConfig, getAllGeneratedFiles, createZipPackage } from './utils/fileGenerators';
import { Win7Config } from './types';

export default function App() {
  const [config, setConfig] = useState<Win7Config>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'files' | 'guide' | 'config' | 'patcher' | 'simulator' | 'troubleshooting'>('files');
  const [activeFileId, setActiveFileId] = useState<string>('workflow');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Recalculate generated files when config changes
  const generatedFiles = useMemo(() => {
    return getAllGeneratedFiles(config);
  }, [config]);

  const handleConfigChange = (updated: Partial<Win7Config>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zipBlob = await createZipPackage(config);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.appName}-win7-ready-bundle.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setToastMessage('تم تحميل حزمة الملفات بالكامل بنجاح! جاهزة لفك الضغط والرفع إلى GitHub.');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setToastMessage('حدث خطأ أثناء إنشاء ملف ZIP.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  const navTabs = [
    {
      id: 'files',
      label: 'ملفات المشروع الجاهزة',
      icon: FileCode,
      badge: '9 ملفات'
    },
    {
      id: 'guide',
      label: 'دليل أتمتة GitHub Releases',
      icon: FolderGit2,
      badge: 'مهم جداً'
    },
    {
      id: 'config',
      label: 'لوحة تخصيص الإعدادات',
      icon: Settings
    },
    {
      id: 'patcher',
      label: 'أداة فحص وترقيع الكود',
      icon: Wrench
    },
    {
      id: 'simulator',
      label: 'محاكي بناء GitHub السحابي',
      icon: Terminal,
      badge: 'مباشر'
    },
    {
      id: 'troubleshooting',
      label: 'حل مشاكل Windows 7',
      icon: HelpCircle
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Header */}
      <Header
        config={config}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Quick Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  تم حل مشكلة التحديث وويندوز 7 بنجاح
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  مخصص لمستودع: <strong className="text-white font-mono">{config.repoName}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                منظومة بناء تطبيق <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Ezoo Downloader</span> لويندوز 7 مع أتمتة Releases
              </h2>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                حل متكامل لمطالبك الثلاثة: (1) إيقاف التحديث التلقائي نهائياً لمنع أي انهيار في التطبيق، (2) ضبط محرك Electron 22.3.27 والمعماريات ليعمل التطبيق على Windows 7 بسلاسة، (3) إنشاء ملف GitHub Actions Workflow لبناء ملفات التثبيت تلقائياً ورفعها في قسم Releases عند كل دفع كود.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
              <button
                onClick={() => setActiveTab('guide')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>دليل الرفع على GitHub</span>
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>تجربة محاكي البناء</span>
              </button>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'files' && (
          <div className="space-y-6">
            <FileViewer
              files={generatedFiles}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
            />

            {/* Quick Instructions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">1</span>
                  <span>ملف الورك فلو (.github/workflows)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  انسخ ملف <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">release.yml</code> وضعه داخل مجلد <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">.github/workflows/</code> في مستودعك.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">2</span>
                  <span>ملف الحزم package.json</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يحتوي على Electron 22.3.27 مع إلغاء حزم autoUpdater وضبط إعدادات NSIS لنواة 64 و 32 بت.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">3</span>
                  <span>كود main.js الآمن</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  مزود بحماية من أخطاء شهادات SSL القديمة في ويندوز 7 وتخفيف أحمال معالجة الرسوميات القديمة.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && <GitHubWorkflowGuide config={config} />}
        {activeTab === 'config' && <ConfigPanel config={config} onChange={handleConfigChange} />}
        {activeTab === 'patcher' && <CodePatcherTool />}
        {activeTab === 'simulator' && <BuildSimulator config={config} />}
        {activeTab === 'troubleshooting' && <TroubleshootingWin7 />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Ezoo Windows 7 Release Hub</span>
            <span>•</span>
            <span>مصمم لمستودع <code className="text-emerald-400 font-mono">MustafaMohamedCoder/ezoo-download-for-windows-7</code></span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('troubleshooting')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              الأسئلة الشائعة وتوافق ويندوز 7
            </button>
            <span>•</span>
            <button
              onClick={handleDownloadZip}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              تنزيل حزمة ZIP كاملة
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
