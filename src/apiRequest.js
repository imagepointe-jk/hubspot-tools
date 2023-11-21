//! As of Nov 2023, HubSpot APIs are in a state of transition. https://developers.hubspot.com/docs/api/deprecated-apis
//! Some of the requests below use older API versions because no alternative was found.
//! If problems arise, check whether the API version is still supported.

const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

async function findDealByName(name, accessToken) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${accessToken}`);

  const raw = JSON.stringify({
    filters: [
      {
        propertyName: "dealname",
        operator: "EQ",
        value: name,
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://api.hubapi.com/crm/v3/objects/deals/search",
    requestOptions
  );
}

async function uploadFile(fullPath, hubSpotFolderPath, accessToken) {
  const data = new FormData();
  data.append("file", fs.createReadStream(fullPath));
  data.append(
    "options",
    JSON.stringify({
      access: "PUBLIC_INDEXABLE",
      duplicateValidationStrategy: "REJECT",
    })
  );
  data.append("folderPath", hubSpotFolderPath);

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.hubapi.com/filemanager/api/v3/files/upload",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...data.getHeaders(),
    },
    data: data,
  };

  return axios.request(config);
}

async function associateFileWithDeal(fileId, dealId, accessToken, note) {
  //Everything I could find told me that deals are associated with attachments via engagements.
  //The file is stored in the engagement itself.
  //This code creates a dummy note with the sole purpose of associating the deal with the file.
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${accessToken}`);

  const raw = JSON.stringify({
    engagement: {
      active: true,
      type: "NOTE",
    },
    metadata: {
      body: note,
    },
    associations: {
      dealIds: [dealId],
    },
    attachments: [
      {
        id: fileId,
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://api.hubapi.com/engagements/v1/engagements",
    requestOptions
  );
}

module.exports = {
  findDealByName,
  uploadFile,
  associateFileWithDeal,
};
