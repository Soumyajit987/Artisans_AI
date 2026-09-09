from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(
    title="KarigarAI Dynamic Pricing API",
    description="AI-powered pricing recommendation service for artisans"
)

# Load trained pricing model
model = joblib.load("pricing_model.pkl")

# Based on the model's held-out test MAE
MODEL_MAE = 330.21


class ProductData(BaseModel):
    Material_caost_INR: float
    Labour_Hours: float
    Product_days: float
    Complexity: float
    Demand_Score: float

    Category: str
    Material: str
    State: str
    District: str
    Craft_Type: str


@app.get("/")
def home():
    return {
        "message": "KarigarAI Pricing API is running",
        "model": "Gradient Boosting",
        "test_mae": MODEL_MAE
    }


@app.post("/predict-price")
def predict_price(data: ProductData):

    input_data = pd.DataFrame([{
        "Material_caost_INR": data.Material_caost_INR,
        "Labour_Hours": data.Labour_Hours,
        "Product_days": data.Product_days,
        "Complexity": data.Complexity,
        "Demand_Score": data.Demand_Score,
        "Category": data.Category,
        "Material": data.Material,
        "State": data.State,
        "District": data.District,
        "Craft_Type": data.Craft_Type
    }])

    prediction = float(model.predict(input_data)[0])

    # Estimated prototype error band based on test MAE
    lower_price = max(0, prediction - MODEL_MAE)
    upper_price = prediction + MODEL_MAE

    return {
        "recommended_price": round(prediction, 2),

        "estimated_price_range": {
            "lower": round(lower_price, 2),
            "upper": round(upper_price, 2)
        },

        "estimated_error": f"±₹{MODEL_MAE:.2f}",

        "pricing_factors": {
            "material_cost": f"₹{data.Material_caost_INR:.2f}",
            "labour_hours": data.Labour_Hours,
            "production_days": data.Product_days,
            "complexity": f"{data.Complexity}/5",
            "demand_score": f"{data.Demand_Score}/10"
        },

        "product_details": {
            "category": data.Category,
            "material": data.Material,
            "state": data.State,
            "district": data.District,
            "craft_type": data.Craft_Type
        },

        "model_note": (
            "Price recommendation generated using the KarigarAI "
            "Gradient Boosting pricing model. "
            "The error band is based on held-out test MAE and "
            "is not a guaranteed confidence interval."
        )
    }