const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { readdirSync } = require("fs");
const path = require("path");
const {
  findDealByName,
  uploadFile,
  associateFileWithDeal,
  getDealWithNotes,
} = require("./apiRequest");
const { tryGetDealNameFromFileName } = require("./utility");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
let accessToken;

function updateMessage(newMessage) {
  mainWindow.webContents.send("update-message", newMessage);
}

function printLog(message) {
  mainWindow.webContents.send("print-log", message, false);
}

function printError(message) {
  mainWindow.webContents.send("print-log", message, true);
}

function addSuccess() {
  mainWindow.webContents.send("add-success");
}

async function handleDirectorySelect() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!canceled) {
    updateMessage(`Ready to upload from ${filePaths[0]}`);
    return filePaths[0];
  }
}

async function processFiles(path) {
  const fileNames = readdirSync(path);
  const unknownErrorMessage = (fileName) =>
    `Unknown error on file ${fileName}. File not attached.`;

  for (const fileName of fileNames) {
    try {
      //extract the deal name from the file name
      const dealNameResult = tryGetDealNameFromFileName(fileName);
      if (dealNameResult.error) {
        throw new Error(
          `Error on file ${fileName}: ${dealNameResult.error.message} File not uploaded.`
        );
      }

      //try to find the deal in hubspot
      const { dealName } = dealNameResult;
      const dealSearchResponse = await findDealByName(dealName, accessToken);
      if (
        dealSearchResponse.status === 401 ||
        dealSearchResponse.status === 403
      ) {
        printError("HubSpot denied access. Please check your access token.");
        break;
      } else if (dealSearchResponse.status !== 200) {
        throw new Error(unknownErrorMessage(fileName));
      }
      const dealSearchJson = await dealSearchResponse.json();
      if (dealSearchJson.total === 0) {
        throw new Error(`Couldn't find deal ${dealName} for file ${fileName}`);
      }

      //try to get more detailed deal data
      const dealId = dealSearchJson.results[0].id;
      const dealResponse = await getDealWithNotes(dealId, accessToken);
      if (dealResponse.status !== 200) {
        throw new Error("Error retrieving deal");
      }
      const dealJson = await dealResponse.json();
      const dealNoteId = dealJson.associations?.notes.results[0].id;
      //TODO: Depending on needs we may need to check more carefully as to whether this note means a file is attached
      if (dealNoteId !== undefined) {
        printLog(
          `Deal ${dealName} seems to already have art attached; skipping.`
        );
        continue;
      }

      //try to upload the file to hubspot
      const fullPath = `${path}\\${fileName}`;
      const fileUploadResponse = await uploadFile(
        fullPath,
        "/Deal Art",
        accessToken
      );
      if (fileUploadResponse.status !== 200) {
        throw new Error(unknownErrorMessage(fileName));
      }

      //try to associate the file with the deal
      const uploadedFileID = fileUploadResponse.data.objects[0].id;
      const associateFileResponse = await associateFileWithDeal(
        uploadedFileID,
        dealId,
        accessToken
      );
      if (associateFileResponse.status !== 200) {
        throw new Error(unknownErrorMessage(fileName));
      }

      printLog(`Successfully attached ${fileName} to deal ${dealName}`);
      addSuccess();
    } catch (error) {
      if (error.response?.data?.errorType === "DUPLICATE_FILE") {
        printError(
          `The contents of ${fileName} is a duplicate of a file already in HubSpot. File not uploaded. If you want to associate an art proof with multiple orders, you will need to do it manually.`
        );
      } else {
        printError(error.message);
      }
      continue;
    }
  }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // eslint-disable-next-line
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  // eslint-disable-next-line
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("dialog:openDirectory", handleDirectorySelect);
  ipcMain.handle("processFiles", (event, path) => processFiles(path));
  ipcMain.handle("updateAccessToken", (event, token) => (accessToken = token));
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  // eslint-disable-next-line
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
