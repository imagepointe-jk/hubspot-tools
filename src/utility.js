const moreThanOneValidDealNameError = "More than one valid deal name found.";
const noValidDealNameError =
  "No valid deal name found. It must start with S, followed by 2 zeros and exactly 5 more digits.";

function tryGetDealNameFromFileName(fileName) {
  try {
    const splitByDot = fileName.split(".");
    const withoutExtension = splitByDot[0];
    const splitBySeparator = withoutExtension.split(/[_\- ]/g);
    const validDealNames = splitBySeparator.filter(
      (item) => item.match(/^[sS]00\d{5}$/g) !== null
    );
    if (validDealNames.length === 0) throw new Error(noValidDealNameError);
    if (validDealNames.length > 1)
      throw new Error(moreThanOneValidDealNameError);

    return { dealName: validDealNames[0] };
  } catch (error) {
    return {
      error,
    };
  }
}

module.exports = {
  tryGetDealNameFromFileName,
  moreThanOneValidDealNameError,
  noValidDealNameError,
};
