import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

type CommandToFunctionMap = Record<string, (data: any) => void>;

/**
 * This class manages the state and behavior of AudioAssistant webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering AudioAssistant webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class AudioAssistantPanel {
  public static currentPanel: AudioAssistantPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The AudioAssistantPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (AudioAssistantPanel.currentPanel) {
      // If the webview panel already exists reveal it
      AudioAssistantPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "showAudioAssistant",
        // Panel title
        "Audio Assistant",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
          ],
        }
      );

      AudioAssistantPanel.currentPanel = new AudioAssistantPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    AudioAssistantPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Audio Assistant</title>
        </head>
        <body>
          <div id="root"> </div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command, text } = message;

        const commandToFunctionMapping: CommandToFunctionMap = {
          ["spoke"]: this._generateVscodeCommand,
        };

        commandToFunctionMapping[command](text);
      },
      undefined,
      this._disposables
    );
  }

  /**
   * @TODO Pass the user's speech text into the LLM to generate vscode command to run
   * @Spidel
   */
  private _generateVscodeCommand(text: string) {
    // TODO: Generate this
    const vscodeCommand = null;

    // TODO: Pass in the generated command
    this._runVscodeCommand("", {});
  }

  /**
   * @TODO Runs a LLM-generated vscode command
   * @Kintsoogi
   * @Spidel
   */
  private _runVscodeCommand(command: string, data: any) {
    const { storyNum, frameNum } = data;

    const commandToFunctionMapping: CommandToFunctionMap = {
      ["play"]: this._playObs,
    };

    commandToFunctionMapping[command](data);
  }

  /**
   * @TODO Play an OBS audio file given story and frame number
   * @Rich
   */
  private _playObs({ storyNum, frameNum }: { storyNum: number; frameNum: number }) {
    // TODO: Get .mp3 data given storyNum and frameNum
    console.log(storyNum, frameNum);

    const lang = "en/en";
    const domain = "https://cdn.door43.org/obs/mp3/1/";
    const scope = digits(storyNum) + "_" + digits(frameNum);
    const url = domain + lang + "_obs_" + scope + "_128kbps.mp3";

    // TODO: Signal to webview to play mp3
    this._panel.webview.postMessage({
      command: "play",
      data: { "url": url }
    });
  }
}

function digits(inp) {
  let out = "";

  switch (inp) {
    case "one": out = "01"; break;
    case "two": out = "02"; break;
    case "three": out = "03"; break;
    case "four": out = "04"; break;
    case "five": out = "05"; break;
    case "six": out = "06"; break;
    case "seven": out = "07"; break;
    case "eight": out = "08"; break;
    case "nine": out = "09"; break;
    default:
      out = inp;
  }

  return out;
}