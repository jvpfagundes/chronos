from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    birth_date: str


class UserCreate(UserBase):
    email: EmailStr
    first_name: str
    last_name: str
    birth_date: str
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    daily_goal: Optional[int] = None
    monthly_goal: Optional[int] = None
    week_days_list: Optional[list[str]] = None
    theme: Optional[str] = None
    language: Optional[str] = None


class User(UserBase):
    id: int
    status: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginSchema(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class OnboardingSchema(BaseModel):
    week_days_list: list[str]
    monthly_goal: int
    daily_goal: int