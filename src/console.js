const R = require('ramda');
const chalk = require('chalk');

const { info, warn, error, debug } = console;

const red = '#990000';
const orange = '#cc7832';
const darkGreen = '#8c8c34';
const lightGreen = '#ccc147';
const gray = '#8598a6';

console.info = R.compose(info, chalk.hex(darkGreen));
console.success = R.compose(info, chalk.hex(lightGreen));
console.warn = R.compose(warn, chalk.hex(orange));
console.error = R.compose(error, chalk.bgHex(red).white);
console.debug = R.compose(debug, chalk.hex(gray));
