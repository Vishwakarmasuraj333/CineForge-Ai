import re
from typing import Dict, List, Optional

import httpx
from pydantic import BaseModel

from app.core.config import settings


class EnhancedPromptResult(BaseModel):
    original_prompt: str
    enhanced_prompt: str
    detected_language: str
    elements: Dict[str, str]
    suggestions: List[str]


class StoryboardScene(BaseModel):
    scene_number: int
    title: str
    visual_prompt: str
    duration_seconds: int
    camera_direction: str
    lighting: str
    narration: Optional[str] = None


class StoryboardResult(BaseModel):
    script_summary: str
    scenes: List[StoryboardScene]


class PromptEnhancementService:
    """
    Intelligent prompt enhancement and scene breakdown engine.
    Supports Hindi and English prompt inputs with rule-based and LLM-assisted enrichment.
    """

    def is_hindi(self, text: str) -> bool:
        # Detect Devanagari script unicode range
        return bool(re.search(r"[\u0900-\u097F]", text))

    async def enhance_prompt(self, prompt: str, target_style: str = "cinematic") -> EnhancedPromptResult:
        is_hi = self.is_hindi(prompt)
        lang = "Hindi" if is_hi else "English"

        # If OpenAI key configured, attempt LLM enhancement
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10:
            try:
                enhanced = await self._call_openai_enhancement(prompt, target_style)
                if enhanced:
                    return enhanced
            except Exception:
                pass  # Fallback to deterministic expert rule expansion

        # High-grade deterministic cinematic prompt decomposition
        style_keywords = {
            "cinematic": "shot on 35mm lens, anamorphic bokeh, film grain, cinematic lighting, photorealistic 8k",
            "anime": "Makoto Shinkai style, vibrant colors, detailed anime aesthetic, dynamic composition",
            "cyberpunk": "neon reflections, volumetric fog, futuristic megacity, rain-slicked asphalt, high tech noir",
        }
        style_tag = style_keywords.get(target_style.lower(), style_keywords["cinematic"])

        elements = {
            "subject": prompt.strip(),
            "environment": "detailed atmospheric setting with realistic depth of field",
            "lighting": "golden hour cinematic rim lighting with soft ambient shadows",
            "camera_movement": "slow smooth cinematic tracking push-in shot",
            "visual_style": target_style.capitalize(),
        }

        enhanced_text = f"{prompt.strip()}, {elements['camera_movement']}, {elements['lighting']}, {style_tag}"

        suggestions = [
            "Add camera motion (e.g. 'drone fly-through', 'low-angle pan')",
            "Specify lighting condition (e.g. 'diffused overcast', 'dramatic side light')",
            "Include audio cue or tempo if composing with voice-over",
        ]

        return EnhancedPromptResult(
            original_prompt=prompt,
            enhanced_prompt=enhanced_text,
            detected_language=lang,
            elements=elements,
            suggestions=suggestions,
        )

    async def generate_storyboard(self, script_or_idea: str, num_scenes: int = 3) -> StoryboardResult:
        # Structured scene breakdown
        scenes: List[StoryboardScene] = []
        base_idea = script_or_idea.strip()

        movements = [
            ("Establishing Wide Shot", "Slow aerial drone drift down", "Soft morning diffused sunlight"),
            ("Medium Action Push", "Smooth dolly forward tracking subject", "Dynamic high-contrast directional lighting"),
            ("Cinematic Close-Up Climax", "Subtle handheld orbital pan", "Warm golden rim lighting, shallow depth of field"),
        ]

        for i in range(min(num_scenes, 3)):
            title, cam, light = movements[i]
            scenes.append(
                StoryboardScene(
                    scene_number=i + 1,
                    title=f"Scene {i+1}: {title}",
                    visual_prompt=f"{base_idea}, scene {i+1}, {title.lower()}, {cam.lower()}, {light.lower()}, photorealistic, 8k",
                    duration_seconds=5,
                    camera_direction=cam,
                    lighting=light,
                    narration=f"Narration voiceover for scene {i+1} regarding {base_idea[:40]}...",
                )
            )

        return StoryboardResult(
            script_summary=f"Automated 3-scene cinematic storyboard synthesized for: '{base_idea[:60]}...'",
            scenes=scenes,
        )

    async def _call_openai_enhancement(self, prompt: str, style: str) -> Optional[EnhancedPromptResult]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an award-winning cinema director and AI video prompt engineer. Enhance the user's video prompt with precise visual camera instructions, lighting, and mood. Respond in JSON with keys: enhanced_prompt, subject, environment, lighting, camera_movement, visual_style, suggestions."
                },
                {"role": "user", "content": f"Prompt: {prompt}\nStyle: {style}"}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                import json
                data = res.json()["choices"][0]["message"]["content"]
                parsed = json.loads(data)
                return EnhancedPromptResult(
                    original_prompt=prompt,
                    enhanced_prompt=parsed.get("enhanced_prompt", prompt),
                    detected_language="Hindi" if self.is_hindi(prompt) else "English",
                    elements={
                        "subject": parsed.get("subject", prompt),
                        "environment": parsed.get("environment", ""),
                        "lighting": parsed.get("lighting", ""),
                        "camera_movement": parsed.get("camera_movement", ""),
                        "visual_style": parsed.get("visual_style", style),
                    },
                    suggestions=parsed.get("suggestions", []),
                )
        return None


prompt_service = PromptEnhancementService()
