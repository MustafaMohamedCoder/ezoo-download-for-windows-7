import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, FolderGit2, Sparkles } from 'lucide-react';
import { GeneratedFile } from '../types';

interface FileViewerProps {
  files: GeneratedFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  files,
  activeFileId,
  onSelectFile,
}) => {
  const [copied, setCopied] = useState(false);

  const currentFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* File Navigation Tabs Header */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {files.map((file) => {
            const isActive = file.id === currentFile.id;
            return (
              <button
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="font-mono">{file.fileName}</span>
                {file.id === 'workflow' && (
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-purple-500/30">
                    GitHub Release
                  </span>
                )}
                {file.id === 'disable_autoupdate' && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                    إيقاف التحديث
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active File Metadata Bar */}
      <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>مسار الملف: </span>
            <span className="font-bold text-white">{currentFile.path}</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {currentFile.description}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الكود</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل الملف</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="relative bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[520px] overflow-y-auto ltr text-left">
        <div className="table w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-slate-900/60">
              <span className="table-cell pr-4 select-none text-slate-600 text-right w-10 text-[11px]">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre text-slate-200">
                {formatCodeSyntax(line, currentFile.language)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer tips */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            قم بحفظ هذا الملف بنفس المسار <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">{currentFile.path}</code> في مجلد مشروعك على جهازك قبل الرفع.
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {lines.length} أسطر • {currentFile.language.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

function formatCodeSyntax(line: string, lang: string) {
  // Simple clean syntax coloring helper for comments, keywords, and strings
  const trimmed = line.trim();

  // Comments
  if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('rem ') || trimmed.startsWith('@echo')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // YAML keys
  if (lang === 'yaml' && line.includes(':')) {
    const parts = line.split(':');
    return (
      <>
        <span className="text-cyan-400 font-medium">{parts[0]}</span>:
        <span className="text-emerald-300">{parts.slice(1).join(':')}</span>
      </>
    );
  }

  // JSON keys
  if (lang === 'json' && line.includes('":')) {
    const parts = line.split('":');
    return (
      <>
        <span className="text-purple-400">{parts[0]}"</span>:
        <span className="text-amber-300">{parts.slice(1).join('":')}</span>
      </>
    );
  }

  return <span>{line}</span>;
}
