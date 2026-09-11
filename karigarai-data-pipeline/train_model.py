import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import r2_score
from xgboost import XGBRegressor
import joblib

# 1. Load dataset
df = pd.read_csv('cleaned_data.csv')

# 2. Separate features (X) and target (y)
X = df.drop(columns=['price'])
y = df['price']

# 3. Categorical encoding
X = pd.get_dummies(X, drop_first=True)

# 4. Log-transform target price for variance stabilization
y_log = np.log1p(y)

# 5. Train-test split
X_train, X_test, y_train_log, y_test_log = train_test_split(
    X, y_log, test_size=0.2, random_state=42
)

# 6. Light parameter search space
param_dist = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.03, 0.05, 0.1],
    'max_depth': [3, 4, 5],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0]
}

# 7. Low-stress XGBoost engine
xgb = XGBRegressor(
    random_state=42,
    objective='reg:squarederror',
    tree_method='hist',
    n_jobs=2  # Caps CPU usage so your laptop doesn't overheat
)

# 8. Lightweight search
random_search = RandomizedSearchCV(
    estimator=xgb,
    param_distributions=param_dist,
    n_iter=6,
    cv=3,
    scoring='r2',
    n_jobs=1,
    random_state=42
)

print("Running cool & lightweight training...")
random_search.fit(X_train, y_train_log)

# 9. Calculate final performance
best_model = random_search.best_estimator_
y_pred_log = best_model.predict(X_test)
y_pred = np.expm1(y_pred_log)
y_test_original = np.expm1(y_test_log)

final_r2 = r2_score(y_test_original, y_pred)

print(f"\nBest Parameters: {random_search.best_params_}")
print(f"Final Real-World Test Set R² Score: {final_r2:.4f}")

# 10. Save model artifact
joblib.dump(best_model, 'pricing_model.pkl')
print("\nModel saved successfully as 'pricing_model.pkl'.")