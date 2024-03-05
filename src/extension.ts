import { commands, ExtensionContext } from "vscode";
import { AudioAssistantPanel } from "./panels/AudioAssistantPanel";

export function activate(context: ExtensionContext) {
  // Create the show audio assistant command
  const showAudioAssistantCommand = commands.registerCommand(
    "audio-obs-naviator.showAssistant",
    () => {
      AudioAssistantPanel.render(context.extensionUri);
    }
  );

  // Add command to the extension context
  context.subscriptions.push(showAudioAssistantCommand);
}
