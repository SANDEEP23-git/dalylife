from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from pymongo import MongoClient
from dotenv import load_dotenv
from jose import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

from db import users_collection
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES", "60")
)


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@router.post("/signup")
def signup(user: SignupRequest):

    # Check existing user
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Create user
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "xp": 0,
        "level": 1,
        "coins": 0,
        "streak": 0,
        "attributes": {
            "health": 0,
            "strength": 0,
            "focus": 0,
            "discipline": 0,
            "knowledge": 0
        }
    }

    users_collection.insert_one(new_user)

    return {
        "message": "Account created successfully"
    }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(user: LoginRequest):

    # Find user
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not pwd_context.verify(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

        # Create JWT token
    token_data = {
        "sub": str(existing_user["_id"]),
        "email": existing_user["email"],
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }

    access_token = jwt.encode(
        token_data,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"],
            "xp": existing_user.get("xp", 0),
            "level": existing_user.get("level", 1),
            "coins": existing_user.get("coins", 0),
            "streak": existing_user.get("streak", 0),
            "profile_photo": existing_user.get("profile_photo", None),
            "unlocked_rewards": existing_user.get("unlocked_rewards", []),
            "attributes": existing_user.get("attributes", {
                "health": 0,
                "strength": 0,
                "focus": 0,
                "discipline": 0,
                "knowledge": 0
            })
        }
    }
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = users_collection.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "id": str(current_user["_id"]),
            "name": current_user.get("name", "Player"),
            "email": current_user.get("email", ""),
            "xp": current_user.get("xp", 0),
            "level": current_user.get("level", 1),
            "coins": current_user.get("coins", 0),
            "streak": current_user.get("streak", 0),
            "profile_photo": current_user.get("profile_photo", None),
            "unlocked_rewards": current_user.get("unlocked_rewards", []),
            "attributes": current_user.get("attributes", {
                "health": 0,
                "strength": 0,
                "focus": 0,
                "discipline": 0,
                "knowledge": 0
            })
        }
    }


class ProfilePhotoRequest(BaseModel):
    profile_photo: str


@router.patch("/profile-photo")
@router.put("/profile-photo")
def update_profile_photo(
    data: ProfilePhotoRequest,
    current_user: dict = Depends(get_current_user)
):
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile_photo": data.profile_photo}}
    )
    return {
        "message": "Profile photo updated successfully",
        "profile_photo": data.profile_photo
    }


class BuyRewardRequest(BaseModel):
    reward_id: str
    cost: int


def _calculate_level(xp: int):
    level = 1
    while xp >= 100 * (level ** 2):
        level += 1
    return level


@router.post("/buy-reward")
def buy_reward(
    data: BuyRewardRequest,
    current_user: dict = Depends(get_current_user)
):
    current_xp = current_user.get("xp", 0)
    if current_xp < data.cost:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough XP. You need {data.cost} XP, but currently have {current_xp} XP."
        )

    unlocked = current_user.get("unlocked_rewards", [])
    if data.reward_id in unlocked:
        return {
            "message": "Reward is already unlocked",
            "xp": current_xp,
            "level": current_user.get("level", 1),
            "unlocked_rewards": unlocked
        }

    new_xp = current_xp - data.cost
    new_level = _calculate_level(new_xp)
    new_unlocked = unlocked + [data.reward_id]

    users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "xp": new_xp,
                "level": new_level,
                "unlocked_rewards": new_unlocked
            }
        }
    )

    return {
        "message": "Reward unlocked successfully!",
        "xp": new_xp,
        "level": new_level,
        "unlocked_rewards": new_unlocked
    }