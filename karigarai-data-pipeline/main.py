from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

app = FastAPI(title="KARIGARAI Pricing & AI Service")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load('pricing_model.pkl')
except Exception as e:
    raise RuntimeError(f"Could not load pricing_model.pkl: {str(e)}")

class PricingRequest(BaseModel):
    labor_hours: float
    quantity: int
    length: float
    width: float
    height: float
    item_type: str
    material_type: str
    finish_type: str
    urgency_level: str

@app.get("/")
def home():
    return {"status": "active", "module": "KARIGARAI Pricing AI"}

@app.post("/predict")
def predict_price(data: PricingRequest):
    try:
        input_df = pd.DataFrame([data.model_dump()])
        input_encoded = pd.get_dummies(input_df, drop_first=True)
        
        # Align columns with model expectations
        for col in model.feature_names_in_:
            if col not in input_encoded.columns:
                input_encoded[col] = 0
        input_encoded = input_encoded[model.feature_names_in_]

        log_pred = model.predict(input_encoded)[0]
        final_price = float(np.expm1(log_pred))

        return {
            "predicted_price": round(final_price, 2),
            "currency": "INR"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))