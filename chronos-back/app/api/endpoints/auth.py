from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user
from app.schemas.auth import Token, UserCreate, User, LoginSchema, OnboardingSchema, UserUpdate
from app.services.auth import AuthService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post("/register")
async def register(
    user_data: UserCreate):
    try:
        auth_service = AuthService()

        response = await auth_service.register_user(user_data)

        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login(
    form_data: LoginSchema):
    auth_service = AuthService()
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorret Credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(data={
        "email": user["email"],
        "birth_date": str(user["birth_date"]),
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "is_first_access": user["is_first_access"],
        "monthly_goal": user["monthly_goal"],
        "daily_goal": user["daily_goal"],
        "week_days_list":user["week_day_list"],
        "theme": user["theme"],

    })
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/onboarding")
async def onboarding(
    onboarding_data: OnboardingSchema,
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.get('id')

    response = await AuthService().finish_onboarding(user_id=user_id, monthly_goal=onboarding_data.monthly_goal,
                                                     daily_goal=onboarding_data.daily_goal,
                                                     week_day_list=onboarding_data.week_days_list)

    return JSONResponse(content=response, status_code=response['status_code'])


@router.patch("/user")
async def patch_user(
        user_data: UserUpdate,
        current_user: User = Depends(get_current_user)
):
    user_id = current_user.get('id')

    response = await AuthService().patch_user(first_name=user_data.first_name, last_name=user_data.last_name,
                                              monthly_goal=user_data.monthly_goal, daily_goal=user_data.daily_goal,
                                              theme=user_data.theme, user_id=user_id, week_days_list=user_data.week_days_list)

    return JSONResponse(content=response, status_code=response['status_code'])