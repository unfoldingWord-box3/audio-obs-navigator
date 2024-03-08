import { vscode } from "./utilities/vscode";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  /**
   * @TODO Send text message of user speech to extension.js
   * @Bruce.MCL
   */
  const [obsLink, setObsLink] = useState("");

  useEffect(() => {
    const micImg = document.getElementById("micImg");

    if (micImg) {
      micImg.addEventListener("mousedown", (event) => {
        console.log("start recording");
        vscode.postMessage({
          command: "extension.microphoneState",
          enabled: true,
        });
      });

      micImg.addEventListener("mouseup", (event) => {
        console.log("stop recording");
        vscode.postMessage({
          command: "extension.microphoneState",
          enabled: false,
        });
      });
    }

    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data our extension sent
      const { command, data } = message;

      switch (command) {
        case "play":
          const aud = new Audio(data.url);

          if (aud) {
            aud.muted = true;
            aud.play();
            aud.muted = false;
          }
          setObsLink(data.url);
          break;
      }
    });
  }, []);

  function handleSpeechInput(command: string) {
    vscode.postMessage({
      command: "spoke",
      text: `User spoke: ${command}`,
    });
  }

  const renderedLink = obsLink ? <a href={obsLink}>OBS Story</a> : null;

  return (
    <main>
      <h1>Audio OBS Navigator</h1>
      <br></br>
      <img id="micImg" src="../icon_mic_preview_4b61.png" width="50"></img>
      <h3>{obsLink}</h3>
    </main>
  );
}

export default App;
