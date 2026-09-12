from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..pricing_ai import predict_price


router = APIRouter(
    prefix="/api/pricing",
    tags=["Pricing AI"]
)


@router.post("/predict")
def pricing_prediction(
    data: dict,
    current_user=Depends(get_current_user)
):

    result = predict_price(
        labor_hours=data["labor_hours"],
        quantity=data["quantity"],
        length=data["length"],
        width=data["width"],
        height=data["height"],
        item_type=data["item_type"],
        material_type=data["material_type"],
        finish_type=data["finish_type"],
        urgency_level=data["urgency_level"]
    )

    return result