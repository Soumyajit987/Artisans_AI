from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# =====================================================
# MODEL LOCATION
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / "models" / "pricing_model.pkl"


# =====================================================
# LOAD MODEL ONCE
# =====================================================

try:
    model = joblib.load(MODEL_PATH)
    print("Pricing model loaded successfully.")

except Exception as e:
    raise RuntimeError(
        f"Could not load pricing model from {MODEL_PATH}: {e}"
    )


# =====================================================
# REQUIRED FEATURES
# =====================================================

REQUIRED_FEATURES = [
    "labor_hours",
    "quantity",
    "length",
    "width",
    "height",
    "item_type",
    "material_type",
    "finish_type",
    "urgency_level",
]


# =====================================================
# PRICE PREDICTION
# =====================================================

def predict_price(
    labor_hours: float,
    quantity: int,
    length: float,
    width: float,
    height: float,
    item_type: str,
    material_type: str,
    finish_type: str,
    urgency_level: str,
):
    """
    Predict artisan product price using the trained
    XGBoost pricing model.
    """

    # -------------------------------------------------
    # Prepare input
    # -------------------------------------------------

    input_data = {
        "labor_hours": float(labor_hours),
        "quantity": int(quantity),
        "length": float(length),
        "width": float(width),
        "height": float(height),
        "item_type": item_type.lower().strip(),
        "material_type": material_type.lower().strip(),
        "finish_type": finish_type.lower().strip(),
        "urgency_level": urgency_level.lower().strip(),
    }

    input_df = pd.DataFrame([input_data])


    # -------------------------------------------------
    # One-hot encode categorical columns
    # -------------------------------------------------

    input_encoded = pd.get_dummies(
        input_df,
        drop_first=True
    )


    # -------------------------------------------------
    # Match exactly the features used during training
    # -------------------------------------------------

    for column in model.feature_names_in_:

        if column not in input_encoded.columns:
            input_encoded[column] = 0


    input_encoded = input_encoded[
        model.feature_names_in_
    ]


    # -------------------------------------------------
    # Predict
    # -------------------------------------------------

    log_prediction = model.predict(
        input_encoded
    )[0]


    # Model was trained using log1p(price)
    predicted_price = np.expm1(
        log_prediction
    )


    predicted_price = max(
        0,
        float(predicted_price)
    )


    # -------------------------------------------------
    # Estimated pricing range
    # -------------------------------------------------

    market_min = predicted_price * 0.85
    market_max = predicted_price * 1.15


    return {
        "predicted_price": round(
            predicted_price,
            2
        ),

        "market_min": round(
            market_min,
            2
        ),

        "market_max": round(
            market_max,
            2
        ),

        "currency": "INR"
    }