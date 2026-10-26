import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertOctagon, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const TroubleshootingWin7: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'لماذا يتوقف التطبيق وتظهر رسالة خطأ KERNEL32.dll أو CreateFile2 على ويندوز 7؟',
      a: `بداية من الإصدار 23 في Electron (ومحرك Chromium 109 فما فوق)، قامت Google وMicrosoft بإلغاء دعم Windows 7 نهائياً واستخدام دوال جديدة في نظام التشغيل مثل CreateFile2 و SetProcessInformation.
عند تشغيل إصدار حديث على ويندوز 7 يفشل فجأة.
الحل الجذري: تثبيت الإصدار المعتمد Electron 22.3.27، وهو آخر إصدار رسمي مستقر ومدعوم بالكامل على ويندوز 7 بدون الحاجة لتثبيت أي ملفات DLL خارجية.`
    },
    {
      q: 'كيف يؤدي التحديث التلقائي (Auto-Update) إلى تعطل البرنامج في ويندوز 7 وكيف تم إيقافه؟',
      a: `عندما يتم ترك التحديث التلقائي مفعلاً، يقوم التطبيق بالاتصال بخوادم التحديث وتنزيل أحدث إصدار منشور (الذي يكون عادة مبنياً على Electron 28 أو 30 أو أحدث).
بمجرد تثبيت التحديث وإعادة تشغيل التطبيق، يتوقف فوراً عن العمل على ويندوز 7!
لذلك، قمنا في هذه الحزمة بما يلي:
1. ضبط "publish": null في package.json لمنع إنشاء وتفعيل ملفات app-update.yml.
2. تجميد وإلغاء دوال autoUpdater في كود Electron وجعلها ترجع قيمة فارغة دائماً دون إرسال طلبات للإنترنت.
3. إزالة أي مكتبات إضافية مثل electron-updater من قائمة الاعتماديات.`
    },
    {
      q: 'مشكلة فشل تحميل الروابط أو شاشة بيضاء بسبب شهادات SSL القديمة في ويندوز 7',
      a: `نظام ويندوز 7 لم يعد يتلقى تحديثات شهادات الأمان من ميكروسوفت منذ سنوات، مما تسبب في انتهاء صلاحية شهادة الجذر الشهيرة (ISRG Root X1 / DST Root CA X3) الخاصة بمواقع Let's Encrypt و Cloudflare.
النتيجة: يفشل التطبيق في فتح صفحات الويب وروابط التنزيل.
الحل المدمج: قمنا بإضافة محول session.defaultSession.setCertificateVerifyProc مع مفتاح app.commandLine.appendSwitch('ignore-certificate-errors') لتجاوز فحص الشهادات القديمة والعمل بسلاسة.`
    },
    {
      q: 'لماذا قمنا بإضافة دعم معماريات 32-bit (ia32) بجانب 64-bit؟',
      a: `نسبة كبيرة جداً من حواسيب ويندوز 7 القديمة المنتشرة تعمل بنسخة 32 بت (x86). إذا قمت ببناء نسخة 64 بت فقط، سيفشل تثبيتها لدى شريحة واسعة من المستخدمين وتظهر رسالة "This version is not compatible with the version of Windows you're running".
لذلك يقوم سير العمل ببناء النسختين تلقائياً معاً في كل Release.`
    },
    {
      q: 'هل يتطلب ويندوز 7 تحديثات معينة لتشغيل التطبيق؟',
      a: `نوصي فقط بأن يكون نظام ويندوز 7 مثبتاً عليه Service Pack 1 (SP1) والتحديث الأمني KB2533623 أو KB3063858 (الخاص بتحميل مكتبات DLL الآمنة)، وهو موجود تلقائياً في 99% من نسخ ويندوز 7 المستخدمة حالياً.`
    },
    {
      q: 'كيف يمكنني اختبار البناء محلياً على جهازي قبل الرفع على GitHub؟',
      a: `يمكنك استخدام ملف "build-win7.bat" المرفق في الحزمة!
قم بفتحه بنقرة مزدوجة، وسيقوم بضبط متغير البيئة NODE_SKIP_PLATFORM_CHECK=1 وتثبيت الحزم وبناء ملفات exe في مجلد dist داخل جهازك.`
    }
  ];

  return (
    <div className="space-y-6">
      {/* FAQ Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              الأسئلة الشائعة والأسرار التقنية لتوافق Windows 7
            </h3>
            <p className="text-xs text-slate-400">
              دليل تقني مفصل يشرح سبب الأخطاء وكيف تم حلها برمجياً لضمان استقرار دائم
            </p>
          </div>
        </div>

        <span className="text-xs text-cyan-400 font-semibold px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-full hidden sm:inline">
          دليل التوافق الكامل 🛡️
        </span>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-md transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-right flex items-center justify-between gap-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'}`}></div>
                  <span className="text-xs sm:text-sm font-bold text-slate-100">{faq.q}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 pt-1 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed bg-slate-950/40 pr-9 whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Takeaways Card */}
      <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>ملخص الحل الشامل المطبق لمستودعك:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-slate-200">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">1. إيقاف التحديث:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              تم تحييد مكتبات التحديث التلقائي لمنع تنزيل نسخ تعطل التطبيق في ويندوز 7.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">2. توافق ويندوز 7:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Electron 22.3.27 مع معالجة شهادات SSL وتخفيف عبء كروت الشاشة القديمة.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold block">3. أتمتة GitHub Release:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              سير عمل GitHub Actions جاهز يبني ملفات .exe ويرفعها في قسم Releases فوراً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
