// const { dialog, remote, contextBridge } = require("electron");
function get(id) {
  return document.getElementById(id);
}

const messageContainer = get("message-container");
const uploadButton = get("upload-button");
const logContainer = get("log-container");
const accessTokenField = get("access-token-field");
const errorCounter = get("error-counter");
const successCounter = get("success-counter");
const progressDisplay = get("progress-display");
const progressBar = get("progress-bar");
const progressBarContainer = get("progress-bar-container");

let selectedDirectory;
let errorCount = 0;
let successCount = 0;
let progress = {
  processed: 0,
  total: 0,
};

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
  updateProgressDisplay();
}

function updateSuccessCounter() {
  successCounter.innerText = `Success: ${successCount}`;
  updateProgressDisplay();
}

function updateProgressDisplay() {
  progressDisplay.innerText = `Progress: ${progress.processed}/${progress.total}`;
  const progressPercent = (progress.processed / progress.total) * 100;
  progressBar.style.right = `${100 - progressPercent}%`;
  progressBarContainer.style.display =
    progressPercent > 0 && progressPercent < 100 ? "initial" : "none";

  if (progress.processed === progress.total) {
    progressDisplay.innerHTML = `<span class="finished-text">FINISHED processing ${progress.total} files</span>`;
  }
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

window.electronAPI.handleSetProgress((event, newProgress) => {
  progress = newProgress;
  updateProgressDisplay();
});
