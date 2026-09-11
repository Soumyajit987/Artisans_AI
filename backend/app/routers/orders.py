from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..database import orders_collection


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


@router.get("/")
def get_orders(
    current_user=Depends(get_current_user)
):

    orders = orders_collection.find(
        {
            "user_id": current_user["_id"]
        }
    ).sort(
        "created_at",
        -1
    )

    result = []

    for order in orders:

        result.append({
            "id": str(order["_id"]),
            "order_number": order.get(
                "order_number",
                ""
            ),
            "product_name": order.get(
                "product_name",
                ""
            ),
            "amount": order.get(
                "amount",
                0
            ),
            "status": order.get(
                "status",
                "Pending"
            ),
            "created_at": order.get(
                "created_at"
            )
        })

    return result


@router.get("/stats")
def order_stats(
    current_user=Depends(get_current_user)
):

    orders = list(
        orders_collection.find(
            {
                "user_id": current_user["_id"]
            }
        )
    )

    total = len(orders)

    pending = sum(
        1
        for order in orders
        if order.get("status") == "Pending"
    )

    completed = sum(
        1
        for order in orders
        if order.get("status") in [
            "Completed",
            "Delivered"
        ]
    )

    revenue = sum(
        float(order.get("amount", 0))
        for order in orders
    )

    return {
        "total_orders": total,
        "pending": pending,
        "completed": completed,
        "total_revenue": revenue
    }