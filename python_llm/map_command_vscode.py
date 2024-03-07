import json
import re
from prompt import get_command_variant
from extract_story_and_frame import extract_story_and_frame

def load_commands(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)
    
def variant_to_regex_pattern(variant):
    # Replace placeholders with regex patterns to match any sequence of digits
    variant_pattern = variant.replace("{story_number}", r"(\d+)")
    variant_pattern = variant_pattern.replace("{frame_number}", r"(\d+)")
    # Convert the entire variant pattern to a regex pattern
    return re.compile("^" + variant_pattern + "$", re.IGNORECASE)

def find_command_by_variant(user_variant, commands):
    for command in commands:
        for variant in command['variants']:
            pattern = variant_to_regex_pattern(variant)
            # Check if the user_variant matches the pattern
            if pattern.match(user_variant):
                return command['command']
    return None

def get_vscode_command(query: str) -> dict:
    commands_data = load_commands('commands.json')
    variant_from_query = get_command_variant(query=query)
    print (variant_from_query)
    command = find_command_by_variant(variant_from_query, commands_data)

    if command:
        if command == "PlayOBS":
          data = extract_story_and_frame(variant_from_query)
        else:
          data = { "placeholder": "test" }  

        vscode_command = { "command": command, "data": data }
        print(vscode_command)
        return vscode_command
    else:
        print("sad :()")
        return {"error": "No matching command found for the given variant."}

if __name__ == "__main__":
    get_vscode_command("play next frame")
