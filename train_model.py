import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor
)

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# Load dataset

FILE = "Artisian_Product_Dataset (3).xlsx"

print("\nKarigarAI - AI Dynamic Pricing Model")
print("Loading dataset...")

df = pd.read_excel(FILE)

print(f"Dataset loaded: {len(df)} records, {len(df.columns)} columns")


# Clean dataset

df = df.dropna(how="all")

duplicates = df.duplicated().sum()
df = df.drop_duplicates()

print(f"Duplicate rows removed: {duplicates}")

categorical_columns = [
    "Category",
    "Material",
    "State",
    "District",
    "Craft_Type"
]

for col in categorical_columns:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip()

TARGET = "Price_INR"

before = len(df)
df = df.dropna(subset=[TARGET])

print(f"Rows with missing price removed: {before - len(df)}")
print(f"Final dataset size: {len(df)} records")


# Features

NUMERICAL_FEATURES = [
    "Material_caost_INR",
    "Labour_Hours",
    "Product_days",
    "Complexity",
    "Demand_Score"
]

CATEGORICAL_FEATURES = [
    "Category",
    "Material",
    "State",
    "District",
    "Craft_Type"
]

NUMERICAL_FEATURES = [
    col for col in NUMERICAL_FEATURES if col in df.columns
]

CATEGORICAL_FEATURES = [
    col for col in CATEGORICAL_FEATURES if col in df.columns
]

FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

X = df[FEATURES]
y = df[TARGET]

print("\nFeatures used:")
for feature in FEATURES:
    print(f"  {feature}")

print(f"Target: {TARGET}")


# Train/test split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print(f"\nTraining records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")


# Preprocessing

numeric_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False
        ))
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, NUMERICAL_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES)
    ]
)


# Models

models = {
    "Linear Regression": LinearRegression(),

    "Ridge Regression": Ridge(alpha=10.0),

    "Random Forest": RandomForestRegressor(
        n_estimators=300,
        min_samples_leaf=2,
        random_state=42
    ),

    "Extra Trees": ExtraTreesRegressor(
        n_estimators=300,
        min_samples_leaf=2,
        random_state=42
    ),

    "Gradient Boosting": GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=2,
        random_state=42
    )
}


# Train and compare models

print("\nTraining and comparing models...\n")

results = []
trained_models = {}

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

for name, model in models.items():

    print(f"Training: {name}")

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)

    rmse = np.sqrt(
        mean_squared_error(y_test, predictions)
    )

    r2 = r2_score(y_test, predictions)

    cv_scores = cross_val_score(
        pipeline,
        X_train,
        y_train,
        cv=kf,
        scoring="neg_mean_absolute_error"
    )

    cv_mae = -cv_scores.mean()

    actual = np.array(y_test)
    predicted = np.array(predictions)

    non_zero = actual != 0

    mape = np.mean(
        np.abs(
            (actual[non_zero] - predicted[non_zero])
            / actual[non_zero]
        )
    ) * 100

    print(
        f"  CV MAE: ₹{cv_mae:,.2f} | "
        f"Test MAE: ₹{mae:,.2f} | "
        f"RMSE: ₹{rmse:,.2f} | "
        f"MAPE: {mape:.2f}% | "
        f"R²: {r2:.4f}"
    )

    results.append({
        "Model": name,
        "CV_MAE": cv_mae,
        "Test_MAE": mae,
        "RMSE": rmse,
        "MAPE_%": mape,
        "R2": r2
    })

    trained_models[name] = pipeline


# Comparison table

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="Test_MAE",
    ascending=True
)

print("\nModel comparison:")
print()

print(
    results_df.to_string(
        index=False,
        formatters={
            "CV_MAE": "₹{:,.2f}".format,
            "Test_MAE": "₹{:,.2f}".format,
            "RMSE": "₹{:,.2f}".format,
            "MAPE_%": "{:.2f}%".format,
            "R2": "{:.4f}".format
        }
    )
)


# Select best model

best_model_name = results_df.iloc[0]["Model"]
best_model = trained_models[best_model_name]

best_mae = results_df.iloc[0]["Test_MAE"]
best_rmse = results_df.iloc[0]["RMSE"]
best_mape = results_df.iloc[0]["MAPE_%"]
best_r2 = results_df.iloc[0]["R2"]

print("\nBest model:")
print(f"  Model: {best_model_name}")
print(f"  Test MAE: ₹{best_mae:,.2f}")
print(f"  RMSE: ₹{best_rmse:,.2f}")
print(f"  MAPE: {best_mape:.2f}%")
print(f"  R²: {best_r2:.4f}")


# Save model and comparison

joblib.dump(best_model, "pricing_model.pkl")

results_df.to_csv(
    "model_comparison.csv",
    index=False
)

print("\nSaved:")
print("  pricing_model.pkl")
print("  model_comparison.csv")

print(f"\nKarigarAI pricing model selected: {best_model_name}")
print(f"Average prediction error: ₹{best_mae:,.2f}")
print("Training completed.")