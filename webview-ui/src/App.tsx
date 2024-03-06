import { vscode } from "./utilities/vscode";
import "./App.css";

function App() {
  /**
   * @TODO Send text message of user speech to extension.js
   * @Bruce.MCL
   */
  function handleSpeechInput(command: string) {
    vscode.postMessage({
      command: "spoke",
      text: `User spoke: ${command}`,
    });
  }

  return (
    <main>
      <h1>Audio OBS Navigator</h1>
      <div className="recordBtns">
        <i className="codicon codicon-mic"></i>
        <i className="codicon codicon-stop"></i>
      </div>
    </main>
  );
}

export default App;
