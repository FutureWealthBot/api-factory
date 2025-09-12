"""
Minimal Python SDK scaffold for API Factory
"""

from typing import Dict, Any
import requests

class ApiFactoryClient:
    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key

    def _headers(self):
        h = {'Content-Type': 'application/json'}
        if self.api_key:
            h['Authorization'] = f"Bearer {self.api_key}"
        return h

    def get_campaigns(self):
        r = requests.get(f"{self.base_url}/api/marketing/campaigns", headers=self._headers())
        r.raise_for_status()
        return r.json()

    def generate(self, prompt: str):
        r = requests.post(f"{self.base_url}/api/marketing/generate", json={"prompt": prompt}, headers=self._headers())
        r.raise_for_status()
        return r.json()

    def create_pr(self, campaign: str, content: str):
        r = requests.post(f"{self.base_url}/api/marketing/create-pr", json={"campaign": campaign, "content": content}, headers=self._headers())
        r.raise_for_status()
        return r.json()
