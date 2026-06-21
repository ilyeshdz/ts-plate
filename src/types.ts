export type Node = RootNode | FileNode | DirectoryNode | CopyNode | CopyDirNode | ConditionalNode;

export type Condition = boolean | (() => boolean);

export type FileContent = string | Record<string, any>;
export type FileContentFn = () => FileContent | Promise<FileContent>;

export type FileName = string | (() => string) | (() => Promise<string>);

export type FileStrategy = "overwrite" | "skip" | "error" | "merge";

export interface FileOptions {
  readonly strategy?: FileStrategy;
}

export interface FileNode {
  readonly type: "file";
  readonly name: FileName;
  readonly content?: FileContent | FileContentFn;
  readonly options?: FileOptions;
}

export interface DirectoryNode {
  readonly type: "dir";
  readonly name: string;
  readonly children: readonly Node[];
}

export interface RootNode {
  readonly type: "root";
  readonly children: readonly Node[];
}

export interface CopyNode {
  readonly type: "copy";
  readonly from: string;
  readonly name: string;
}

export interface CopyDirNode {
  readonly type: "copy-dir";
  readonly from: string;
  readonly options?: CopyDirOptions;
}

export interface CopyDirOptions {
  readonly rename?: (name: string) => string;
  readonly filter?: (path: string) => boolean;
}

export interface ConditionalNode {
  readonly type: "conditional";
  readonly condition: Condition;
  readonly children: readonly Node[];
}

export type Output = OutputFile | OutputDirectory | OutputCopy;

export interface OutputFile {
  readonly type: "file";
  readonly path: string;
  readonly content?: FileContent;
  readonly strategy?: FileStrategy;
}

export interface OutputDirectory {
  readonly type: "dir";
  readonly path: string;
}

export interface OutputCopy {
  readonly type: "copy";
  readonly path: string;
  readonly from: string;
}
