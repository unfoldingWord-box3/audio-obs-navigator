//const vscode = require('vscode');  // The module 'vscode' contains the VS Code extensibility API
import {
  ExtensionContext,
  commands,
  Position,
  Uri,
  window,
  workspace,
  WorkspaceEdit,
} from 'vscode';
import { COMMAND_MAPPINGS } from './constant/command-mappings';
import { AudioAssistantPanel } from "./panels/AudioAssistantPanel";
const path = require('path');
const WebSocket = require('ws');
const express = require('express');
const open = require('open');
const app = express();
// Todo: make ports part of the extension settings
const port = 9000;
const websocketPort = 9001;
let commandQueue = '';

app.use('/', express.static(path.join(__dirname, 'client')));
app.listen(port, () => {
  console.log(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);
  window.showInformationMessage(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);
  open(`http://localhost:${port}`);
});

export function activate(context: ExtensionContext) {
  console.log(`[OBS Audio Assistant: Show] - startup`);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('stt.dictate', () => {
    console.log(`[OBS Audio Assistant] opened extension`);

    // The code you place here will be executed every time your command is executed
    const wss = new WebSocket.Server({port: websocketPort});

    wss.on('connection', (socket: any) => {
      // Display a message box to the user
      console.log('[OBS Audio Assistant] New WebSocket connection');
      window.showInformationMessage('[OBS Audio Assistant] New WebSocket connection');

      socket.on('message', (phrase: string) => {
        console.log(`[OBS Audio Assistant] New WebSocket message: ${phrase}`);
        commandQueue += phrase + '\n';

        /**
         * Add text to currently open document/file.
         * todo: Add support for special characters (enter, space, tab, backspace, etc). Use vscode.commands.
         * todo: Add support for removing text. Use vscode.commands.
         * todo: Add support for multiple selections? Use vscode.commands.
         */
        const path = window.activeTextEditor?.document.fileName;

        if (path) {
          if (
            Object.keys(COMMAND_MAPPINGS).includes(phrase) &&
            (
              (Object.keys(COMMAND_MAPPINGS[phrase]).includes('if') && COMMAND_MAPPINGS[phrase].if) ||
              !Object.keys(COMMAND_MAPPINGS[phrase]).includes('if')
            )
          ) {
            // console.log('[OBS Audio Assistant] exec command for', phrase, ...(COMMAND_MAPPINGS[phrase].params || []));
            commands.executeCommand(COMMAND_MAPPINGS[phrase].command, ...(COMMAND_MAPPINGS[phrase].params || []));
          } else {
            const edit = new WorkspaceEdit();
            const uri = Uri.file(path);
            const cursorPos = window.activeTextEditor?.selection.active;
            const position = new Position(cursorPos?.line||0, cursorPos?.character||0);
            edit.insert(uri, position, phrase);
            workspace.applyEdit(edit).then(res => commands.executeCommand('editor.action.triggerSuggest'));
          }

        }
      });
    });
  });

  context.subscriptions.push(disposable);

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

