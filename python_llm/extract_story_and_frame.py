import re

def extract_story_and_frame(variant: str):
    # Initialize default values
    story_number = '1'
    frame_number = '1'

    # Check for literal 'current', 'next', 'previous' or actual numbers
    if 'current story' in variant or 'next story' in variant or 'previous story' in variant:
        story_number = re.findall(r'(current story|next story|previous story)', variant)[0]
    else:
        story_num_match = re.search(r'story (\d+)', variant)
        if story_num_match:
            story_number = story_num_match.group(1)
    
    if 'current frame' in variant or 'next frame' in variant or 'previous frame' in variant:
        frame_number = re.findall(r'(current frame|next frame|previous frame)', variant)[0]
    else:
        frame_num_match = re.search(r'frame (\d+)', variant)
        if frame_num_match:
            frame_number = frame_num_match.group(1)

    # Correct for phrases where 'current', 'next', 'previous' directly follow 'story' or 'frame'
    story_number = story_number.replace(' story', '')
    frame_number = frame_number.replace(' frame', '')

    return {"story_number": story_number, "frame_number": frame_number}


if __name__ == "__main__":
  # Testing the function with your provided variants
  variants = [
      "Open OBS",
      "Start playing OBS",
      "Go to story 3",
      "Show me story 5",
      "Navigate to story 7 frame 2",
      "Go to frame 4 in the current story",
      "Play the current story",
      "Move to the next story",
      "Return to the previous story",
      "Continue with the next frame in the current story",
      "Go back to the previous frame in the current story"
  ]

  for variant in variants:
      result = extract_story_and_frame(variant)
      print(f"Variant: '{variant}' => Story: {result['story_number']}, Frame: {result['frame_number']}")