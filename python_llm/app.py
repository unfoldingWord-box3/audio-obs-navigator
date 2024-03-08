from flask import Flask, request, jsonify
import json
from prompt import get_command_variant
from find_command_by_variant import find_command_by_variant
from extract_story_and_frame import extract_story_and_frame

app = Flask(__name__)

def load_commands_json(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def create_vscode_command(query: str) -> dict:
    commands_json = load_commands_json('commands.json')
    variant_from_user_query = get_command_variant(query=query)
    command = find_command_by_variant(variant_from_user_query, commands_json)

    if command:
        if command == "PlayOBS":
          data = extract_story_and_frame(variant_from_user_query)
        else:
          data = { "placeholder": "test" }  

        vscode_command = { "command": command, "data": data }
        return vscode_command
    else:
        return {"error": "No matching command found for the given variant."}

@app.route('/', methods=['POST'])
def vscode_command_from_query():
    request_data = request.get_json()
    query = request_data.get('query')
    if not query:
        return jsonify({"error": "Missing query in request"}), 400

    result = create_vscode_command(query)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
