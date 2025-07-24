from sqlalchemy import Column, String, Boolean, Text, Date
from app.db.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    birth_date = Column(Date, nullable=True)
    status = Column(Boolean, default=True, nullable=True)
    is_first_access = Column(Boolean, default=True, nullable=True)
