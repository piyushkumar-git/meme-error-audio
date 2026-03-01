const vscode = require("vscode");
const sound = require("sound-play");
const path = require("path");

const soundsDir = path.join(__dirname, "sounds");

let debounceTimer = null;
let lastErrorCount = 0;

function playMemeSound() {
  const config = vscode.workspace.getConfiguration("memeErrorAudio");
  const customSound = config.get("customSoundPath");

  let soundFile;

  if (customSound && customSound.trim() !== "") {
    soundFile = customSound;
  } else {
    const soundChoice = config.get("defaultSound");

    if (soundChoice === "faah") {
      soundFile = path.join(soundsDir, "faah.mp3");
    } else if (soundChoice === "kya-cheda") {
      soundFile = path.join(soundsDir, "kya-cheda.mp3");
    } else {
      const defaultSounds = [
        path.join(soundsDir, "faah.mp3"),
        path.join(soundsDir, "kya-cheda.mp3"),
      ];
      soundFile = defaultSounds[Math.floor(Math.random() * defaultSounds.length)];
    }
  }

  sound.play(soundFile).catch(function (err) {
    console.log("Error playing sound:", err);
  });
}

function activate(context) {
  console.log("Meme Error Audio is now active!");

  vscode.languages.onDidChangeDiagnostics(function (event) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(function () {
      let totalErrors = 0;

      event.uris.forEach(function (uri) {
        const diagnostics = vscode.languages.getDiagnostics(uri);
        const errors = diagnostics.filter(function (d) {
          return d.severity === vscode.DiagnosticSeverity.Error;
        });
        totalErrors += errors.length;
      });

      if (totalErrors > lastErrorCount) {
        playMemeSound();
      }

      lastErrorCount = totalErrors;
    }, 1500);
  });
}

function deactivate() {}

module.exports = { activate, deactivate };