"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark_1 = require("./benchmark");
const utils_1 = require("./utils");
// We cannot create a plugin for this, because NGTSC requires addition type
// information which ngcc creates when processing a package which was compiled with NGC.
// Example of such errors:
// ERROR in node_modules/@angular/platform-browser/platform-browser.d.ts(42,22):
// error TS-996002: Appears in the NgModule.imports of AppModule,
// but could not be resolved to an NgModule class
// We now transform a package and it's typings when NGTSC is resolving a module.
class NgccProcessor {
    constructor(ngcc, propertiesToConsider, inputFileSystem, compilationWarnings, compilationErrors) {
        this.ngcc = ngcc;
        this.propertiesToConsider = propertiesToConsider;
        this.inputFileSystem = inputFileSystem;
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
        this._processedModules = new Set();
        this._logger = new NgccLogger(this.compilationWarnings, this.compilationErrors);
    }
    processModule(moduleName, resolvedModule) {
        const resolvedFileName = resolvedModule.resolvedFileName;
        if (!resolvedFileName
            || moduleName.startsWith('.')
            || this._processedModules.has(moduleName)) {
            // Skip when module is unknown, relative or NGCC compiler is not found or already processed.
            return;
        }
        const packageJsonPath = this.tryResolvePackage(moduleName, resolvedFileName);
        if (!packageJsonPath) {
            // add it to processed so the second time round we skip this.
            this._processedModules.add(moduleName);
            return;
        }
        const normalizedJsonPath = utils_1.workaroundResolve(packageJsonPath);
        const timeLabel = `NgccProcessor.processModule.ngcc.process+${moduleName}`;
        benchmark_1.time(timeLabel);
        this.ngcc.process({
            basePath: normalizedJsonPath.substring(0, normalizedJsonPath.indexOf(moduleName)),
            targetEntryPointPath: moduleName,
            propertiesToConsider: this.propertiesToConsider,
            compileAllFormats: false,
            createNewEntryPointFormats: true,
            logger: this._logger,
        });
        benchmark_1.timeEnd(timeLabel);
        // Purge this file from cache, since NGCC add new mainFields. Ex: module_ivy_ngcc
        // which are unknown in the cached file.
        // tslint:disable-next-line:no-any
        this.inputFileSystem.purge(packageJsonPath);
        this._processedModules.add(moduleName);
    }
    /**
     * Try resolve a package.json file from the resolved .d.ts file.
     */
    tryResolvePackage(moduleName, resolvedFileName) {
        try {
            // This is based on the logic in the NGCC compiler
            // tslint:disable-next-line:max-line-length
            // See: https://github.com/angular/angular/blob/b93c1dffa17e4e6900b3ab1b9e554b6da92be0de/packages/compiler-cli/src/ngcc/src/packages/dependency_host.ts#L85-L121
            const packageJsonPath = require.resolve(`${moduleName}/package.json`, {
                paths: [resolvedFileName],
            });
            return packageJsonPath;
        }
        catch (_a) {
            // if it fails this might be a deep import which doesn't have a package.json
            // Ex: @angular/compiler/src/i18n/i18n_ast/package.json
            return undefined;
        }
    }
}
exports.NgccProcessor = NgccProcessor;
class NgccLogger {
    constructor(compilationWarnings, compilationErrors) {
        this.compilationWarnings = compilationWarnings;
        this.compilationErrors = compilationErrors;
    }
    debug(..._args) { }
    info(..._args) { }
    warn(...args) {
        this.compilationWarnings.push(args.join(' '));
    }
    error(...args) {
        this.compilationErrors.push(new Error(args.join(' ')));
    }
}
