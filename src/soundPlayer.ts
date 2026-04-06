/**
 * soundPlayer.ts
 *
 * Plays sounds using the system `afplay` (macOS), `aplay` (Linux),
 * or PowerShell (Windows). Bundled .mp3 files live in the sounds/ directory.
 *
 * VSCode extensions run in Node.js (no browser Audio API), so we shell out.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";
import { AlgorithmFamily, Action } from "./detectors";

// Maps (family, action) → sound filename in the sounds/ directory
const SOUND_MAP: Record<AlgorithmFamily, Record<Action, string>> = {
  linearModels:   { start: "linear_start.mp3",       complete: "complete.mp3" },
  randomForest:   { start: "forest_start.mp3",        complete: "complete.mp3" },
  neuralNetwork:  { start: "neural_start.mp3",        complete: "neural_complete.mp3" },
  clustering:     { start: "cluster_start.mp3",       complete: "cluster_complete.mp3" },
  svm:            { start: "svm_start.mp3",           complete: "complete.mp3" },
  boosting:       { start: "boost_start.mp3",         complete: "complete.mp3" },
  dimensionality: { start: "pca_start.mp3",           complete: "complete.mp3" },
  transformer:    { start: "transformer_start.mp3",   complete: "transformer_complete.mp3" },
  cnn:            { start: "cnn_start.mp3",           complete: "complete.mp3" },
  rnn:            { start: "rnn_start.mp3",           complete: "complete.mp3" },
  diffusion:      { start: "diffusion_start.mp3",     complete: "diffusion_complete.mp3" },
  reinforcement:  { start: "rl_start.mp3",            complete: "rl_complete.mp3" },
};

// Fallback sound if a specific file is missing
const FALLBACK_SOUND = "test.wav";

export class SoundPlayer {
  private extensionPath: string;
  private lastPlayed: Map<string, number> = new Map();
  private DEBOUNCE_MS = 3000; // don't replay same sound within 3s

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }

  play(family: AlgorithmFamily, action: Action): void {
    const config = vscode.workspace.getConfiguration("trainingSounds");

    if (!config.get<boolean>("enabled", true)) {
      return;
    }
    if (action === "start" && !config.get<boolean>("playOnStart", true)) {
      return;
    }
    if (action === "complete" && !config.get<boolean>("playOnComplete", true)) {
      return;
    }

    const algorithms = config.get<Record<string, boolean>>("algorithms", {});
    if (algorithms[family] === false) {
      return;
    }

    // Debounce: avoid spamming the same sound
    const key = `${family}:${action}`;
    const now = Date.now();
    if ((this.lastPlayed.get(key) ?? 0) + this.DEBOUNCE_MS > now) {
      return;
    }
    this.lastPlayed.set(key, now);

    const filename = SOUND_MAP[family]?.[action] ?? FALLBACK_SOUND;
    const soundPath = path.join(this.extensionPath, "sounds", filename);
    const volume = config.get<number>("volume", 0.7);

    this._play(soundPath, volume);
  }

  playByPath(soundFile: string, volume = 0.7): void {
    this._play(soundFile, volume);
  }

  private _play(soundPath: string, volume: number): void {
    const platform = process.platform;
    let cmd: string;

    if (platform === "darwin") {
      // afplay supports -v volume (0–255, default 1 = normal)
      const vol = Math.round(volume * 255);
      cmd = `afplay -v ${vol} "${soundPath}"`;
    } else if (platform === "linux") {
      cmd = `aplay "${soundPath}" 2>/dev/null || paplay "${soundPath}" 2>/dev/null`;
    } else if (platform === "win32") {
      cmd = `powershell -c (New-Object Media.SoundPlayer '${soundPath}').PlaySync()`;
    } else {
      return;
    }

    cp.exec(cmd, (err) => {
      if (err) {
        // Silently fail — a missing sound file shouldn't crash the extension
        console.warn(`[training-sounds] Could not play ${soundPath}: ${err.message}`);
      }
    });
  }
}
