import * as vscode from "vscode";
import { detectInText, TERMINAL_PATTERNS, CODE_PATTERNS } from "./detectors";
import { SoundPlayer } from "./soundPlayer";

let player: SoundPlayer;

export function activate(context: vscode.ExtensionContext) {
  player = new SoundPlayer(context.extensionPath);

  // ------------------------------------------------------------------
  // 1. Terminal output listener
  // Fires on every chunk written to any integrated terminal.
  // ------------------------------------------------------------------
  const terminalListener = vscode.window.onDidWriteTerminalData((e) => {
    const event = detectInText(e.data, TERMINAL_PATTERNS);
    if (event) {
      player.play(event.family, event.action);
      showStatusMessage(event.label, event.action);
    }
  });

  // ------------------------------------------------------------------
  // 2. Document save listener
  // Scans the saved file for algorithm instantiation patterns.
  // Triggers a "start" sound — a heads-up that training is about to run.
  // ------------------------------------------------------------------
  const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
    const lang = doc.languageId;
    if (lang !== "python" && lang !== "jupyter") {
      return;
    }
    const text = doc.getText();
    const event = detectInText(text, CODE_PATTERNS);
    if (event) {
      player.play(event.family, "start");
    }
  });

  // ------------------------------------------------------------------
  // Commands
  // ------------------------------------------------------------------
  const toggleCmd = vscode.commands.registerCommand("trainingSounds.toggle", () => {
    const config = vscode.workspace.getConfiguration("trainingSounds");
    const current = config.get<boolean>("enabled", true);
    config.update("enabled", !current, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      `Training Sounds ${!current ? "enabled" : "disabled"}.`
    );
  });

  const testCmd = vscode.commands.registerCommand("trainingSounds.testSound", async () => {
    const families = [
      "linearModels",
      "randomForest",
      "neuralNetwork",
      "clustering",
      "svm",
      "boosting",
      "dimensionality",
    ] as const;

    const pick = await vscode.window.showQuickPick(
      families.map((f) => ({ label: f })),
      { placeHolder: "Pick an algorithm family to test" }
    );

    if (pick) {
      player.play(pick.label as any, "start");
      vscode.window.showInformationMessage(`Playing sound for: ${pick.label}`);
    }
  });

  context.subscriptions.push(terminalListener, saveListener, toggleCmd, testCmd);

  console.log("[training-sounds] Extension activated.");
}

export function deactivate() {}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function showStatusMessage(label: string, action: "start" | "complete"): void {
  const config = vscode.workspace.getConfiguration("trainingSounds");
  if (!config.get<boolean>("enabled", true)) {
    return;
  }

  const msg =
    action === "start"
      ? `$(play) Training: ${label} started`
      : `$(check) Training: ${label} complete`;

  vscode.window.setStatusBarMessage(msg, 4000);
}
