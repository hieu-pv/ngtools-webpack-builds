import * as ts from 'typescript';
export interface LazyRouteMap {
    [path: string]: string;
}
export declare function findLazyRoutes(filePath: string, program: ts.Program, host: ts.CompilerHost): LazyRouteMap;
