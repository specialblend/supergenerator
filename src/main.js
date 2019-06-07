/* eslint-disable no-sync */
const Generator = require('yeoman-generator');
const R = require('ramda');
const chalk = require('chalk');
const yosay = require('yosay');
const assert = require('assert');

const isEmptyOrNil = R.either(R.isEmpty, R.isNil);

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

const createGenerator = (
    root,
    {
        resolvePackageJSON = R.always({}),
        resolveFiles = R.always([]),
        resolvePrompts = R.always([]),
        resolveFreshDependencies = R.always([]),
        resolveFreshDevDependencies = R.always([]),
    }) => {
    assert(!isEmptyOrNil(root), 'Root must be non-empty/nil');
    return class extends Generator {
        constructor(...props) {
            super(...props);
            this.context = {};
        }
        async prompting() {
            if (R.is(Function, resolvePrompts)) {
                const prompts = resolvePrompts.bind(this)();
                if (R.is(Array, prompts)) {
                    if (!R.isEmpty(prompts)) {
                        console.debug(`found (${prompts.length}) prompts`);
                        this.context = await this.prompt(prompts);
                    }
                    return;
                }
                console.error('invalid prompts');
                return;
            }
        }
        initializing() {
            console.log('initializing generator');
            this.initializeSetup();
        }
        writing() {
            this.setupPackageJSON();
            this.copyTemplateFiles();
        }
        end() {
            this.finalizeSetup();
            this.installFreshDependencies();
            this.goodbye();
        }

        /**
         * Initialize setup
         * @returns {void}
         */
        initializeSetup() {
            this.sourceRoot(root);
        }

        /**
         * Merge template package.json with current package.json
         * @returns {void}
         */
        setupPackageJSON() {
            const packageJSON = resolvePackageJSON.bind(this)();
            if (R.is(Object, packageJSON) && !R.isEmpty(packageJSON)) {
                console.debug('setting up package.json');
                this.fs.extendJSON(this.destinationPath('package.json'), packageJSON);
                return;
            }
            console.warn('no package.json configuration');
        }

        /**
         * Copy template files
         * @returns {void}
         */
        copyTemplateFiles() {
            const files = resolveFiles.bind(this)();
            if (R.is(Array, files)) {
                if (!R.isEmpty(files)) {
                    console.info('copying template files');
                    files.map(
                        file => {
                            if (Array.isArray(file)) {
                                const [src, dest] = file;
                                this.fs.copyTpl(this.templatePath(src), this.destinationPath(dest), this.context);
                                return;
                            }
                            this.fs.copyTpl(this.templatePath(file), this.destinationPath(file), this.context);
                        },
                    );
                    return;
                }
                console.warn('no template files to copy');
                return;
            }
            console.error('invalid files');
        }

        /**
         * Finish setting up
         * @returns {void}
         */
        finalizeSetup() {
            this.spawnCommandSync('npm', ['init']);
        }

        /**
         * Install fresh dependencies
         * @returns {void}
         */
        installFreshDependencies() {
            console.debug('installing fresh dependencies');
            if (R.is(Function, resolveFreshDependencies)) {
                const freshDependencies = resolveFreshDependencies.bind(this)();
                if (R.is(Array, freshDependencies)) {
                    this.npmInstall(freshDependencies);
                }
            }
            if (R.is(Function, resolveFreshDevDependencies)) {
                const freshDevDependencies = resolveFreshDevDependencies.bind(this)();
                if (R.is(Array, freshDevDependencies)) {
                    this.npmInstall(freshDevDependencies, { 'save-dev': true });
                }
            }
        }

        /**
         * Print goodbye
         * @returns {void}
         */
        goodbye() {
            yosay(chalk.hex('#b88a5c')(`Thanks for using the ${chalk.hex('#ffc66d')('@specialblend/supergenerator')}`));
            console.info('https://github.com/specialblend/supergenerator');
        }
    };
};

module.exports = createGenerator;
