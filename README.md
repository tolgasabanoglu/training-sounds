# Training Sounds

A VSCode extension that plays sounds when your ML algorithms run.

Linear regression gets a clean chime. Random forest gets rustling. Neural networks hum through epochs. Because your terminal deserves a personality.

## How it works

**Notebook cell listener** — fires on cell execution in `.ipynb` files. Scans cell source on run, cell output on completion.

**Save-time detection** — scans Python files on save for algorithm instantiation patterns.

**Shell integration** — detects when a Python script finishes running in the integrated terminal.

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

## Sounds

Place `.mp3` files in the `sounds/` directory — see [sounds/README.md](sounds/README.md) for expected filenames. If a specific sound file is missing, the extension falls back to `test.wav` automatically.

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

## Planned features

- **Error sounds** — play a distinct sound when a Python traceback or exception is detected
- **Desktop notifications** — notify you when long training runs complete so you can step away
- **Roast mode** — play a sad trombone when model accuracy is below 60%
- **Streaks** — special sound after training 5+ models in one session
- **Mood themes** — swap the entire sound pack: lo-fi, 8-bit arcade, cinematic, nature
- **Training counter** — status bar showing models trained today and total training time
- **Overfitting warning** — detect when train accuracy >> val accuracy and play a warning tone
- **Progress ticks** — soft tick every 30 seconds for long training runs
- **Python / R library** — standalone package that works outside VSCode (Colab, terminal)

## Stack

TypeScript · VSCode Extension API · Node.js child_process (afplay / aplay / PowerShell)
