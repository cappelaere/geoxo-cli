// import { spinnerError, spinnerInfo, spinnerSuccess, updateSpinnerText } from "../spinner.mjs";

const list = async () => {
    console.log("Processing LZSS List")
    // do work
    await new Promise(resolve => setTimeout(resolve, 1000)); // emulate work
    console.table([{ id: 1, name: "Tommy" }, { id: 2, name: "Bob" }]);
}

module.exports.list = list