// const { dialog, remote, contextBridge } = require("electron");

const messageContainer = document.getElementById("message-container");
const uploadButton = document.getElementById("upload-button");
const logContainer = document.getElementById("log-container");
const accessTokenField = document.getElementById("access-token-field");

let selectedDirectory;

accessTokenField.oninput = (event) => {
  console.log("type is " + typeof event.target.value);
  window.electronAPI.updateAccessToken(event.target.value);
};

async function clickedSelectFolder() {
  selectedDirectory = await window.electronAPI.openDirectory();
  if (!selectedDirectory) return;

  uploadButton.style.display = "block";
}

function clickedUploadButton() {
  window.electronAPI.processFiles(selectedDirectory);
}

window.electronAPI.handleUpdateMessage((event, message) => {
  messageContainer.innerText = message;
});

window.electronAPI.handlePrintLog((event, message, isError) => {
  const newLog = document.createElement("div");
  newLog.innerText = message;
  if (isError) {
    newLog.style.color = "red";
    newLog.innerText = `❗${newLog.innerText}`;
  }
  logContainer.appendChild(newLog);
});
