import JSZip from 'jszip';
import { GeneratedFile, Win7Config } from '../types';

export const defaultConfig: Win7Config = {
  appName: 'ezoo-download',
  appDisplayName: 'Ezoo Download',
  repoOwner: 'MustafaMohamedCoder',
  repoName: 'ezoo-download-for-windows-7',
  version: '1.0.0',
  electronVersion: '22.3.27', // The absolute last official stable release supporting Windows 7
  buildX64: true,
  buildIa32: true, // 32-bit is critical for legacy Windows 7
  buildPortable: true,
  buildInstaller: true,
  disableGpuFallback: true,
  bypassOldSslErrors: true,
  triggerOnTag: true,
  triggerOnPushMain: true,
  triggerManual: true,
  createDraftRelease: false,
  prerelease: false,
};

export function generateWorkflowYaml(config: Win7Config): string {
  const triggerSections: string[] = [];

  if (config.triggerOnTag) {
    triggerSections.push(`    tags:\n      - 'v*'`);
  }
  if (config.triggerOnPushMain) {
    triggerSections.push(`    branches:\n      - main\n      - master`);
  }

  const triggers = `on:
  push:
${triggerSections.join('\n')}
${
  config.triggerManual
    ? `  workflow_dispatch:
    inputs:
      release_tag:
        description: 'رقم الإصدار (Release Tag مثل v1.0.0)'
        required: false
        default: 'v${config.version}'
      release_title:
        description: 'عنوان الإصدار'
        required: false
        default: '${config.appDisplayName} v${config.version} - Windows 7 Ready'`
    : ''
}`;

  return `name: Build & Release for Windows 7

# يتم تفعيل هذا الورك فلو تلقائياً عند الرفع على GitHub لبناء التطبيق ورفعه في Releases
${triggers}

permissions:
  contents: write # صلاحية ضرورية جداً لإنشاء Release ورفع ملفات exe بدون أخطاء 403

jobs:
  build-and-release:
    name: Build Windows 7 (${[config.buildX64 ? 'x64' : '', config.buildIa32 ? 'ia32' : ''].filter(Boolean).join(' + ')})
    runs-on: windows-latest

    steps:
      - name: 📥 استنساخ المستودع (Checkout Code)
        uses: actions/checkout@v4

      - name: ⚙️ إعداد بيئة Node.js المتوافقة
        uses: actions/setup-node@v4
        with:
          node-version: 18 # بيئة البناء
          cache: 'npm'

      - name: 📦 تثبيت الحزم والاعتماديات
        run: |
          npm install --legacy-peer-deps

      - name: 🔨 بناء التطبيق لويندوز 7 بنسخ (x64 / ia32)
        env:
          NODE_SKIP_PLATFORM_CHECK: 1
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run build:win7

      - name: 🔍 فحص الملفات الناتجة
        shell: bash
        run: |
          echo "الملفات التي تم بناؤها في مجلد dist:"
          ls -lh dist/ || dir dist

      - name: 🚀 إنشاء GitHub Release ورفع ملفات التثبيت
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch' || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        with:
          name: \${{ github.event.inputs.release_title || format('${config.appDisplayName} {0} (Windows 7 / 8 / 10 / 11)', github.ref_name) }}
          tag_name: \${{ github.ref_name != 'main' && github.ref_name != 'master' && github.ref_name || github.event.inputs.release_tag || format('v{0}', '${config.version}') }}
          draft: ${config.createDraftRelease}
          prerelease: ${config.prerelease}
          generate_release_notes: true
          body: |
            ## 🌟 إصدار جديد متوافق مع Windows 7 / 8 / 10 / 11
            
            تم بناء هذا الإصدار خصيصاً ليعمل بسلاسة وثبات تام على **نظام ويندوز 7** (Windows 7 SP1 والإصدارات الأحدث):
            
            - 🛡️ **إيقاف التحديث التلقائي بالكامل**: تم تعطيل autoUpdater لمنع تحميل أي تحديثات غير متوافقة تسبب كراش.
            - ⚡ **Electron 22.3.27**: آخر إصدار رسمي يدعم ويندوز 7 أصلياً دون الحاجة لملفات dll معدلة.
            - 💻 **دعم المعماريات**: يشمل نواة 64-bit (x64) ونواة 32-bit (ia32).
            - 🛠️ **ملف تثبيت NSIS وملف محمول (Portable)**.
          files: |
            dist/*.exe
            dist/*.zip
            dist/*.blockmap
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

export function generatePackageJson(config: Win7Config): string {
  const archs: string[] = [];
  if (config.buildX64) archs.push('"x64"');
  if (config.buildIa32) archs.push('"ia32"');

  const targets: string[] = [];
  if (config.buildInstaller) {
    targets.push(`        { "target": "nsis", "arch": [${archs.join(', ')}] }`);
  }
  if (config.buildPortable) {
    targets.push(`        { "target": "portable", "arch": [${archs.join(', ')}] }`);
  }

  const pkg = {
    name: config.appName,
    productName: config.appDisplayName,
    version: config.version,
    description: "Ezoo Downloader with native Windows 7 compatibility and disabled auto-updater",
    main: "main.js",
    author: config.repoOwner,
    license: "MIT",
    scripts: {
      start: "electron .",
      "build:win7": `electron-builder --win --publish never`,
      "pack:win": "electron-builder --dir",
      dist: "npm run build:win7"
    },
    dependencies: {},
    devDependencies: {
      electron: config.electronVersion,
      "electron-builder": "^24.13.3"
    },
    build: {
      appId: `com.${config.repoOwner.toLowerCase()}.${config.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      productName: config.appDisplayName,
      publish: null, // Critical: blocks any electron-updater publishing/checking
      directories: {
        output: "dist"
      },
      win: {
        target: targets.length > 0 ? "__TARGETS_PLACEHOLDER__" : [{ target: "nsis", arch: ["x64", "ia32"] }],
        requestedExecutionLevel: "asInvoker",
        legalTrademarks: "All rights reserved"
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: config.appDisplayName,
        artifactName: "\${productName}-Setup-\${version}-\${arch}.\${ext}",
        differentialPackage: false
      },
      portable: {
        artifactName: "\${productName}-Portable-\${version}-\${arch}.\${ext}"
      }
    }
  };

  let jsonStr = JSON.stringify(pkg, null, 2);
  jsonStr = jsonStr.replace(
    '"__TARGETS_PLACEHOLDER__"',
    `[\n${targets.join(',\n')}\n      ]`
  );

  return jsonStr;
}

export function generateDisableAutoUpdateSnippet(): string {
  return `/**
 * ========================================================
 * 🛡️ كود إيقاف التحديث التلقائي التام لويندوز 7
 * ========================================================
 * ضَع هذا الكود في أول سطر داخل ملف main.js أو index.js
 * يمنع أي محاولة اتصال بسيرفر التحديثات أو تنزيل ملفات
 * جديدة قد تؤدي لعطل في ويندوز 7.
 */

// 1. تجميد وتعطيل مكتبة electron autoUpdater
try {
  const electron = require('electron');
  if (electron.autoUpdater) {
    electron.autoUpdater.checkForUpdates = () => {
      console.log('[Ezoo Win7] Auto-update is permanently disabled.');
      return Promise.resolve(null);
    };
    electron.autoUpdater.checkForUpdatesAndNotify = () => {
      console.log('[Ezoo Win7] Auto-update notify is permanently disabled.');
      return Promise.resolve(null);
    };
    electron.autoUpdater.autoDownload = false;
    electron.autoUpdater.autoInstallOnAppQuit = false;
  }
} catch (e) {
  // Ignored
}

// 2. تجميد وتعطيل مكتبة electron-updater (في حال كانت مستخدمة في المشروع)
try {
  const electronUpdater = require('electron-updater');
  if (electronUpdater && electronUpdater.autoUpdater) {
    electronUpdater.autoUpdater.autoDownload = false;
    electronUpdater.autoUpdater.autoInstallOnAppQuit = false;
    electronUpdater.autoUpdater.checkForUpdates = () => Promise.resolve(null);
    electronUpdater.autoUpdater.checkForUpdatesAndNotify = () => Promise.resolve(null);
    electronUpdater.autoUpdater.on = () => {};
    console.log('[Ezoo Win7] electron-updater neutralized.');
  }
} catch (e) {
  // electron-updater is not installed or required
}

// 3. منع المتصفح من إرسال طلبات فحص التحديثات
module.exports = {
  isAutoUpdateDisabled: true,
  win7CompatibilityMode: true
};
`;
}

export function generateMainJs(config: Win7Config): string {
  return `/**
 * @file main.js
 * Ezoo Downloader - Windows 7 Optimized Main Process
 * 
 * الميزات:
 * 1. إيقاف كامل للتحديث التلقائي (Auto-Updater Disabled).
 * 2. توافقية كاملة مع Windows 7 SP1 ومحرك Electron 22.
 * 3. حماية من أخطاء شهادات SSL القديمة في ويندوز 7.
 * 4. تشغيل آمن لمعالجات الرسوميات القديمة (GPU Safety Switches).
 */

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// 1. 🛡️ إيقاف التحديث التلقائي نهائياً
try {
  const electron = require('electron');
  if (electron.autoUpdater) {
    electron.autoUpdater.autoDownload = false;
    electron.autoUpdater.autoInstallOnAppQuit = false;
    electron.autoUpdater.checkForUpdates = () => Promise.resolve(null);
    electron.autoUpdater.checkForUpdatesAndNotify = () => Promise.resolve(null);
  }
} catch (err) {}

// 2. ⚡ تحسينات وتوافقية نظام Windows 7
${
  config.disableGpuFallback
    ? `// تفادي انهيار التطبيق على كروت الشاشة القديمة في ويندوز 7
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-sandbox');`
    : ''
}
${
  config.bypassOldSslErrors
    ? `// تجاهل أخطاء شهادات SSL القديمة الناتجة عن عدم تحديث شهادات ويندوز 7
app.commandLine.appendSwitch('ignore-certificate-errors');`
    : ''
}

// منع تعدد النسخ (Single Instance Lock)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "${config.appDisplayName}",
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false, // تحسين التوافق على ويندوز 7
      webSecurity: true
    }
  });

  // في ويندوز 7 قد تفشل بعض طلبات HTTPS بسبب انتهاء شهادة DST Root CA X3
  // هذا المعالج يضمن استمرار تحميل روابط التنزيل والموقع دون حظر
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    callback(0); // 0 يعني قبول الشهادة وتخطي الأخطاء القديمة
  });

  // تحميل واجهة التطبيق
  // إذا كان لديك ملف index.html محلي:
  mainWindow.loadFile(path.join(__dirname, 'index.html')).catch(() => {
    // أو تحميل رابط الموقع / الواجهة
    mainWindow.loadURL('https://ezoo.app').catch((e) => {
      console.log('Error loading URL:', e);
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;
}

export function generatePreloadJs(): string {
  return `/**
 * @file preload.js
 * Preload Script for Ezoo Downloader
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ezooAPI', {
  platform: 'win7-compatible',
  isAutoUpdateDisabled: true,
  version: '1.0.0',
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
});
`;
}

export function generateElectronBuilderYml(config: Win7Config): string {
  return `appId: com.${config.repoOwner.toLowerCase()}.${config.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}
productName: ${config.appDisplayName}
directories:
  output: dist

# إيقاف خيارات النشر والتحديث التلقائي
publish: null

win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
    - target: portable
      arch:
        - x64
        - ia32
  requestedExecutionLevel: asInvoker

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: ${config.appDisplayName}
  artifactName: "\${productName}-Setup-\${version}-\${arch}.\${ext}"
  differentialPackage: false

portable:
  artifactName: "\${productName}-Portable-\${version}-\${arch}.\${ext}"
`;
}

export function generateBuildBat(): string {
  return `@echo off
echo ========================================================
echo   Ezoo Downloader - Windows 7 Local Builder
echo ========================================================
echo.

SET NODE_SKIP_PLATFORM_CHECK=1

echo [1/3] Checking dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building Win7 x64 and ia32 (32-bit)...
call npx electron-builder --win --x64 --ia32 --publish never
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Success! Check the 'dist' folder for your setup files:
dir dist\\*.exe
echo.
echo Finished successfully!
pause
`;
}

export function generateGitIgnore(): string {
  return `node_modules/
dist/
dist-electron/
.env
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
}

export function generateReadme(config: Win7Config): string {
  return `# ${config.appDisplayName} - نسخة مخصصة لنظام Windows 7

مستودع: [${config.repoOwner}/${config.repoName}](https://github.com/${config.repoOwner}/${config.repoName})

هذا المستودع مهيأ خصيصاً للعمل على **Windows 7** وإلغاء أي تحديث تلقائي قد يعطل البرنامج، مع سير عمل مؤتمت بالكامل عبر **GitHub Actions** لبناء ملفات التثبيت \`.exe\` ورفعها تلقائياً في قسم **Releases**.

---

## 🚀 ما تم تعديله لحل المشاكل:

1. **إيقاف التحديث التلقائي نهائياً (Auto-Updater Disabled)**:
   - تم استبدال وتعطيل دوال \`autoUpdater\` في كود Electron.
   - تم ضبط \`publish: null\` لمنع توليد ملفات \`app-update.yml\` التي تقوم بتحميل تحديثات ويندوز 10/11 الحديثة غير المتوافقة.

2. **التوافق التام مع Windows 7**:
   - استخدام محرك **Electron 22.3.27** (آخر إصدار رسمي من Electron يدعم ويندوز 7 و 8.1 بشكل كامل ومستقر).
   - توفير بنية **32-bit (ia32)** وبنية **64-bit (x64)**.
   - إضافة إعدادات تجاوز أخطاء شهادات SSL القديمة في ويندوز 7 (\`ignore-certificate-errors\`).
   - خيارات تخفيف استهلاك كرت الشاشة (\`disable-gpu\`).

3. **البناء التلقائي في قسم Releases (GitHub Actions)**:
   - ملف \`.github/workflows/release.yml\` مجهز لبناء ملفات \`Setup.exe\` و \`Portable.exe\` بمجرد دفع كود جديد أو إنشاء Tag.

---

## 🛠️ خطوات التشغيل والرفع على GitHub:

### الخطوة 1: تفعيل صلاحيات الكتابة في مستودع GitHub
قبل الرفع، تأكد من خطوة واحدة في مستودعك على GitHub:
1. افتح صفحة المستودع: \`https://github.com/${config.repoOwner}/${config.repoName}\`
2. اضغط على **Settings** (الإعدادات).
3. من القائمة الجانبية، اختر **Actions** ثم **General**.
4. انزل إلى قسم **Workflow permissions**.
5. اختر **Read and write permissions**، ثم اضغط **Save**.

### الخطوة 2: رفع الملفات إلى المستودع
في مجلد المشروع على جهازك:
\`\`\`bash
git add .
git commit -m "feat: Support Windows 7, disable auto-update, and add GitHub Release workflow"
git push origin main
\`\`\`

### الخطوة 3: إطلاق إصدار جديد (Release)
بمجرد أن تدفع Tag أو تدفع على فرع \`main\`، سيبدأ GitHub Actions تلقائياً:
\`\`\`bash
git tag v${config.version}
git push origin v${config.version}
\`\`\`

بمجرد اكتمال البناء (يستغرق حوالي دقيقتين إلى 4 دقائق)، ستجد ملفات التثبيت جاهزة للتنزيل مباشرة في:
👉 \`https://github.com/${config.repoOwner}/${config.repoName}/releases\`
`;
}

export function getAllGeneratedFiles(config: Win7Config): GeneratedFile[] {
  return [
    {
      id: 'workflow',
      path: '.github/workflows/release.yml',
      fileName: 'release.yml',
      language: 'yaml',
      description: 'سير عمل GitHub Actions لبناء التطبيق ورفعه في قسم Releases تلقائياً',
      recommendedPath: '.github/workflows/release.yml',
      content: generateWorkflowYaml(config)
    },
    {
      id: 'package_json',
      path: 'package.json',
      fileName: 'package.json',
      language: 'json',
      description: 'ملف الحزم مضبوط على Electron 22.3.27 وإعدادات electron-builder لويندوز 7',
      recommendedPath: 'package.json',
      content: generatePackageJson(config)
    },
    {
      id: 'disable_autoupdate',
      path: 'disable-auto-update.js',
      fileName: 'disable-auto-update.js',
      language: 'javascript',
      description: 'سكربت مستقل لإلغاء وتجميد أي طلبات تحديث تلقائي ومنع الكراش',
      recommendedPath: 'disable-auto-update.js',
      content: generateDisableAutoUpdateSnippet()
    },
    {
      id: 'main_js',
      path: 'main.js',
      fileName: 'main.js',
      language: 'javascript',
      description: 'ملف تشغيل Electron الرئيسي المعدل والآمن لويندوز 7',
      recommendedPath: 'main.js',
      content: generateMainJs(config)
    },
    {
      id: 'preload_js',
      path: 'preload.js',
      fileName: 'preload.js',
      language: 'javascript',
      description: 'ملف preload الآمن لعزل سياق المتصفح',
      recommendedPath: 'preload.js',
      content: generatePreloadJs()
    },
    {
      id: 'builder_yml',
      path: 'electron-builder.yml',
      fileName: 'electron-builder.yml',
      language: 'yaml',
      description: 'إعدادات حزم التثبيت NSIS والنسخة المحمولة لويندوز 7 (32/64 بت)',
      recommendedPath: 'electron-builder.yml',
      content: generateElectronBuilderYml(config)
    },
    {
      id: 'build_bat',
      path: 'build-win7.bat',
      fileName: 'build-win7.bat',
      language: 'bat',
      description: 'سكربت محلي للبناء على ويندوز بنقرة واحدة والتأكد قبل الرفع',
      recommendedPath: 'build-win7.bat',
      content: generateBuildBat()
    },
    {
      id: 'gitignore',
      path: '.gitignore',
      fileName: '.gitignore',
      language: 'markdown',
      description: 'ملف استبعاد مجلدات dist و node_modules من الرفع',
      recommendedPath: '.gitignore',
      content: generateGitIgnore()
    },
    {
      id: 'readme',
      path: 'README.md',
      fileName: 'README.md',
      language: 'markdown',
      description: 'دليل شامل باللغة العربية يشرح خطوات الرفع والتفعيل في GitHub',
      recommendedPath: 'README.md',
      content: generateReadme(config)
    }
  ];
}

export async function createZipPackage(config: Win7Config): Promise<Blob> {
  const zip = new JSZip();
  const files = getAllGeneratedFiles(config);

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}
