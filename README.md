# Training Sounds

A VSCode extension that plays sounds when your ML algorithms run.

Linear regression gets a clean chime. Random forest gets rustling. Neural networks hum through epochs. Because your terminal deserves a personality.

## How it works

**Terminal listener** — watches integrated terminal output for recognizable strings from sklearn, PyTorch, XGBoost, LightGBM, and others.

**Save-time detection** — scans Python files on save for algorithm instantiation patterns.

**Two sound events per algorithm:**
- `start` — triggered when training begins
- `complete` — triggered when results appear (accuracy, score, convergence)

## Supported algorithms

| Algorithm | Detection |
|-----------|-----------|
| Linear / Logistic Regression | `LinearRegression`, `LogisticRegression`, `Ridge`, `Lasso` |
| Random Forest | `RandomForestClassifier`, `RandomForestRegressor`, `ExtraTrees` |
| Neural Networks | Epoch output, `val_loss`, `val_accuracy`, MLP |
| K-Means / Clustering | `KMeans`, `DBSCAN`, convergence messages |
| SVM | `SVC`, `SVR`, `LinearSVC`, optimization output |
| Gradient Boosting | `XGBoost`, `LightGBM`, `CatBoost`, `GradientBoosting` |
| Dimensionality Reduction | `PCA`, `UMAP`, `t-SNE` |

## Setup

```bash
cd training-sounds
npm install
npm run compile
```

Then press `F5` in VSCode to launch the Extension Development Host.

Add your `.mp3` files to the `sounds/` directory — see [sounds/README.md](sounds/README.md) for the expected filenames.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `trainingSounds.enabled` | `true` | Toggle all sounds |
| `trainingSounds.volume` | `0.7` | Volume 0–1 |
| `trainingSounds.playOnStart` | `true` | Play when algorithm starts |
| `trainingSounds.playOnComplete` | `true` | Play when training completes |
| `trainingSounds.algorithms` | all `true` | Per-family toggles |

## Commands

- `Training Sounds: Toggle On/Off`
- `Training Sounds: Test Sound` — pick an algorithm family and preview its sound

## Stack

TypeScript · VSCode Extension API · Node.js child_process (afplay / aplay / PowerShell)
