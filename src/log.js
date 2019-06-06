import * as R from 'ramda';
import chalk from 'chalk';

const { info, warn, error, debug } = console;

const red = '#990000';
const orange = '#cc7832';
const darkGreen = '#8c8c34';
const lightGreen = '#ccc147';
const gray = '#8598a6';

const log = {};

log.info = R.compose(info, chalk.hex(darkGreen));
log.success = R.compose(info, chalk.hex(lightGreen));
log.warn = R.compose(warn, chalk.hex(orange));
log.error = R.compose(error, chalk.bgHex(red).white);
log.debug = R.compose(debug, chalk.hex(gray));

export default log;
