import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error

# Load data and model
df = pd.read_csv('cleaned_data.csv')
model = joblib.load('pricing_model.pkl')

X = df.drop(columns=['price'])
y = df['price']
X = pd.get_dummies(X, drop_first=True)

# Align columns
for col in model.feature_names_in_:
    if col not in X.columns:
        X[col] = 0
X = X[model.feature_names_in_]

# Split and predict on test set
_, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
preds = np.expm1(model.predict(X_test))

# Calculate MAPE (e.g., 0.10 means 10% average error)
mape = mean_absolute_percentage_error(y_test, preds)
print(f"Model Average Percentage Error (MAPE): {mape * 100:.2f}%")