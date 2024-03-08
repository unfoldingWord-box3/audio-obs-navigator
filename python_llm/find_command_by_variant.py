import re
    
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