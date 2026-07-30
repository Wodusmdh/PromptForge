import requests

class PromptForgeClient:
    def __init__(self, api_key: str, base_url: str = "https://api.promptforge.dev/v1"):
        self.api_key = api_key
        self.base_url = base_url

    def compile(self, idea: str, target_assistant: str):
        response = requests.post(
            f"{self.base_url}/compile",
            headers={"X-API-Key": self.api_key},
            json={"idea": idea, "targetAssistant": target_assistant}
        )
        response.raise_for_status()
        return response.json()
