// const { dialog, remote, contextBridge } = require("electron");

const messageContainer = document.getElementById("message-container");
const uploadButton = document.getElementById("upload-button");
const logContainer = document.getElementById("log-container");
const accessTokenField = document.getElementById("access-token-field");
const errorCounter = document.getElementById("error-counter");
const successCounter = document.getElementById("success-counter");

let selectedDirectory;
let errorCount = 0;
let successCount = 0;

accessTokenField.oninput = (event) => {
  window.electronAPI.updateAccessToken(event.target.value);
};
// eslint-disable-next-line no-unused-vars
async function clickedSelectFolder() {
  selectedDirectory = await window.electronAPI.openDirectory();
  if (!selectedDirectory) return;

  uploadButton.style.display = "block";
}

function clearLogs() {
  errorCount = 0;
  successCount = 0;
  logContainer.innerHTML = "";
  updateErrorCounter();
  updateSuccessCounter();
}
// eslint-disable-next-line no-unused-vars
function clickedUploadButton() {
  window.electronAPI.processFiles(selectedDirectory);
  clearLogs();
}

function updateErrorCounter() {
  errorCounter.innerText = `Errors: ${errorCount}`;
  errorCounter.style.color = errorCount > 0 ? "red" : "initial";
}

function updateSuccessCounter() {
  successCounter.innerText = `Success: ${successCount}`;
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
    errorCount++;
    updateErrorCounter();
  }
  logContainer.appendChild(newLog);
});

window.electronAPI.handleSuccess(() => {
  successCount++;
  updateSuccessCounter();
});
