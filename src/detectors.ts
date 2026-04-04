/**
 * Algorithm detection patterns.
 *
 * Two detection surfaces:
 *   1. Terminal output — matches what libraries print when running
 *   2. Source code — matches API calls in the active editor
 *
 * Each pattern maps to an AlgorithmEvent with a family and action.
 */

export type AlgorithmFamily =
  | "linearModels"
  | "randomForest"
  | "neuralNetwork"
  | "clustering"
  | "svm"
  | "boosting"
  | "dimensionality";

export type Action = "start" | "complete";

export interface AlgorithmEvent {
  family: AlgorithmFamily;
  action: Action;
  label: string; // human-readable name for notifications
}

interface DetectorPattern {
  regex: RegExp;
  event: AlgorithmEvent;
}

// ------------------------------------------------------------------
// Terminal output patterns
// Libraries print recognisable strings when fitting/training.
// ------------------------------------------------------------------
export const TERMINAL_PATTERNS: DetectorPattern[] = [
  // sklearn verbose output
  { regex: /\[CV\]|cross[_\s]val|cross.validation/i, event: { family: "linearModels", action: "start", label: "Cross-validation" } },

  // Linear models
  { regex: /LinearRegression|LogisticRegression|Ridge|Lasso|ElasticNet/i, event: { family: "linearModels", action: "start", label: "Linear Model" } },

  // Random Forest / trees
  { regex: /RandomForest|ExtraTree|DecisionTree/i, event: { family: "randomForest", action: "start", label: "Random Forest" } },
  { regex: /building tree|n_estimators/i, event: { family: "randomForest", action: "start", label: "Random Forest" } },

  // Neural networks — PyTorch / Keras / sklearn MLP
  { regex: /Epoch\s+\d+\/\d+|epoch\s+\d+/i, event: { family: "neuralNetwork", action: "start", label: "Neural Network" } },
  { regex: /loss:\s*[\d.]+|val_loss|val_accuracy/i, event: { family: "neuralNetwork", action: "start", label: "Neural Network" } },
  { regex: /MLPClassifier|MLPRegressor/i, event: { family: "neuralNetwork", action: "start", label: "MLP" } },
  { regex: /Training complete|Finished training/i, event: { family: "neuralNetwork", action: "complete", label: "Neural Network" } },

  // K-Means / clustering
  { regex: /KMeans|MiniBatchKMeans|Iteration \d+, inertia/i, event: { family: "clustering", action: "start", label: "K-Means" } },
  { regex: /Converged at iteration|KMeans.*converge/i, event: { family: "clustering", action: "complete", label: "K-Means" } },
  { regex: /DBSCAN|AgglomerativeClustering/i, event: { family: "clustering", action: "start", label: "Clustering" } },

  // SVM
  { regex: /SVC|SVR|LinearSVC|SVM/i, event: { family: "svm", action: "start", label: "SVM" } },
  { regex: /optimization finished|nSV\s+\d+/i, event: { family: "svm", action: "complete", label: "SVM" } },

  // Gradient boosting
  { regex: /\[LightGBM\]|\[XGBoost\]|GradientBoosting|XGBClassifier|LGBMClassifier|CatBoost/i, event: { family: "boosting", action: "start", label: "Gradient Boosting" } },
  { regex: /\[\d+\]\s+(train|valid)-|tree\s+\d+\s+of\s+\d+/i, event: { family: "boosting", action: "start", label: "Gradient Boosting" } },

  // PCA / dimensionality reduction
  { regex: /PCA|TruncatedSVD|UMAP|t-SNE|TSNE|explained_variance/i, event: { family: "dimensionality", action: "start", label: "Dimensionality Reduction" } },

  // Generic completion signals
  { regex: /accuracy[:=\s]+([\d.]+)|score[:=\s]+([\d.]+)|R²|r2_score/i, event: { family: "linearModels", action: "complete", label: "Model" } },
];

// ------------------------------------------------------------------
// Source code patterns (scanned on file save or Run command)
// ------------------------------------------------------------------
export const CODE_PATTERNS: DetectorPattern[] = [
  // Linear models
  { regex: /LinearRegression\s*\(|LogisticRegression\s*\(|Ridge\s*\(|Lasso\s*\(/i, event: { family: "linearModels", action: "start", label: "Linear Model" } },

  // Random Forest
  { regex: /RandomForestClassifier\s*\(|RandomForestRegressor\s*\(|ExtraTreesClassifier\s*\(/i, event: { family: "randomForest", action: "start", label: "Random Forest" } },

  // Neural networks
  { regex: /\.fit\s*\(|model\.train\s*\(|trainer\.train\s*\(/i, event: { family: "neuralNetwork", action: "start", label: "Model Training" } },

  // Clustering
  { regex: /KMeans\s*\(|DBSCAN\s*\(|AgglomerativeClustering\s*\(/i, event: { family: "clustering", action: "start", label: "Clustering" } },

  // SVM
  { regex: /SVC\s*\(|SVR\s*\(|LinearSVC\s*\(/i, event: { family: "svm", action: "start", label: "SVM" } },

  // Boosting
  { regex: /GradientBoostingClassifier\s*\(|XGBClassifier\s*\(|LGBMClassifier\s*\(|CatBoostClassifier\s*\(/i, event: { family: "boosting", action: "start", label: "Gradient Boosting" } },

  // PCA
  { regex: /PCA\s*\(|TSNE\s*\(|umap\.UMAP\s*\(/i, event: { family: "dimensionality", action: "start", label: "Dimensionality Reduction" } },
];

/**
 * Scan a string (terminal chunk or source code) against a pattern list.
 * Returns the first matching event, or null.
 */
export function detectInText(text: string, patterns: DetectorPattern[]): AlgorithmEvent | null {
  for (const { regex, event } of patterns) {
    if (regex.test(text)) {
      return event;
    }
  }
  return null;
}
