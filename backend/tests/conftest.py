import os

# Set a mock GEMINI_API_KEY for all tests to prevent EnvironmentError on module import
os.environ["GEMINI_API_KEY"] = "mock-key-value"
