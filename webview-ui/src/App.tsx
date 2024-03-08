import { vscode } from "./utilities/vscode";
import { useEffect } from "react";
import "./App.css";

function App() {
  /**
   * @TODO Send text message of user speech to extension.js
   * @Bruce.MCL
  */

  useEffect(() => {
    const micImg = document.getElementById("micImg");

    if (micImg) {
      micImg.addEventListener('mousedown', event => {
        console.log("start recording");
        vscode.postMessage({
          command: "extension.microphoneState",
          enabled: true
        });
      });

      micImg.addEventListener('mouseup', event => {
        console.log("stop recording");
        vscode.postMessage({
          command: "extension.microphoneState",
          enabled: false
        });
      });
    }
  }, [])

  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case 'play':
        const aud = new Audio(message.url);

        if (aud) {
          aud.muted = true;
          aud.play();
          aud.muted = false;
        }
        break;
    }
  });

  function handleSpeechInput(command: string) {
    vscode.postMessage({
      command: "spoke",
      text: `User spoke: ${command}`,
    });
  }

  return (
    <main>
      <h1>Audio OBS Navigator</h1>
      <br></br>
      <img id="micImg" src="../icon_mic_preview_4b61.png" width="50"
      ></img>

    </main>
  );
}

export default App;
