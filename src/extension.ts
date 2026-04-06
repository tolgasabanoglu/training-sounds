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
  const terminalListener = (vscode.window as any).onDidWriteTerminalData(
    (e: { data: string }) => {
      const event = detectInText(e.data, TERMINAL_PATTERNS);
      if (event) {
        player.play(event.family, event.action);
        showStatusMessage(event.label, event.action);
      }
    }
  );

  // ------------------------------------------------------------------
  // 2. Document save listener
  // Scans the saved Python file for algorithm instantiation patterns.
  // ------------------------------------------------------------------
  const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
    const lang = doc.languageId;
    if (lang !== "python") {
      return;
    }
    const text = doc.getText();
    const event = detectInText(text, CODE_PATTERNS);
    if (event) {
      player.play(event.family, "start");
    }
  });

  // ------------------------------------------------------------------
  // 3. Notebook cell execution listener
  // Uses onDidChangeNotebookDocument (stable API) to detect when a cell
  // transitions from executing to idle (i.e. just finished running).
  // ------------------------------------------------------------------
  const notebookListener = vscode.workspace.onDidChangeNotebookDocument((e) => {
    for (const cellChange of e.cellChanges) {
      const cell = cellChange.cell;

      if (cell.kind !== vscode.NotebookCellKind.Code) {
        continue;
      }

      const summary = cell.executionSummary;

      // Cell just started executing (no end time yet)
      if (summary && summary.timing && !summary.timing.endTime) {
        const source = cell.document.getText();
        const sourceEvent = detectInText(source, CODE_PATTERNS);
        if (sourceEvent) {
          player.play(sourceEvent.family, "start");
          showStatusMessage(sourceEvent.label, "start");
        }
      }

      // Cell just finished (has both start and end time)
      if (summary && summary.timing && summary.timing.endTime) {
        // First scan cell outputs for recognizable completion signals
        let handled = false;
        for (const output of cell.outputs) {
          for (const item of output.items) {
            if (item.mime.startsWith("text/")) {
              const text = Buffer.from(item.data).toString("utf8");
              const outputEvent = detectInText(text, TERMINAL_PATTERNS);
              if (outputEvent) {
                player.play(outputEvent.family, outputEvent.action);
                showStatusMessage(outputEvent.label, outputEvent.action);
                handled = true;
                break;
              }
            }
          }
          if (handled) { break; }
        }

        // Fallback — play complete sound based on source if no output matched
        if (!handled) {
          const source = cell.document.getText();
          const sourceEvent = detectInText(source, CODE_PATTERNS);
          if (sourceEvent) {
            player.play(sourceEvent.family, "complete");
            showStatusMessage(sourceEvent.label, "complete");
          }
        }
      }
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
      "transformer",
      "cnn",
      "rnn",
      "diffusion",
      "reinforcement",
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

  context.subscriptions.push(
    terminalListener,
    saveListener,
    notebookListener,
    toggleCmd,
    testCmd
  );

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
