from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# Load trained pricing model
model = joblib.load("pricing_model.pkl")


@app.get("/")
def home():
    return {"message": "KarigarAI Pricing API is running"}


@app.post("/predict-price")
def predict_price(data: dict):

    input_data = pd.DataFrame([{
        "Material_caost_INR": data["Material_caost_INR"],
        "Labour_Hours": data["Labour_Hours"],
        "Product_days": data["Product_days"],
        "Complexity": data["Complexity"],
        "Demand_Score": data["Demand_Score"]
    }])

    prediction = model.predict(input_data)[0]

    return {
        "recommended_price": round(float(prediction), 2)
    }
