import { AnalysisResult, PatchIssue } from '../types';

export function analyzeAndPatchPackageJson(rawJson: string): AnalysisResult {
  const issues: PatchIssue[] = [];
  let parsed: Record<string, unknown> = {};
  let isJsonValid = true;

  try {
    parsed = JSON.parse(rawJson);
  } catch (e: unknown) {
    isJsonValid = false;
    issues.push({
      type: 'critical',
      title: 'صيغة JSON غير صحيحة',
      description: 'الملف المدخل يحتوي على أخطاء تركيبية، تم إنشاء ملف package.json قياسي وصحيح بدلاً منه.',
      action: 'إعادة بناء كائن JSON سليم بالكامل'
    });
  }

  if (!isJsonValid) {
    const fallback = {
      name: "ezoo-download",
      version: "1.0.0",
      main: "main.js",
      scripts: {
        start: "electron .",
        "build:win7": "electron-builder --win --x64 --ia32 --publish never"
      },
      devDependencies: {
        electron: "22.3.27",
        "electron-builder": "^24.13.3"
      }
    };
    return {
      hasAutoUpdate: false,
      electronVersion: '22.3.27',
      isWin7Compatible: true,
      issues,
      patchedContent: JSON.stringify(fallback, null, 2)
    };
  }

  // 1. Check Electron Version
  const devDeps = (parsed.devDependencies || {}) as Record<string, string>;
  const deps = (parsed.dependencies || {}) as Record<string, string>;
  
  let currentElectron = devDeps.electron || deps.electron || null;
  let isWin7Compatible = false;

  if (!currentElectron) {
    issues.push({
      type: 'critical',
      title: 'حزمة Electron غير مثبتة',
      description: 'لم يتم العثور على حزمة electron في ملف الحزم، تم تثبيت الإصدار 22.3.27 المتوافق مع ويندوز 7.',
      action: 'إضافة "electron": "22.3.27"'
    });
    devDeps.electron = "22.3.27";
    isWin7Compatible = true;
  } else {
    // Check if version is > 22
    const cleanVer = currentElectron.replace(/[\^~>=]/g, '');
    const major = parseInt(cleanVer.split('.')[0], 10);
    if (major > 22) {
      issues.push({
        type: 'critical',
        title: `إصدار Electron الحالي (${currentElectron}) لا يدعم ويندوز 7!`,
        description: `إصدارات Electron ابتداءً من 23 أسقطت دعم ويندوز 7 تماماً وتسبب خطأ فوري عند فتح البرنامج (CreateFile2 / KERNEL32.dll).`,
        action: 'تخفيض الإصدار وتثبيته على "22.3.27" (آخر إصدار مستقر لويندوز 7)'
      });
      devDeps.electron = "22.3.27";
      if (deps.electron) delete deps.electron;
      isWin7Compatible = false;
    } else {
      isWin7Compatible = true;
      issues.push({
        type: 'info',
        title: `إصدار Electron (${currentElectron}) متوافق`,
        description: 'إصدار Electron متوافق مع نظام Windows 7 (أقل أو يساوي 22).',
        action: 'تثبيت الإصدار على 22.3.27 لضمان أحدث التحديثات الأمنية'
      });
      devDeps.electron = "22.3.27";
    }
  }

  // 2. Check Auto Updater
  let hasAutoUpdate = false;
  const updaterPackages = ['electron-updater', 'update-electron-app', 'electron-auto-updater'];
  for (const pkg of updaterPackages) {
    if (deps[pkg]) {
      hasAutoUpdate = true;
      delete deps[pkg];
      issues.push({
        type: 'critical',
        title: `حذف مكتبة التحديث التلقائي (${pkg})`,
        description: `هذه المكتبة تقوم بفحص وتنزيل تحديثات تلقائية غير متوافقة مع ويندوز 7 تؤدي إلى تعطل التطبيق فجأة عند المستخدمين.`,
        action: `تمت إزالة ${pkg} من dependencies`
      });
    }
    if (devDeps[pkg]) {
      hasAutoUpdate = true;
      delete devDeps[pkg];
      issues.push({
        type: 'critical',
        title: `حذف مكتبة التحديث التلقائي (${pkg})`,
        description: `تمت إزالة حزمة التحديث التلقائي من devDependencies لتعطيل التحديث نهائياً.`,
        action: `تمت إزالة ${pkg}`
      });
    }
  }

  // 3. Check electron-builder
  if (!devDeps['electron-builder']) {
    devDeps['electron-builder'] = "^24.13.3";
    issues.push({
      type: 'warning',
      title: 'إضافة مكتبة electron-builder',
      description: 'تمت إضافة electron-builder لبناء ملفات تثبيت exe لويندوز 7 ومشاركتها في GitHub Releases.',
      action: 'إضافة "electron-builder": "^24.13.3"'
    });
  }

  // 4. Check scripts
  parsed.scripts = parsed.scripts || {};
  const scripts = parsed.scripts as Record<string, string>;
  if (!scripts['build:win7']) {
    scripts['build:win7'] = "electron-builder --win --publish never";
    issues.push({
      type: 'info',
      title: 'إضافة أمر البناء build:win7',
      description: 'تمت إضافة سكربت بناء خاص بنظام ويندوز مع إيقاف النشر التلقائي.',
      action: 'إضافة "build:win7": "electron-builder --win --publish never"'
    });
  }

  // 5. Check build config
  const build = (parsed.build || {}) as Record<string, unknown>;
  build.publish = null; // force disable auto-publish
  build.win = {
    target: [
      { target: "nsis", arch: ["x64", "ia32"] },
      { target: "portable", arch: ["x64", "ia32"] }
    ],
    requestedExecutionLevel: "asInvoker"
  };
  build.nsis = {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    artifactName: "${productName}-Setup-${version}-${arch}.${ext}",
    differentialPackage: false
  };

  parsed.dependencies = deps;
  parsed.devDependencies = devDeps;
  parsed.build = build;

  return {
    hasAutoUpdate,
    electronVersion: currentElectron,
    isWin7Compatible,
    issues,
    patchedContent: JSON.stringify(parsed, null, 2)
  };
}

export function analyzeAndPatchMainJs(rawCode: string): AnalysisResult {
  const issues: PatchIssue[] = [];
  let patched = rawCode;
  let hasAutoUpdate = false;

  // Check for autoUpdater imports or calls
  if (
    rawCode.includes('autoUpdater') ||
    rawCode.includes('electron-updater') ||
    rawCode.includes('checkForUpdates')
  ) {
    hasAutoUpdate = true;
    issues.push({
      type: 'critical',
      title: 'تم العثور على كود التحديث التلقائي (autoUpdater)',
      description: 'الكود يحتوي على استدعاءات لمكتبات فحص التحديثات التلقائية. سيتم حقن كود تجميد وإلغاء فوري لها.',
      action: 'حقن كود إيقاف التحديث التلقائي في بداية الملف'
    });
  }

  // Check for certificate error handling
  if (!rawCode.includes('ignore-certificate-errors') && !rawCode.includes('setCertificateVerifyProc')) {
    issues.push({
      type: 'warning',
      title: 'عدم معالجة شهادات SSL القديمة في ويندوز 7',
      description: 'نظام ويندوز 7 تنقصه شهادات الأمان الحديثة (مثل ISRG Root X1)، مما يجعل تحميل المواقع أو روابط التنزيل يفشل بخطأ شهادة.',
      action: 'إضافة معالج تجاوز أخطاء الشهادات القديمة'
    });
  }

  // Check for hardware acceleration
  if (!rawCode.includes('disable-gpu') && !rawCode.includes('disableHardwareAcceleration')) {
    issues.push({
      type: 'info',
      title: 'كروت الشاشة القديمة في ويندوز 7',
      description: 'يوصى بتعطيل تسريع العتاد GPU أو حمايته لتفادي تشنج التطبيق على بطاقات Intel القديمة.',
      action: 'إضافة خيار الأمان لكروت الشاشة القديمة'
    });
  }

  const headerSnippet = `// ========================================================
// 🛡️ [Ezoo Win7 Patch] إيقاف التحديث التلقائي ودعم ويندوز 7
// ========================================================
try {
  const electron = require('electron');
  if (electron && electron.autoUpdater) {
    electron.autoUpdater.autoDownload = false;
    electron.autoUpdater.autoInstallOnAppQuit = false;
    electron.autoUpdater.checkForUpdates = () => Promise.resolve(null);
    electron.autoUpdater.checkForUpdatesAndNotify = () => Promise.resolve(null);
  }
} catch (e) {}

try {
  const electronUpdater = require('electron-updater');
  if (electronUpdater && electronUpdater.autoUpdater) {
    electronUpdater.autoUpdater.autoDownload = false;
    electronUpdater.autoUpdater.autoInstallOnAppQuit = false;
    electronUpdater.autoUpdater.checkForUpdates = () => Promise.resolve(null);
    electronUpdater.autoUpdater.checkForUpdatesAndNotify = () => Promise.resolve(null);
  }
} catch (e) {}

// تحسينات أمان وتوافق ويندوز 7
try {
  const { app } = require('electron');
  if (app) {
    app.commandLine.appendSwitch('disable-gpu-sandbox');
    app.commandLine.appendSwitch('ignore-certificate-errors');
  }
} catch (e) {}
// ========================================================\n\n`;

  // Inject at top if not already present
  if (!patched.includes('[Ezoo Win7 Patch]')) {
    patched = headerSnippet + patched;
  }

  // Replace active checkForUpdates calls
  patched = patched.replace(
    /\.checkForUpdatesAndNotify\(\)/g,
    '/* .checkForUpdatesAndNotify() - DISABLED FOR WIN7 */'
  );
  patched = patched.replace(
    /\.checkForUpdates\(\)/g,
    '/* .checkForUpdates() - DISABLED FOR WIN7 */'
  );

  return {
    hasAutoUpdate,
    electronVersion: '22.3.27',
    isWin7Compatible: true,
    issues,
    patchedContent: patched
  };
}
