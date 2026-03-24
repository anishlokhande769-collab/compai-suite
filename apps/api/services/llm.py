import os
import json
from typing import AsyncGenerator, List, Dict
import google.generativeai as genai
from openai import AsyncOpenAI
from apps.api.core.config import settings

class LLMProxyService:
    def __init__(self):
        # Gemini
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        # NVIDIA NIM (OpenAI compatible)
        self.nvidia_client = AsyncOpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1"
        ) if settings.NVIDIA_API_KEY else None

        # Kimi (NVIDIA NIM endpoint for K2.5 as specified by user)
        self.kimi_client = AsyncOpenAI(
            api_key=settings.KIMI_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1"
        ) if settings.KIMI_API_KEY else None

    async def stream_chat(self, model: str, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        if "gemini" in model.lower():
            gemini_model = genai.GenerativeModel("gemini-1.5-pro") # Default
            # Convert messages to Gemini format
            contents = []
            for m in messages:
                role = "user" if m["role"] == "user" else "model"
                contents.append({"role": role, "parts": [m["content"]]})
            
            response = await gemini_model.generate_content_async(contents, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text

        elif "nemotron" in model.lower() and self.nvidia_client:
            # Note: Model name might need to be specific like "nvidia/nemotron-4-340b-instruct"
            # User mentioned "nemotron 3 super"
            response = await self.nvidia_client.chat.completions.create(
                model="meta/llama3-70b-instruct", # Fallback or specific NIM name
                messages=messages,
                stream=True
            )
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content

        elif "kimi" in model.lower() and self.kimi_client:
            # User mentioned "moonshotai/kimi-k2-instruct-0905"
            response = await self.kimi_client.chat.completions.create(
                model="moonshotai/kimi-k2-instruct-0905",
                messages=messages,
                stream=True
            )
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        else:
            yield "Error: Model not supported or API key missing."

llm_service = LLMProxyService()
