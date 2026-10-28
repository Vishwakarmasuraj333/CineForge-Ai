from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.prompt_service import (
    EnhancedPromptResult,
    StoryboardResult,
    prompt_service,
)

router = APIRouter(prefix="/prompt", tags=["Prompt Intelligence & Storyboard"])


class PromptEnhanceRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=1000)
    target_style: str = Field("cinematic", max_length=50)


class StoryboardRequest(BaseModel):
    script: str = Field(..., min_length=5, max_length=2000)
    num_scenes: Optional[int] = Field(3, ge=1, le=5)


@router.post("/enhance", response_model=EnhancedPromptResult)
async def enhance_prompt(
    req: PromptEnhanceRequest,
    current_user: User = Depends(get_current_user),
):
    return await prompt_service.enhance_prompt(req.prompt, req.target_style)


@router.post("/storyboard", response_model=StoryboardResult)
async def generate_storyboard(
    req: StoryboardRequest,
    current_user: User = Depends(get_current_user),
):
    return await prompt_service.generate_storyboard(req.script, req.num_scenes or 3)
