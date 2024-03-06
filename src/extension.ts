//const vscode = require('vscode');  // The module 'vscode' contains the VS Code extensibility API
import { window, commands, ExtensionContext } from 'vscode';
//import { commands, ExtensionContext } from "vscode";//
import { AudioAssistantPanel } from "./panels/AudioAssistantPanel";

export function activate(context: ExtensionContext) {
  // Create the show audio assistant command
  const showAudioAssistantCommand = commands.registerCommand(
    "audio-obs-navigator.showAssistant",
    () => {

      /* Workflow 
       *   display webview
       *   invoke STT
       *   wait for "got-stop-recording"
       *   got raw text
       *   send raw text to miniParser / LLM
       *   get back command
       *   get mp3 file name
       *   send to player
       * Grammar
       *   [ check | play ] [ story 1-50 ] [ frame 1-10 ]
       */
      AudioAssistantPanel.render(context.extensionUri);
    }
  );

  // Add command to the extension context
  context.subscriptions.push(showAudioAssistantCommand);
}

function myLog(con: string, txt: string) {
  window.showInformationMessage(con);
  console.log(con, txt);
}

