import os
import sys

# Add the project root to the path so we can import apps.api
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from apps.api.main import app

# This is for Vercel Serverless Functions
handler = app
