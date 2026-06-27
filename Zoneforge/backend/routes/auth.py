from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models.user import User
from schemas.auth import LoginRequest, LoginResponse, UserResponse
from dependencies import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="", tags=["Authentication"])

@router.post("/api/auth/login", response_model=LoginResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_session)):
    try:
        user = db.exec(select(User).where(User.username == login_req.username)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        if not verify_password(login_req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        token = create_access_token(data={"sub": user.username})
        return LoginResponse(
            access_token=token,
            token_type="bearer",
            username=user.username
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/api/auth/logout")
def logout(current_user: User = Depends(get_current_user)):
    try:
        return { "message": "Logged out successfully", "username": current_user.username }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    try:
        return current_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

