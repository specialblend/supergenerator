/* eslint-disable no-sync */
require('./console');

import * as R from 'ramda';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import assert from 'assert';

const isEmptyOrNil = R.either(R.isEmpty, R.isNil);

const defaults = {
    resolvePackageJSON: R.always({}),
    resolveFiles: R.always([]),
    resolvePrompts: R.always([]),
    resolveFreshDependencies: R.always([]),
    resolveFreshDevDependencies: R.always([]),
};

export default (root, resolvers = {}) => {
    assert(!isEmptyOrNil(root), 'Root must be non-empty/nil');
    const normalizedResolvers = R.mergeRight(defaults, resolvers);
    const {
        resolvePackageJSON,
        resolveFiles,
        resolvePrompts,
        resolveFreshDependencies,
        resolveFreshDevDependencies,
    } = normalizedResolvers;
    assert(R.is(Function, resolvePackageJSON), 'resolvePackageJSON must be a function');
    assert(R.is(Function, resolveFiles), 'resolveFiles must be a function');
    assert(R.is(Function, resolvePrompts), 'resolvePrompts must be a function');
    assert(R.is(Function, resolveFreshDependencies), 'resolveFreshDependencies must be a function');
    assert(R.is(Function, resolveFreshDevDependencies), 'resolveFreshDevDependencies must be a function');
    return class extends Generator {
        constructor(...props) {
            super(...props);
            this.context = {};
        }
        async prompting() {
            console.debug('Checking for prompts');
            const prompts = resolvePrompts.bind(this)();
            if (R.is(Array, prompts)) {
                if (!R.isEmpty(prompts)) {
                    console.debug(`found (${prompts.length}) prompts`);
                    this.context = await this.prompt(prompts);
                }
                return;
            }
            console.error('Invalid prompts');
        }
        initializing() {
            console.debug('Initializing generator');
            this.sourceRoot(root);
        }
        writing() {
            console.debug('Writing files');
            this.setupPackageJSON();
            this.copyTemplateFiles();
        }
        end() {
            console.debug('Finishing setup');
            this.finalizeSetup();
            this.installFreshDependencies();
            this.goodbye();
        }

        /**
         * Merge template package.json with current package.json
         * @returns {void}
         */
        setupPackageJSON() {
            const packageJSON = resolvePackageJSON.bind(this)();
            assert(R.is(Object, packageJSON), 'resolvePackageJSON must return an Object');
            if (!R.isEmpty(packageJSON)) {
                console.debug('setting up package.json');
                this.fs.extendJSON(this.destinationPath('package.json'), packageJSON);
                return;
            }
            console.warn('No package.json configuration');
        }

        /**
         * Copy template files
         * @returns {void}
         */
        copyTemplateFiles() {
            const files = resolveFiles.bind(this)();
            assert(R.is(Array, files), 'resolveFiles must return an Array');
            if (!R.isEmpty(files)) {
                console.info('Copying template files');
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
            console.warn('No template files to copy');
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
            console.debug('Installing fresh dependencies');
            const freshDependencies = resolveFreshDependencies.bind(this)();
            const freshDevDependencies = resolveFreshDevDependencies.bind(this)();
            assert(R.is(Array, freshDependencies), 'resolveFreshDependencies must return an Array');
            assert(R.is(Array, freshDevDependencies), 'resolveFreshDevDependencies must return an Array');
            R.unless(R.isEmpty, this.npmInstall)(freshDependencies);
            R.unless(R.isEmpty, this.npmInstall)(freshDevDependencies);
        }

        /**
         * Print goodbye
         * @returns {void}
         */
        goodbye() {
            yosay(chalk.hex('#b88a5c')(`Thanks for using ${chalk.hex('#ffc66d')('@specialblend/supergenerator')}`));
            console.info('https://github.com/specialblend/supergenerator');
        }
    };
};
