/**
 * Peaches ships in English only. The i18n layer is retained as a seam for
 * future locales, but there is exactly one: `en`.
 */
export type SupportedLocale = 'en';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en'];

export interface ServeMessages {
  startingServer: string;
  siteReady: (url: string) => string;
  portInUse: (port: number) => string;
  portSwitched: (from: number, to: number) => string;
  portRangeExhausted: (start: number, end: number) => string;
  emptyTopics: string;
  serverStopped: string;
  siteNotBuilt: string;
}

export interface CLIMessages {
  programDescription: string;
  initCommandDescription: string;
  updateCommandDescription: string;
  toolsOptionDescription: (ids: string) => string;
  notDirectory: (path: string) => string;
  dirNotExist: (path: string) => string;
  cannotAccess: (path: string, msg: string) => string;
  errorPrefix: (msg: string) => string;
  updateComplete: string;
  forceOption: string;
  portOption: string;
  strictPortOption: string;
  noOpenOption: string;
  serveCommandDescription: string;
  serveHint: string;
}

export interface InitMessages {
  header: string;
  noToolsSelected: string;
  availableTools: (tools: string) => string;
  missingCompiledScript: (filename: string, scriptPath: string) => string;
  skillGenerated: (toolName: string, count: number) => string;
  initComplete: string;
  globalDataPath: (dir: string) => string;
  startLearning: (example: string) => string;
  availableCommands: string;
  cmdLine: (cmd: string, desc: string) => string;
  interactiveSelectPrompt: string;
  migrationComplete: (count: number) => string;
  context7Prompt: string;
  context7Enabled: string;
  context7SetupHint: string;
}

export interface LocaleMessages {
  cli: CLIMessages;
  init: InitMessages;
  serve: ServeMessages;
}
