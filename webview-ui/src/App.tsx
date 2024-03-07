import { vscode } from "./utilities/vscode";
import { useEffect } from "react";
import "./App.css";

function App() {
  /**
   * @TODO Send text message of user speech to extension.js
   * @Bruce.MCL
  */

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

  //          < !--audio id = "obsAudio" controls >
  //    <source src="https://cdn.door43.org/obs/mp3/1/en/en-obs-v6/en_obs_02-05_128kbps.mp3" />
  //        </audio-- >

  return (
    <main>
      <h1>Audio OBS Navigator</h1>
      <textarea id="raw" ></textarea>
      <textarea id="parsed"></textarea><br></br>
      <img src="../icon_mic_preview_4b61.png" width="50"></img><br></br>
      <button id="cmdbutton">
        Record command
      </button>
    </main>
  );
}

export default App;
