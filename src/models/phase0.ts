export interface Phase0Probe {
  launchCount: number;
  lastSavedAt: string | null;
}

export interface Phase0Info {
  appDataDir: string;
  processId: number;
  windowLabels: string[];
}
