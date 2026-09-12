from fastapi import APIRouter, HTTPException, Depends
from auth import get_current_user, users_collection
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime, timezone
import os

load_dotenv()

router = APIRouter(prefix="/tasks", tags=["Tasks"])

from db import tasks_collection, users_collection


# =========================================================
# XP / LEVEL SYSTEM
# =========================================================

def calculate_level(xp: int):
    level = 1

    while xp >= 100 * (level ** 2):
        level += 1

    current_level_xp = 100 * ((level - 1) ** 2)
    next_level_xp = 100 * (level ** 2)

    return {
        "level": level,
        "current_level_xp": current_level_xp,
        "next_level_xp": next_level_xp
    }


# =========================================================
# ATTRIBUTE SYSTEM
# =========================================================

def get_attribute_for_category(category: str):
    category_map = {
        "health": "health",
        "gym": "strength",
        "fitness": "strength",
        "coding": "knowledge",
        "study": "knowledge",
        "learning": "knowledge",
        "focus": "focus",
        "discipline": "discipline"
    }

    return category_map.get(
        category.lower(),
        "discipline"
    )


from typing import Optional
import time

# =========================================================
# TASK MODEL
# =========================================================

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    category: str
    xp_reward: int = 10
    target_time: Optional[float] = None
    duration_mins: Optional[int] = 60
    created_at: Optional[float] = None


# =========================================================
# CREATE TASK
# =========================================================

@router.post("/")
def create_task(
    task: TaskCreate,
    current_user: dict = Depends(get_current_user)
):
    if not task.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Task title cannot be empty"
        )

    if task.xp_reward <= 0:
        raise HTTPException(
            status_code=400,
            detail="XP reward must be greater than 0"
        )

    now_ts = time.time() * 1000
    created_ts = task.created_at or now_ts
    target_ts = task.target_time or (created_ts + (task.duration_mins or 60) * 60 * 1000)

    new_task = {
        "user_id": str(current_user["_id"]),
        "title": task.title.strip(),
        "description": task.description,
        "category": task.category.lower(),
        "xp_reward": task.xp_reward,
        "target_time": target_ts,
        "duration_mins": task.duration_mins or 60,
        "created_at": created_ts,
        "completed": False
    }

    result = tasks_collection.insert_one(new_task)

    return {
        "message": "Task created successfully",
        "task_id": str(result.inserted_id),
        "task": {
            "id": str(result.inserted_id),
            "title": new_task["title"],
            "description": new_task["description"],
            "category": new_task["category"],
            "xp_reward": new_task["xp_reward"],
            "target_time": new_task["target_time"],
            "duration_mins": new_task["duration_mins"],
            "created_at": new_task["created_at"],
            "completed": False
        }
    }


# =========================================================
# GET USER TASKS
# =========================================================

@router.get("/")
def get_tasks(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    tasks = list(
        tasks_collection.find({
            "user_id": user_id
        })
    )

    result = []

    for task in tasks:
        result.append({
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task["description"],
            "category": task["category"],
            "xp_reward": task["xp_reward"],
            "target_time": task.get("target_time", None),
            "duration_mins": task.get("duration_mins", 60),
            "created_at": task.get("created_at", None),
            "completed": task.get("completed", False)
        })

    return {
        "tasks": result
    }


# =========================================================
# UPDATE TASK
# =========================================================

@router.put("/{task_id}")
def update_task(
    task_id: str,
    task: TaskCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        if not task.title.strip():
            raise HTTPException(
                status_code=400,
                detail="Task title cannot be empty"
            )

        if task.xp_reward <= 0:
            raise HTTPException(
                status_code=400,
                detail="XP reward must be greater than 0"
            )

        result = tasks_collection.update_one(
            {
                "_id": ObjectId(task_id),
                "user_id": str(current_user["_id"])
            },
            {
                "$set": {
                    "title": task.title.strip(),
                    "description": task.description,
                    "category": task.category.lower(),
                    "xp_reward": task.xp_reward
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return {
            "message": "Task updated successfully"
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID"
        )


# =========================================================
# DELETE TASK
# =========================================================

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = tasks_collection.delete_one(
            {
                "_id": ObjectId(task_id),
                "user_id": str(current_user["_id"])
            }
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return {
            "message": "Task deleted successfully"
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID"
        )


# =========================================================
# COMPLETE TASK
# =========================================================

@router.patch("/{task_id}/complete")
def complete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        task = tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": str(current_user["_id"])
        })

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        if task.get("completed", False):
            raise HTTPException(
                status_code=400,
                detail="Task is already completed"
            )

        # Complete task
        tasks_collection.update_one(
            {
                "_id": ObjectId(task_id),
                "user_id": str(current_user["_id"])
            },
            {
                "$set": {
                    "completed": True
                }
            }
        )

        # XP
        xp_reward = task["xp_reward"]
        old_xp = current_user.get("xp", 0)
        new_xp = old_xp + xp_reward

        level_info = calculate_level(new_xp)

        old_level = current_user.get("level", 1)
        new_level = level_info["level"]
        level_up = new_level > old_level

        # Attribute
        attribute = get_attribute_for_category(
            task["category"]
        )

        attributes = current_user.get(
            "attributes",
            {
                "health": 0,
                "strength": 0,
                "focus": 0,
                "discipline": 0,
                "knowledge": 0
            }
        )

        new_attribute_value = attributes.get(attribute, 0) + 1

        # Coins
        coins_earned = 10
        old_coins = current_user.get("coins", 0)
        new_coins = old_coins + coins_earned

        # Streak
        today = datetime.now(timezone.utc).date()
        last_activity = current_user.get("last_activity_date")

        streak = current_user.get("streak", 0)

        if last_activity:
            try:
                last_date = datetime.fromisoformat(
                    last_activity
                ).date()

                difference = (today - last_date).days

                if difference == 1:
                    streak += 1
                elif difference > 1:
                    streak = 1

            except ValueError:
                streak = 1
        else:
            streak = 1

        # Save everything
        users_collection.update_one(
            {
                "_id": current_user["_id"]
            },
            {
                "$set": {
                    "xp": new_xp,
                    "level": new_level,
                    "coins": new_coins,
                    "streak": streak,
                    "last_activity_date": today.isoformat(),
                    f"attributes.{attribute}": new_attribute_value
                }
            }
        )

        return {
            "message": "Task completed successfully",
            "xp_earned": xp_reward,
            "total_xp": new_xp,
            "level": new_level,
            "level_up": level_up,
            "coins_earned": coins_earned,
            "total_coins": new_coins,
            "streak": streak,
            "attribute": attribute,
            "attribute_gained": 1,
            "attribute_value": new_attribute_value,
            "current_level_xp": level_info["current_level_xp"],
            "next_level_xp": level_info["next_level_xp"]
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID"
        )