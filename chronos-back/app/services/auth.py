import json
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.sql_async import SQLQueryAsync
from app.schemas.auth import UserCreate
from app.core.config import settings
from app.services.decorator import Response

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService(SQLQueryAsync):
    def __init__(self):
        super().__init__()
        pass

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        query = """
            SELECT id, 
                   email, 
                   hashed_password, 
                   first_name, 
                   last_name, 
                   status, 
                   birth_date,  
                   created_at, 
                   updated_at,
                   is_first_access,
                   monthly_goal,
                   daily_goal,
                   week_day_list,
                   theme
            FROM users 
            WHERE email = :email AND status = true
        """
        
        result = await self.select(
            query=query,
            parameters={"email": email},
            is_first=True
        )
        
        return result if result else None

    async def get_user_by_id(self, user_id: int) -> Optional[dict]:
        query = """
            SELECT id, email, hashed_password, first_name, last_name, status,  created_at, updated_at
            FROM users 
            WHERE id = :user_id AND status = true
        """
        
        result = await self.select(
            query=query,
            parameters={"user_id": user_id},
            is_first=True
        )
        
        return result if result else None

    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user["hashed_password"]):
            return None
        return user

    @Response(desc_error="Error when creating user.", return_list=[])
    async def register_user(self, user_data: UserCreate) -> dict:
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email já registrado")

        hashed_password = self.get_password_hash(user_data.password)
        user_dict = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "birth_date": datetime.strptime(user_data.birth_date, "%Y-%m-%d").date(),
        }
        
        result = await self.insert(
            table_name="users",
            dict_insert=user_dict,
        )
        
        return result

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[str]:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("email")
            if email is None:
                return None
            return email
        except JWTError:
            return None


    @Response(desc_error="Error when finishing onboarding.", return_list=[])
    async def finish_onboarding(self, monthly_goal, daily_goal, week_day_list, user_id):
        dict_onboarding = {
            "monthly_goal": monthly_goal,
            "daily_goal": daily_goal,
            "week_day_list": json.dumps(week_day_list),
            "is_first_access":False
        }

        await self.update("users", dict_update=dict_onboarding, dict_filter={"id": user_id})

    @Response(desc_error="Error when updating user.", return_list=[])
    async def patch_user(self, first_name, last_name, week_days_list, theme, daily_goal, monthly_goal, user_id):
        dict_user_patch = {
            "first_name": first_name,
            "last_name": last_name,
            "week_day_list": json.dumps(week_days_list),
            "theme": theme,
            "daily_goal": daily_goal,
            "monthly_goal": monthly_goal
        }

        dict_user_patch = {k:v for k, v in dict_user_patch.items() if v not in ('null', None)}

        await self.update("users", dict_update=dict_user_patch, dict_filter={"id": user_id})