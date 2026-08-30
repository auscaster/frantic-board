from flask import Flask, request, jsonify, render_template_string
import requests
import os
import time
from functools import wraps

app = Flask(__name__)

# GitHub API configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
GITHUB_API_URL = "https://api.github.com"
REPO_OWNER = "auscaster"
REPO_NAME = "frantic-board"
ISSUE_NUMBER = 390

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not GITHUB_TOKEN:
            return jsonify({"error": "GitHub token required"}), 400
        return f(*args, **kwargs)
    return decorated_function

@app.route('/submit-bounty', methods=['POST'])
@require_auth
def submit_bounty():
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        code_snippet = data.get('code_snippet')
        
        if not all([title, description, code_snippet]):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Create pull request
        pr_title = f"Fix: {title}"
        pr_body = f"{description}\n\n