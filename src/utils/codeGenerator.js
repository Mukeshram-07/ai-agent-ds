/**
 * codeGenerator.js
 * Generates Python code sections for the data science pipeline.
 */

export class GenerationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GenerationError'
  }
}

const SECTION_LABELS = [
  'Data Loading',
  'Preprocessing Steps',
  'Model Training',
  'Prediction',
  'Data Visualization',
]

/**
 * Generate the Data Loading section.
 */
function generateDataLoading(dataset) {
  if (!dataset) {
    return `# Data Loading
# Replace 'your_dataset.csv' with your actual file path
import pandas as pd

# Load your dataset
df = pd.read_csv('your_dataset.csv')  # or pd.read_excel('your_dataset.xlsx')

# Preview the data
print(df.head())
print(f"Shape: {df.shape}")
print(df.dtypes)
`
  }

  const isExcel = dataset.name?.includes('.xlsx') || dataset.name?.includes('.xls')
  const filename = dataset.name || 'dataset'
  const colList = dataset.columns?.map((c) => `'${c.name}'`).join(', ') || ''

  return `# Data Loading
import pandas as pd
import numpy as np

# Load dataset: ${filename}
${isExcel ? `df = pd.read_excel('${filename}.xlsx')` : `df = pd.read_csv('${filename}.csv')`}

# Dataset overview
print(f"Shape: {df.shape}")  # (${dataset.rowCount}, ${dataset.colCount})
print("\\nColumns:", [${colList}])
print("\\nData types:")
print(df.dtypes)
print("\\nFirst 5 rows:")
print(df.head())
print("\\nMissing values:")
print(df.isnull().sum())
`
}

/**
 * Generate the Preprocessing Steps section.
 */
function generatePreprocessing(dataset, cleaningSteps) {
  if (!dataset && (!cleaningSteps || cleaningSteps.length === 0)) {
    return `# Preprocessing Steps
# Add your preprocessing steps here
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.impute import SimpleImputer

# Example: Handle missing values
# df.dropna(inplace=True)
# df['column'].fillna(df['column'].median(), inplace=True)

# Example: Encode categorical variables
# le = LabelEncoder()
# df['category_col'] = le.fit_transform(df['category_col'])

# Example: Scale numeric features
# scaler = StandardScaler()
# df[['numeric_col']] = scaler.fit_transform(df[['numeric_col']])
`
  }

  const steps = cleaningSteps || []
  const imports = new Set([
    'import pandas as pd',
    'import numpy as np',
  ])

  const stepCodes = []

  for (const step of steps) {
    switch (step.operation) {
      case 'remove_nulls':
        if (step.column) {
          stepCodes.push(`# Remove rows with null values in '${step.column}'
df = df.dropna(subset=['${step.column}'])`)
        } else {
          stepCodes.push(`# Remove all rows with any null values
df = df.dropna()`)
        }
        break

      case 'fill_missing':
        imports.add('from sklearn.impute import SimpleImputer')
        stepCodes.push(`# Fill missing values in '${step.column}' with median
df['${step.column}'] = df['${step.column}'].fillna(df['${step.column}'].median())`)
        break

      case 'standardize':
        imports.add('from sklearn.preprocessing import StandardScaler')
        stepCodes.push(`# Standardize '${step.column}' (zero mean, unit variance)
scaler_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')} = StandardScaler()
df[['${step.column}']] = scaler_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')}.fit_transform(df[['${step.column}']])`)
        break

      case 'normalize':
        imports.add('from sklearn.preprocessing import MinMaxScaler')
        stepCodes.push(`# Normalize '${step.column}' to [0, 1] range
scaler_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')} = MinMaxScaler()
df[['${step.column}']] = scaler_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')}.fit_transform(df[['${step.column}']])`)
        break

      case 'label_encode':
        imports.add('from sklearn.preprocessing import LabelEncoder')
        stepCodes.push(`# Label encode '${step.column}'
le_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')} = LabelEncoder()
df['${step.column}'] = le_${step.column?.replace(/[^a-zA-Z0-9]/g, '_')}.fit_transform(df['${step.column}'].astype(str))`)
        break

      case 'one_hot_encode':
        stepCodes.push(`# One-hot encode '${step.column}'
df = pd.get_dummies(df, columns=['${step.column}'], prefix='${step.column}')`)
        break

      default:
        break
    }
  }

  const importBlock = [...imports].join('\n')
  const stepsBlock = stepCodes.length > 0
    ? stepCodes.join('\n\n')
    : '# No cleaning steps applied yet\n# Add preprocessing steps as needed'

  return `# Preprocessing Steps
${importBlock}

${stepsBlock}

# Verify preprocessing
print("\\nAfter preprocessing:")
print(f"Shape: {df.shape}")
print(df.isnull().sum())
`
}

/**
 * Generate the Model Training section.
 */
function generateModelTraining(dataset, selectedModel) {
  const targetCol = dataset?.columns?.[dataset.columns.length - 1]?.name || 'target'
  const featureCols = dataset?.columns?.slice(0, -1).map((c) => `'${c.name}'`).join(', ') || "'feature1', 'feature2'"

  if (!selectedModel) {
    return `# Model Training
# Select a model from the Recommendation page first
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression  # Replace with your chosen model
from sklearn.metrics import accuracy_score, classification_report

# Define features and target
X = df[[${featureCols}]]
y = df['${targetCol}']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model (replace with your chosen model)
model = LinearRegression()
model.fit(X_train, y_train)

print("Model training complete!")
`
  }

  const modelImports = {
    'Linear Regression': 'from sklearn.linear_model import LinearRegression',
    'Random Forest Regressor': 'from sklearn.ensemble import RandomForestRegressor',
    'XGBoost Regressor': 'from xgboost import XGBRegressor',
    'Logistic Regression': 'from sklearn.linear_model import LogisticRegression',
    'Random Forest Classifier': 'from sklearn.ensemble import RandomForestClassifier',
    'Decision Tree': 'from sklearn.tree import DecisionTreeClassifier',
    'Support Vector Machine': 'from sklearn.svm import SVC',
    'K-Means Clustering': 'from sklearn.cluster import KMeans',
    'DBSCAN': 'from sklearn.cluster import DBSCAN',
    'Hierarchical Clustering': 'from sklearn.cluster import AgglomerativeClustering',
  }

  const modelClasses = {
    'Linear Regression': 'LinearRegression()',
    'Random Forest Regressor': 'RandomForestRegressor(n_estimators=100, random_state=42)',
    'XGBoost Regressor': 'XGBRegressor(n_estimators=100, random_state=42)',
    'Logistic Regression': 'LogisticRegression(max_iter=1000, random_state=42)',
    'Random Forest Classifier': 'RandomForestClassifier(n_estimators=100, random_state=42)',
    'Decision Tree': 'DecisionTreeClassifier(random_state=42)',
    'Support Vector Machine': 'SVC(kernel="rbf", random_state=42)',
    'K-Means Clustering': 'KMeans(n_clusters=3, random_state=42)',
    'DBSCAN': 'DBSCAN(eps=0.5, min_samples=5)',
    'Hierarchical Clustering': 'AgglomerativeClustering(n_clusters=3)',
  }

  const modelImport = modelImports[selectedModel.name] || `from sklearn.linear_model import LinearRegression`
  const modelClass = modelClasses[selectedModel.name] || 'LinearRegression()'
  const isClustering = selectedModel.type === 'clustering'

  return `# Model Training
from sklearn.model_selection import train_test_split
${modelImport}
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report

# Define features and target
X = df[[${featureCols}]]
${isClustering ? '' : `y = df['${targetCol}']`}

${isClustering
  ? `# Clustering: no train/test split needed
model = ${modelClass}
labels = model.fit_predict(X)
df['cluster'] = labels
print(f"Cluster distribution:\\n{pd.Series(labels).value_counts()}")`
  : `# Split data into train/test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train ${selectedModel.name}
model = ${modelClass}
model.fit(X_train, y_train)

print(f"Training complete!")
print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")`}
`
}

/**
 * Generate the Prediction section.
 */
function generatePrediction(dataset, selectedModel) {
  const targetCol = dataset?.columns?.[dataset.columns.length - 1]?.name || 'target'
  const isClustering = selectedModel?.type === 'clustering'
  const isRegression = selectedModel?.type === 'regression'

  if (isClustering) {
    return `# Prediction (Clustering)
# Predict cluster for new data points
import numpy as np

# Example: predict cluster for a new sample
# new_sample = np.array([[value1, value2, ...]])
# cluster = model.predict(new_sample)
# print(f"Predicted cluster: {cluster[0]}")

# Evaluate clustering quality
from sklearn.metrics import silhouette_score
if len(set(labels)) > 1:
    score = silhouette_score(X, labels)
    print(f"Silhouette Score: {score:.4f}")
`
  }

  if (isRegression) {
    return `# Prediction
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

# Generate predictions
y_pred = model.predict(X_test)

# Regression metrics
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.4f}")
print(f"Root Mean Squared Error: {rmse:.4f}")
print(f"Mean Absolute Error: {mae:.4f}")
print(f"R² Score: {r2:.4f}")

# Predict on new data
# new_data = pd.DataFrame({...})
# predictions = model.predict(new_data)
`
  }

  return `# Prediction
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

# Generate predictions
y_pred = model.predict(X_test)

# Classification metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

print(f"Accuracy:  {accuracy:.4f}  (${selectedModel ? (selectedModel.accuracy * 100).toFixed(1) : '?'}% simulated)")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1 Score:  {f1:.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
`
}

/**
 * Generate the Data Visualization section.
 */
function generateVisualization(dataset, selectedModel) {
  const numericCols = dataset?.columns?.filter((c) => c.dtype === 'numeric').map((c) => `'${c.name}'`) || []
  const firstNumCol = numericCols[0] || "'feature'"
  const secondNumCol = numericCols[1] || "'target'"
  const targetCol = dataset?.columns?.[dataset.columns.length - 1]?.name || 'target'

  return `# Data Visualization
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('${dataset?.name || "Dataset"} - Analysis Dashboard', fontsize=16, fontweight='bold')

# 1. Feature Distribution
ax1 = axes[0, 0]
if ${firstNumCol} in df.columns:
    df[${firstNumCol}].hist(bins=30, ax=ax1, color='#6366f1', alpha=0.7, edgecolor='white')
    ax1.set_title(f'Distribution of {${firstNumCol}}')
    ax1.set_xlabel(${firstNumCol})
    ax1.set_ylabel('Frequency')

# 2. Correlation Heatmap
ax2 = axes[0, 1]
numeric_df = df.select_dtypes(include=[np.number])
if not numeric_df.empty:
    corr_matrix = numeric_df.corr()
    sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
                ax=ax2, square=True, linewidths=0.5)
    ax2.set_title('Correlation Heatmap')

# 3. Box Plot
ax3 = axes[1, 0]
if ${firstNumCol} in df.columns:
    df.boxplot(column=${firstNumCol}, ax=ax3)
    ax3.set_title(f'Box Plot: {${firstNumCol}}')

# 4. Feature Importance / Scatter
ax4 = axes[1, 1]
${numericCols.length >= 2
  ? `if ${firstNumCol} in df.columns and ${secondNumCol} in df.columns:
    ax4.scatter(df[${firstNumCol}], df[${secondNumCol}], alpha=0.5, color='#8b5cf6')
    ax4.set_xlabel(${firstNumCol})
    ax4.set_ylabel(${secondNumCol})
    ax4.set_title(f'Scatter: {${firstNumCol}} vs {${secondNumCol}}')`
  : `# Add your custom visualization here
ax4.text(0.5, 0.5, 'Custom Plot', ha='center', va='center', transform=ax4.transAxes)`}

plt.tight_layout()
plt.savefig('${dataset?.name || "dataset"}_analysis.png', dpi=150, bbox_inches='tight')
plt.show()
print("Visualization saved as '${dataset?.name || "dataset"}_analysis.png'")
`
}

/**
 * Generate all 5 code sections.
 * @param {AppState} appState
 * @returns {Array<{label: string, code: string}>}
 */
export function generate(appState) {
  try {
    const { dataset, cleaningSteps, selectedModel } = appState || {}

    const sections = [
      {
        label: SECTION_LABELS[0],
        code: generateDataLoading(dataset),
      },
      {
        label: SECTION_LABELS[1],
        code: generatePreprocessing(dataset, cleaningSteps),
      },
      {
        label: SECTION_LABELS[2],
        code: generateModelTraining(dataset, selectedModel),
      },
      {
        label: SECTION_LABELS[3],
        code: generatePrediction(dataset, selectedModel),
      },
      {
        label: SECTION_LABELS[4],
        code: generateVisualization(dataset, selectedModel),
      },
    ]

    // Validate all sections have non-empty code
    for (const section of sections) {
      if (!section.code || section.code.trim() === '') {
        throw new GenerationError(`Failed to generate code for section: ${section.label}`)
      }
    }

    return sections
  } catch (err) {
    if (err instanceof GenerationError) throw err
    throw new GenerationError(`Code generation failed: ${err.message}`)
  }
}

export const LABELS = SECTION_LABELS

export default { generate, LABELS }
