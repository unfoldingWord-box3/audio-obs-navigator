//const vscode = require('vscode');  // The module 'vscode' contains the VS Code extensibility API
import {
  ExtensionContext,
  commands,
  env,
  ShellExecution,
  Task,
  TaskDefinition,
  TaskRevealKind,
  TaskScope,
  tasks,
  Uri,
  window,
  WorkspaceFolder,
} from "vscode";
import { COMMAND_MAPPINGS } from "./constant/command-mappings";
import { AudioAssistantPanel } from "./panels/AudioAssistantPanel";
// @ts-ignore
import { WebSocketServer } from "ws";
import axios from "axios";
// import open from 'open';
// @ts-ignore
const express = require("express");
const path = require("path");

const app = express();
// Todo: make ports part of the extension settings
const port = 9000;
const websocketPort = 9001;
let commandQueue = "";

app.use("/", express.static(path.join(__dirname, "client")));
app.listen(port, () => {
  console.log(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);
  window.showInformationMessage(`[OBS Audio Assistant: Show] Server running at localhost:${port}`);

  const url = `http://localhost:${port}`;
  console.log(`Opening: ${url}`);
  env
    .openExternal(Uri.parse(url))
    .then((success) => {
      if (success) {
        console.log(`Successfully opened ${url}`);
      } else {
        console.error(`Failed to open ${url}`);
      }
    })
    .catch((err) => {
      console.error(`Error opening ${url}: ${err.message}`);
    });
});

async function getVscodeCommandFromUserQuery(userQuery: string) {
  const url = "http://localhost:5000/";
  const data = { query: userQuery };

  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    return error;
  }
}

interface AudioCommandArgs {
  /**
   * The audio file to play.
   */
  file: string;
}

function playAudioFile(file: string) {
  tasks.executeTask(createTask(
    "audioPlayer",
    "What the Beep?",
    {
      type: "audioPlayer",
    },
    TaskScope.Global,
    file,
  ));
}

function createTask(name: string, source: string, definition: TaskDefinition, scope: TaskScope | WorkspaceFolder, file: string): Task {
  let pyFile: string = [
    "from playsound import playsound",
    "import os",
    "import sys",
    "",
    "p = os.path.abspath(sys.argv[1])",
    "if not os.path.isfile(p):",
    "  # TODO: use problem matcher here?",
    "  print('not a file')",
    "  exit(0)",
    "",
    // See the following answer for why this logic is needed:
    // https://stackoverflow.com/a/68937955/18162937
    "if os.name == 'nt':",
    "  p = p.replace('\\\\', '\\\\\\\\', 1)",
    "",
    "playsound(p)",
  ].join("\n");

  let nt = new Task(
    // This must always be the *exact same* definition
    // from the provided task object.
    definition,
    scope,
    name,
    source,
    new ShellExecution(
      "audio-player",
      {
        executable: "python",
        shellArgs: [
          "-c",
          `"${pyFile}"`,
          file,
        ]
      },
    ),
  );

  nt.presentationOptions.reveal = TaskRevealKind.Never;
  nt.presentationOptions.showReuseMessage = false;
  nt.problemMatchers = [];

  return nt;
}

export function activate(context: ExtensionContext) {
  console.log(`[OBS Audio Assistant: Show] - startup dictate`);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand("stt.dictate", () => {});

  context.subscriptions.push(disposable);

  console.log(`[OBS Audio Assistant: Show] - show assistant`);

  // Create the show audio assistant command
  const showAudioAssistantCommand = commands.registerCommand(
    "audio-obs-navigator.showAssistant",
    () => {
      console.log(`[OBS Audio Assistant: Show] opening connection`);

      // The code you place here will be executed every time your command is executed
      const wss = new WebSocketServer({ port: websocketPort });
      console.log(`[OBS Audio Assistant: Show] openned socket`);

      wss.on("connection", (socket: any) => {
        // Display a message box to the user
        console.log("[OBS Audio Assistant] New WebSocket connection");
        window.showInformationMessage("[OBS Audio Assistant] New WebSocket connection");

        socket.on("message", async (phrase: string) => {
          console.log(`[OBS Audio Assistant] New WebSocket message: ${phrase.toString()}`);
          commandQueue += phrase + "\n";

          // TODO: insert code to handle command in `phrase` here
          const vscodeCommand = await getVscodeCommandFromUserQuery(phrase.toString());
          console.log(vscodeCommand);
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
