// const request = require("request");

async function findDealByName(name, accessToken) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${accessToken}`);

  var raw = JSON.stringify({
    filters: [
      {
        propertyName: "dealname",
        operator: "EQ",
        value: name,
      },
    ],
  });

  var requestOptions = {
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

module.exports = findDealByName;
