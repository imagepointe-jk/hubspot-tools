// const { dialog, remote, contextBridge } = require("electron");

const messageContainer = document.getElementById("message-container");

async function clicked() {
    const val = await window.electronAPI.openDirectory();
    if (!val) return;
    window.electronAPI.processFiles(val);
}

window.electronAPI.handleUpdateMessage((event, value) => {
    messageContainer.innerHTML = `<div style='color:red;'>${value}</div>`
})