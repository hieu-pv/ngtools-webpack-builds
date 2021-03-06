/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { InputFileSystem } from 'webpack';
export declare class NgccProcessor {
    private readonly ngcc;
    private readonly propertiesToConsider;
    private readonly inputFileSystem;
    private readonly compilationWarnings;
    private readonly compilationErrors;
    private _processedModules;
    private _logger;
    constructor(ngcc: typeof import('@angular/compiler-cli/ngcc'), propertiesToConsider: string[], inputFileSystem: InputFileSystem, compilationWarnings: (Error | string)[], compilationErrors: (Error | string)[]);
    processModule(moduleName: string, resolvedModule: ts.ResolvedModule | ts.ResolvedTypeReferenceDirective): void;
    /**
     * Try resolve a package.json file from the resolved .d.ts file.
     */
    private tryResolvePackage;
}
