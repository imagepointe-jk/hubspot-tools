const {
  tryGetDealNameFromFileName,
  moreThanOneValidDealNameError,
  noValidDealNameError,
} = require("../src/utility.js");

describe("extract deal names and raise errors as necessary", () => {
  const validDealNames = [
    { fileName: "S0053842_AA.pdf", correctName: "S0053842" },
    { fileName: "s0053570_V2-AM_PNG.pdf", correctName: "s0053570" },
  ];
  for (const pair of validDealNames) {
    validDealNameTest(pair.fileName, pair.correctName);
  }

  const invalidDealNames = [
    "s053570_V2-AM_PNG.pdf",
    "X0053842_AA.pdf",
    "Ss0053842_AA.pdf",
    "s0054194V3.pdf",
  ];
  for (const name of invalidDealNames) {
    noValidDealNameTest(name);
  }

  const multipleDealNames = ["s0053199 s0054223.pdf", "s0053199-s0054223.pdf"];
  for (const name of multipleDealNames) {
    multipleDealNameTest(name);
  }
});

function validDealNameTest(fileName, correctDealName) {
  it("should correctly extract the deal name", () => {
    const result = tryGetDealNameFromFileName(fileName);

    expect(result.dealName).toBe(correctDealName);
    expect(result.error).toBeUndefined();
  });
}

function noValidDealNameTest(fileName) {
  it("should find no valid deal names and raise the correct error", () => {
    const result = tryGetDealNameFromFileName(fileName);

    expect(result.dealName).toBeUndefined();
    expect(result.error.message).toBe(noValidDealNameError);
  });
}

function multipleDealNameTest(fileName) {
  it("should find multiple valid deal names and raise the correct error", () => {
    const result = tryGetDealNameFromFileName(fileName);

    expect(result.dealName).toBeUndefined();
    expect(result.error.message).toBe(moreThanOneValidDealNameError);
  });
}
