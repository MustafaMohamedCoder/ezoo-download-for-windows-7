export interface Win7Config {
  appName: string;
  appDisplayName: string;
  repoOwner: string;
  repoName: string;
  version: string;
  electronVersion: string;
  buildX64: boolean;
  buildIa32: boolean;
  buildPortable: boolean;
  buildInstaller: boolean;
  disableGpuFallback: boolean;
  bypassOldSslErrors: boolean;
  triggerOnTag: boolean;
  triggerOnPushMain: boolean;
  triggerManual: boolean;
  createDraftRelease: boolean;
  prerelease: boolean;
}

export interface GeneratedFile {
  id: string;
  path: string;
  fileName: string;
  language: 'yaml' | 'json' | 'javascript' | 'markdown' | 'bat';
  description: string;
  content: string;
  recommendedPath: string;
}

export interface PatchIssue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
}

export interface AnalysisResult {
  hasAutoUpdate: boolean;
  electronVersion: string | null;
  isWin7Compatible: boolean;
  issues: PatchIssue[];
  patchedContent: string;
}
