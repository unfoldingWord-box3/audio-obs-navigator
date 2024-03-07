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

  //          < !--audio id = "obsAudio" controls >
  //    <source src="https://cdn.door43.org/obs/mp3/1/en/en-obs-v6/en_obs_02-05_128kbps.mp3" />
  //        </audio-- >
  //onmousedown = "micState(true)" onmouseup = "micState(false)"
  //      <textarea id="raw" ></textarea>
  //      <textarea id="parsed"></textarea><br></br>
  //  <button id="cmdbutton">
  //    Record command
  //  </button>

  return (
    <main>
      <h1>Audio OBS Navigator</h1><br></br>
      <img id="micImg" src="../icon_mic_preview_4b61.png" width="50"
      ></img>

    </main>
  );
}

/*
function micState(mState: boolean) {
    vscode.postMessage({
      command: "extension.microphoneState",
      enabled: mState
    });
  }
  */

export default App;
