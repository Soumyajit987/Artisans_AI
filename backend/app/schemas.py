from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    mobile: str = Field(min_length=10, max_length=15)
    email: EmailStr
    age: int = Field(ge=18, le=120)
    category: str = Field(min_length=2, max_length=100)
    location: str = Field(min_length=2, max_length=150)
    language: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    id: str
    name: str
    mobile: str
    email: EmailStr
    age: int
    category: str
    location: str
    language: str
    verified: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str
    description: str = ""
    price: float = Field(gt=0)
    language: str = "English"
    image_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    mobile: str = Field(min_length=10, max_length=15)
    age: int = Field(ge=18, le=120)
    category: str
    location: str
    language: str