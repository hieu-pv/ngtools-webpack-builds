import * as ts from 'typescript';
export declare function replaceBootstrap(shouldTransform: (fileName: string) => boolean, getEntryModule: () => {
    path: string;
    className: string;
}, getTypeChecker: () => ts.TypeChecker): ts.TransformerFactory<ts.SourceFile>;
