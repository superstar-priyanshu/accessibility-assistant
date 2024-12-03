from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import os
import re
from google.oauth2 import service_account
import google.auth.transport.requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["chrome-extension://*", "http://localhost:*"]}})

# Path to your service account JSON key file
SERVICE_ACCOUNT_FILE = '/Users/kumarpriyanshuraj/Desktop/accessibity-assistant/keys/accessibility-assistant-b6b95800d88e.json'

# Scopes required for the Gemini API
SCOPES = ['https://www.googleapis.com/auth/generative-language']

# Load service account credentials
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

@app.after_request
def apply_cors(response):
    print("CORS headers applied:", response.headers)
    return response

# Helper function to get the access token
def get_access_token():
    auth_req = google.auth.transport.requests.Request()
    credentials.refresh(auth_req)
    return credentials.token

# Generalized route for generating content
def generate_task(input_text):
    # Validate input
    if not input_text.strip():
        return jsonify({"error": "Input text cannot be empty"}), 400

    # Gemini API URL
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

    # Build payload
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": input_text
                    }
                ]
            }
        ]
    }

    # Request headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {get_access_token()}"
    }

    try:
        # Log the payload being sent
        print("Payload sent to Gemini API:", payload)

        # Send request to Gemini API
        response = requests.post(url, json=payload, headers=headers)

        # Log the response
        print("Gemini API response:", response.status_code, response.text)

        if response.status_code != 200:
            return jsonify({"error": f"Gemini API error: {response.text}"}), response.status_code

        return jsonify(response.json())
    except Exception as e:
        print("Unexpected error:", str(e))
        return jsonify({"error": str(e)}), 500



@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    input_text = data.get("text", "")

    if not input_text.strip():
        return jsonify({"error": "Input text cannot be empty"}), 400

    return generate_task(input_text)


@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    input_text = data.get("text", "")
    return generate_task(input_text)


@app.route('/rewrite', methods=['POST'])
def rewrite():
    data = request.json
    input_text = data.get("text", "")
    return generate_task(input_text)



@app.route('/ai-parse', methods=['POST'])
def ai_parse():
    data = request.json
    user_input = data.get('text', '').lower()

    # Enhanced intent detection with multiple phrases
    phrases = [
        r"navigate(?: me)? to (.+)",  # Matches: "navigate me to" or "navigate to"
        r"open (.+)",                # Matches: "open"
        r"take(?: me)? to (.+)",     # Matches: "take me to" or "take to"
        r"go to (.+)"                # Matches: "go to"
    ]

    # Combine phrases into a single regex pattern
    pattern = r"|".join(phrases)  # Logical OR for all phrases

    # Match the user's input against the pattern
    match = re.search(pattern, user_input)
    if match:
        # Extract the website name
        for group in match.groups():
            if group:  # Ensure the group is not None
                website_name = group.strip()
                break
        else:
            return jsonify({"intent": "unknown", "message": "Could not extract website name."})

        # Validate and construct the URL
        if re.match(r"^https?://", website_name):  # Full URL provided
            url = website_name
        else:
            # Construct a valid URL with "www"
            url = f"https://www.{website_name.replace(' ', '').lower()}.com"

        return jsonify({"intent": "navigate", "website": url})

    # If no match, return unknown intent
    return jsonify({"intent": "unknown", "message": "No navigation intent detected."})




if __name__ == "__main__":
    app.run(port=5000, debug=True)
