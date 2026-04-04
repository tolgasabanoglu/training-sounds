# Training Sounds

A VSCode extension that plays sounds when your ML algorithms run.

Linear regression gets a clean chime. Random forest gets rustling. Neural networks hum through epochs. Because your terminal deserves a personality.

## How it works

**Terminal listener** — watches integrated terminal output for recognizable strings from sklearn, PyTorch, XGBoost, LightGBM, and others.

**Notebook cell listener** — fires on cell execution start and completion in `.ipynb` files.

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
| Transformers | Hugging Face `Trainer`, `from_pretrained`, BERT, GPT-2, T5 |
| CNN | `Conv2d`, ResNet, VGG, EfficientNet, MobileNet, `torchvision.models` |
| RNN / LSTM / GRU | `nn.LSTM`, `nn.GRU`, Keras LSTM, Bidirectional |
| Diffusion Models | `StableDiffusionPipeline`, `DDPMScheduler`, `diffusers` |
| Reinforcement Learning | PPO, DQN, A2C, SAC, `gym.make`, Stable Baselines3 |

## Planned features

### Error & failure sounds
Detect Python tracebacks and exceptions in terminal output or cell output and play a distinct failure sound. No more staring at the screen — you'll hear when something breaks.

### Desktop notifications for long runs
When training takes longer than a configurable threshold (default: 30 seconds), fire a native OS desktop notification so you can leave and come back. The notification includes the algorithm name and elapsed time.

### Roast mode
If your model accuracy is detected as low (< 60%) in terminal or cell output, play a sad trombone instead of the usual complete sound. Configurable threshold.

### Streaks
Play a special sound when you train 5+ models in one session. Reward consistency.

### Mood themes
Swap the entire sound pack in one setting: lo-fi, 8-bit arcade, cinematic, nature. Same triggers, different personality.

### Training counter
Status bar item showing how many models you've trained today and total training time.

### Failure / overfitting warning
Detect overfitting signals (`train accuracy >> val accuracy`) in output and play a warning tone.

### Progress ticks
For long training runs, play a soft tick every 30 seconds so you know it's still running without looking at the screen.

### Training receipt
Generate a fun summary of your session — algorithms run, total training time, best accuracy — shareable as an image.

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
