from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="UBUNTOO API", description="Réseau social de l'altérité et de l'action")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
SECRET_KEY = "ubuntoo-secret-key-change-in-production"
ALGORITHM = "HS256"

# Enums
class PostType(str, Enum):
    IDEA = "idea"
    ACTION = "action"
    TESTIMONY = "testimony"
    CHALLENGE = "challenge"
    SUCCESS = "success"

class BadgeType(str, Enum):
    EMPATHY = "empathy"
    LEADERSHIP = "leadership"
    RESILIENCE = "resilience"
    CREATIVITY = "creativity"
    COMMUNICATION = "communication"
    COLLABORATION = "collaboration"
    INNOVATION = "innovation"

class BadgeStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = ""
    job_title: Optional[str] = ""
    location: Optional[str] = ""
    profile_image: Optional[str] = ""
    soft_skills: List[str] = []
    personal_values: List[str] = []
    engagements: List[str] = []
    badges: List[str] = []
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    bio: Optional[str] = ""
    job_title: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    soft_skills: Optional[List[str]] = None
    personal_values: Optional[List[str]] = None
    engagements: Optional[List[str]] = None

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    post_type: PostType
    tags: List[str] = []
    image_url: Optional[str] = ""
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    content: str
    post_type: PostType
    tags: Optional[List[str]] = []
    image_url: Optional[str] = ""

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    content: str
    likes_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    content: str

class Badge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_type: BadgeType
    title: str
    description: str
    status: BadgeStatus = BadgeStatus.PENDING
    awarded_by: Optional[str] = None  # admin user_id or "community"
    evidence_url: Optional[str] = ""
    votes_for: int = 0
    votes_against: int = 0
    voters: List[str] = []  # user_ids who voted
    created_at: datetime = Field(default_factory=datetime.utcnow)
    validated_at: Optional[datetime] = None

class BadgeCreate(BaseModel):
    user_id: str
    badge_type: BadgeType
    title: str
    description: str
    evidence_url: Optional[str] = ""

class Challenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str = "innovation-socio-professionnelle"
    start_date: datetime
    end_date: datetime
    participants: List[str] = []  # user_ids
    max_participants: Optional[int] = None
    rewards: List[str] = []  # badge types to award
    created_by: str  # admin user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class ChallengeCreate(BaseModel):
    title: str
    description: str
    category: str = "innovation-socio-professionnelle"
    start_date: datetime
    end_date: datetime
    max_participants: Optional[int] = None
    rewards: Optional[List[str]] = []

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_doc)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    del user_dict['password']
    
    user = User(**user_dict)
    user_doc = user.dict()
    user_doc['password'] = hashed_password
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc or not verify_password(login_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(access_token=access_token, token_type="bearer", user=user)

# User routes
@api_router.get("/users/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/users/me", response_model=User)
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": current_user.id}, {"$set": update_data})
        
        # Get updated user
        updated_user_doc = await db.users.find_one({"id": current_user.id})
        return User(**updated_user_doc)
    
    return current_user

@api_router.get("/users", response_model=List[User])
async def get_users(skip: int = 0, limit: int = 20, current_user: User = Depends(get_current_user)):
    users_docs = await db.users.find({}).skip(skip).limit(limit).to_list(limit)
    return [User(**user_doc) for user_doc in users_docs]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

# Post routes
@api_router.post("/posts", response_model=Post)
async def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user)):
    post = Post(user_id=current_user.id, **post_data.dict())
    await db.posts.insert_one(post.dict())
    
    # Update user posts count
    await db.users.update_one({"id": current_user.id}, {"$inc": {"posts_count": 1}})
    
    return post

@api_router.get("/posts", response_model=List[Dict[str, Any]])
async def get_posts(skip: int = 0, limit: int = 20, post_type: Optional[PostType] = None, current_user: User = Depends(get_current_user)):
    filter_query = {}
    if post_type:
        filter_query["post_type"] = post_type
    
    posts_docs = await db.posts.find(filter_query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich posts with user info
    enriched_posts = []
    for post_doc in posts_docs:
        user_doc = await db.users.find_one({"id": post_doc["user_id"]}, {"_id": 0})
        post_with_user = post_doc.copy()
        post_with_user["user"] = {
            "id": user_doc["id"],
            "username": user_doc["username"],
            "full_name": user_doc["full_name"],
            "profile_image": user_doc.get("profile_image", ""),
            "job_title": user_doc.get("job_title", "")
        } if user_doc else None
        enriched_posts.append(post_with_user)
    
    return enriched_posts

@api_router.get("/posts/{post_id}", response_model=Dict[str, Any])
async def get_post(post_id: str, current_user: User = Depends(get_current_user)):
    post_doc = await db.posts.find_one({"id": post_id})
    if not post_doc:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Enrich with user info
    user_doc = await db.users.find_one({"id": post_doc["user_id"]})
    post_doc["user"] = {
        "id": user_doc["id"],
        "username": user_doc["username"],
        "full_name": user_doc["full_name"],
        "profile_image": user_doc.get("profile_image", ""),
        "job_title": user_doc.get("job_title", "")
    } if user_doc else None
    
    return post_doc

# Badge routes
@api_router.post("/badges", response_model=Badge)
async def nominate_badge(badge_data: BadgeCreate, current_user: User = Depends(get_current_user)):
    badge = Badge(**badge_data.dict())
    await db.badges.insert_one(badge.dict())
    return badge

@api_router.get("/badges", response_model=List[Badge])
async def get_badges(user_id: Optional[str] = None, status: Optional[BadgeStatus] = None, current_user: User = Depends(get_current_user)):
    filter_query = {}
    if user_id:
        filter_query["user_id"] = user_id
    if status:
        filter_query["status"] = status
    
    badges_docs = await db.badges.find(filter_query).sort("created_at", -1).to_list(100)
    return [Badge(**badge_doc) for badge_doc in badges_docs]

@api_router.post("/badges/{badge_id}/vote")
async def vote_badge(badge_id: str, vote: bool, current_user: User = Depends(get_current_user)):
    badge_doc = await db.badges.find_one({"id": badge_id})
    if not badge_doc:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    # Check if user already voted
    if current_user.id in badge_doc.get("voters", []):
        raise HTTPException(status_code=400, detail="You have already voted on this badge")
    
    # Update vote
    update_data = {"$push": {"voters": current_user.id}}
    if vote:
        update_data["$inc"] = {"votes_for": 1}
    else:
        update_data["$inc"] = {"votes_against": 1}
    
    await db.badges.update_one({"id": badge_id}, update_data)
    
    # Check if badge should be auto-validated (e.g., if votes_for >= 5)
    updated_badge_doc = await db.badges.find_one({"id": badge_id})
    if updated_badge_doc["votes_for"] >= 5 and updated_badge_doc["status"] == BadgeStatus.PENDING:
        await db.badges.update_one(
            {"id": badge_id}, 
            {"$set": {"status": BadgeStatus.VALIDATED, "validated_at": datetime.utcnow(), "awarded_by": "community"}}
        )
        
        # Add badge to user profile
        await db.users.update_one(
            {"id": updated_badge_doc["user_id"]}, 
            {"$addToSet": {"badges": updated_badge_doc["badge_type"]}}
        )
    
    return {"success": True, "message": "Vote recorded"}

# Challenge routes
@api_router.post("/challenges", response_model=Challenge)
async def create_challenge(challenge_data: ChallengeCreate, current_user: User = Depends(get_current_user)):
    challenge = Challenge(created_by=current_user.id, **challenge_data.dict())
    await db.challenges.insert_one(challenge.dict())
    return challenge

@api_router.get("/challenges", response_model=List[Challenge])
async def get_challenges(is_active: bool = True, current_user: User = Depends(get_current_user)):
    filter_query = {"is_active": is_active} if is_active else {}
    challenges_docs = await db.challenges.find(filter_query).sort("created_at", -1).to_list(100)
    return [Challenge(**challenge_doc) for challenge_doc in challenges_docs]

@api_router.post("/challenges/{challenge_id}/join")
async def join_challenge(challenge_id: str, current_user: User = Depends(get_current_user)):
    challenge_doc = await db.challenges.find_one({"id": challenge_id})
    if not challenge_doc:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    if current_user.id in challenge_doc.get("participants", []):
        raise HTTPException(status_code=400, detail="You are already participating in this challenge")
    
    # Check max participants
    if challenge_doc.get("max_participants") and len(challenge_doc.get("participants", [])) >= challenge_doc["max_participants"]:
        raise HTTPException(status_code=400, detail="Challenge is full")
    
    await db.challenges.update_one({"id": challenge_id}, {"$push": {"participants": current_user.id}})
    return {"success": True, "message": "Successfully joined challenge"}

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "UBUNTOO API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
