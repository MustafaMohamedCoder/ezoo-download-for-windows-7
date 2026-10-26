import React, { useState } from 'react';
import {
  FolderGit2,
  KeyRound,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  PlayCircle,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { Win7Config } from '../types';

interface GitHubWorkflowGuideProps {
  config: Win7Config;
}

export const GitHubWorkflowGuide: React.FC<GitHubWorkflowGuideProps> = ({ config }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      number: '1',
      title: 'تفعيل صلاحيات الكتابة لـ GitHub Actions (خطوة بالغة الأهمية ⚠️)',
      badge: 'إلزامية لمنع خطأ 403',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      description: 'بشكل افتراضي، يمنع GitHub أي Action من إنشاء Release ورفع ملفات ما لم تمنحه صلاحية Write. قم بتفعيلها بهذه الخطوات البسيطة:',
      details: [
        'افتح المستودع: https://github.com/' + config.repoOwner + '/' + config.repoName,
        'اضغط على تبويب Settings (في أعلى صفحة المستودع).',
        'من القائمة الجانبية اليسرى، انقر على Actions ثم اختر General.',
        'انزل لأسفل حتى تصل إلى قسم "Workflow permissions".',
        'اختر "Read and write permissions" وضع علامة على "Allow GitHub Actions to create and approve pull requests".',
        'اضغط على زر Save لحفظ الإعدادات.'
      ],
      link: `https://github.com/${config.repoOwner}/${config.repoName}/settings/actions`,
      linkText: 'فتح إعدادات Actions في المستودع'
    },
    {
      number: '2',
      title: 'إضافة ملفات المشروع إلى جهازك',
      badge: 'مجلد المشروع',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'تأكد من وضع ملف الورك فلو في المسار المحدد تماماً داخل مجلد مشروعك المحلي:',
      codeBlock: `.github/
  └── workflows/
       └── release.yml    <-- (انسخ محتوى تبويب release.yml وضعه هنا)
package.json
main.js
disable-auto-update.js`,
      note: 'يمكنك أيضاً تنزيل ملف ZIP بضغطة زر وفك ضغطه داخل مجلد مشروعك مباشرة.'
    },
    {
      number: '3',
      title: 'دفع الملفات وتشغيل البناء التلقائي عبر Git',
      badge: 'أوامر Terminal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'افتح موجه الأوامر (CMD أو PowerShell أو Git Bash) في مجلد مشروعك وشغّل الأوامر التالية:',
      commands: [
        {
          label: '1. إضافة وحفظ التغييرات:',
          cmd: 'git add .'
        },
        {
          label: '2. إنشاء Commit:',
          cmd: `git commit -m "feat: Add Windows 7 support, disable auto-update and automated release workflow"`
        },
        {
          label: '3. دفع الملفات إلى فرع main:',
          cmd: 'git push origin main'
        },
        {
          label: '4. إنشاء Tag لإصدار رسمي (سيطلق البناء فوراً):',
          cmd: `git tag v${config.version}\ngit push origin v${config.version}`
        }
      ]
    },
    {
      number: '4',
      title: 'مراقبة البناء وتحميل النسخ من قسم Releases',
      badge: 'النتيجة النهائية 🎉',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'بمجرد دفع الكود أو الـ Tag، سيبدأ سيرفر ويندوز الافتراضي في GitHub ببناء التطبيق:',
      details: [
        'افتح تبويب Actions لمتابعة تقدم البناء خطوة بخطوة في الوقت الحقيقي.',
        'يستغرق البناء حوالي 2 إلى 4 دقائق لتجهيز نسختي 64-bit و 32-bit.',
        'عند اكتمال الإشارة الخضراء (Success ✅)، توجه إلى قسم Releases.',
        'ستجد الإصدار جاهزاً وتحته ملفات التثبيت:'
      ],
      artifactsList: [
        `${config.appDisplayName}-Setup-${config.version}-x64.exe (ملف تثبيت لويندوز 7 نواة 64 بت)`,
        `${config.appDisplayName}-Setup-${config.version}-ia32.exe (ملف تثبيت لويندوز 7 نواة 32 بت)`,
        `${config.appDisplayName}-Portable-${config.version}-x64.exe (نسخة محمولة لا تحتاج تثبيت)`
      ],
      link: `https://github.com/${config.repoOwner}/${config.repoName}/releases`,
      linkText: 'الانتقال إلى قسم Releases في مستودعك'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              دليل أتمتة الرفع والبناء التلقائي في Releases
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            بمجرد اتباع هذه الخطوات الأربع، في كل مرة ترفع فيها كود التطبيق على GitHub، سيقوم خادم GitHub السحابي تلقائياً بتحميل Electron 22 وبناء ملفات <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">.exe</code> متوافقة 100% مع ويندوز 7 ووضعها للتنزيل في قسم Releases بدون أي تدخل يدوي منك!
          </p>
        </div>

        <a
          href={`https://github.com/${config.repoOwner}/${config.repoName}/actions`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-all shrink-0 cursor-pointer shadow-md"
        >
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          <span>فتح صفحة Actions لمتابعة البناء</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Steps List */}
      <div className="space-y-5">
        {steps.map((step, sIdx) => (
          <div
            key={sIdx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg hover:border-slate-700/80 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black flex items-center justify-center text-sm shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{step.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                </div>
              </div>

              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${step.badgeColor}`}>
                {step.badge}
              </span>
            </div>

            {/* Step 1 details */}
            {step.details && (
              <ul className="space-y-1.5 pr-11 text-xs text-slate-300">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Code Block if any */}
            {step.codeBlock && (
              <div className="pr-11">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre ltr text-left">
                  {step.codeBlock}
                </div>
                {step.note && (
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{step.note}</span>
                  </p>
                )}
              </div>
            )}

            {/* Commands list with one-click copy */}
            {step.commands && (
              <div className="space-y-2.5 pr-11">
                {step.commands.map((c, cIdx) => (
                  <div key={cIdx} className="space-y-1">
                    <span className="text-xs text-slate-400">{c.label}</span>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 ltr">
                      <code className="text-left whitespace-pre">{c.cmd}</code>
                      <button
                        onClick={() => copyToClipboard(c.cmd, cIdx + 10)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      >
                        {copiedIndex === cIdx + 10 ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px]">نسخ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Artifacts preview */}
            {step.artifactsList && (
              <div className="pr-11 space-y-2">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>الملفات التي ستجدها في قسم Releases بعد اكتمال البناء:</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {step.artifactsList.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2 text-slate-200">
                        <span className="text-emerald-400">📦</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Direct action link if provided */}
            {step.link && (
              <div className="pr-11 pt-1">
                <a
                  href={step.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                >
                  <span>{step.linkText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Troubleshooting Warning */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h5 className="font-bold text-amber-300">ملاحظة هامة جداً حول فشل الـ Action (Error 403 Forbidden):</h5>
          <p className="text-slate-300 leading-relaxed">
            إذا قمت برفع الكود وفشل الـ GitHub Action في آخر خطوة (Create GitHub Release) برسالة <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">Resource not accessible by integration</code> أو <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">HTTP 403 Forbidden</code>، فهذا يعني أنك نسيت تنفيذ <strong>الخطوة رقم 1</strong>! توجه فوراً إلى إعدادات المستودع وفعل خيار "Read and write permissions" ثم أعد تشغيل البناء.
          </p>
        </div>
      </div>
    </div>
  );
};
