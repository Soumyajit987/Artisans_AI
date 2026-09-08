import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_excel("Artisian_Product_Dataset (3).xlsx")

print("Dataset shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

#Features
X = df[[
    "Material_caost_INR",
    "Labour_Hours",
    "Product_days",
    "Complexity",
    "Demand_Score"
]]
#Target
y = df["Price_INR"]

# Split data into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining rows:", len(X_train))
print("Testing rows:", len(X_test))

# Create Random Forest model
rf_model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train
rf_model.fit(X_train, y_train)

# Predict
rf_predictions = rf_model.predict(X_test)

# Evaluate
rf_mae = mean_absolute_error(y_test, rf_predictions)
print("\nRandom Forest MAE:", rf_mae)

print("\nFeature Importance:")
for feature, importance in zip(X.columns, rf_model.feature_importances_):
    print(feature, ":", importance)

joblib.dump(rf_model, "pricing_model.pkl")
print("\nModel saved successfully!")