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
// @ts-ignore
import { WebSocketServer } from 'ws';
// import open from 'open';
// @ts-ignore
const express = require('express');
const path = require('path');

const app = express();
// Todo: make ports part of the extension settings
const port = 9000;
const websocketPort = 9001;
let commandQueue = '';

app.use('/', express.static(path.join(__dirname, 'client')));
app.listen(port, () => {
  console.log(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);
  window.showInformationMessage(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);

  console.log("open(`http://localhost:${port}`);");
  //   open(`http://localhost:${port}`);

});

export function activate(context: ExtensionContext) {
  console.log(`[OBS Audio Assistant: Show] - startup dictate`);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('stt.dictate', () => {

  });

  context.subscriptions.push(disposable);

  console.log(`[OBS Audio Assistant: Show] - show assistant`);

  // Create the show audio assistant command
  const showAudioAssistantCommand = commands.registerCommand(
    "audio-obs-navigator.showAssistant",
    () => {
      console.log(`[OBS Audio Assistant: Show] opening connection`);

      // The code you place here will be executed every time your command is executed
      const wss = new WebSocketServer({port: websocketPort});
      console.log(`[OBS Audio Assistant: Show] openned socket`);

      wss.on('connection', (socket: any) => {
        // Display a message box to the user
        console.log('[OBS Audio Assistant] New WebSocket connection');
        window.showInformationMessage('[OBS Audio Assistant] New WebSocket connection');

        socket.on('message', (phrase: string) => {
          console.log(`[OBS Audio Assistant] New WebSocket message: ${phrase}`);
          commandQueue += phrase + '\n';

          // TODO: insert code to handle command in `phrase` here
        });
      });

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
      console.log(`[OBS Audio Assistant: Show] registered`);
    }
  );

  // Add command to the extension context
  context.subscriptions.push(showAudioAssistantCommand);

  console.log(`[OBS Audio Assistant: Show] - started`);
}

function myLog(con: string, txt: string) {
  window.showInformationMessage(con);
  console.log(con, txt);
}

