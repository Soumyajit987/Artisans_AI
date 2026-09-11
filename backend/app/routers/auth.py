from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password
)

from ..database import users_collection

from ..schemas import (
    RegisterRequest,
    TokenResponse,
    UserResponse
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(data: RegisterRequest):

    email = data.email.lower().strip()
    mobile = data.mobile.strip()

    existing_email = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    existing_mobile = users_collection.find_one(
        {
            "mobile": mobile
        }
    )

    if existing_mobile:
        raise HTTPException(
            status_code=400,
            detail="Mobile number already registered."
        )

    user = {
        "name": data.name.strip(),
        "mobile": mobile,
        "email": email,
        "age": data.age,
        "category": data.category,
        "location": data.location.strip(),
        "language": data.language,
        "password_hash": hash_password(data.password),
        "verified": False
    }

    result = users_collection.insert_one(user)

    return {
        "id": str(result.inserted_id),
        "name": user["name"],
        "mobile": user["mobile"],
        "email": user["email"],
        "age": user["age"],
        "category": user["category"],
        "location": user["location"],
        "language": user["language"],
        "verified": user["verified"]
    }


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    login_value = form_data.username.strip()

    user = users_collection.find_one(
        {
            "$or": [
                {
                    "email": login_value.lower()
                },
                {
                    "mobile": login_value
                }
            ]
        }
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/mobile or password"
        )

    valid_password = verify_password(
        form_data.password,
        user["password_hash"]
    )

    if not valid_password:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/mobile or password"
        )

    token = create_access_token(
        str(user["_id"])
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user=Depends(get_current_user)
):

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "mobile": current_user["mobile"],
        "email": current_user["email"],
        "age": current_user["age"],
        "category": current_user["category"],
        "location": current_user["location"],
        "language": current_user["language"],
        "verified": current_user["verified"]
    }