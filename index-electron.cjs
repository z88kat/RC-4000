//
// Bootstrap the ESM loader and load the main module for exlection
// Needed for the ESM loader to work with es6
//
require = require("esm")(module /* , options */ );
module.exports = require("./main.mjs");