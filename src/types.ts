export type Node = RootNode | FileNode | DirectoryNode | CopyNode | CopyDirNode | ConditionalNode;

export type Condition = boolean | (() => boolean);

export type FileContent = string | Record<string, any>;
export type FileContentFn = () => FileContent | Promise<FileContent>;

export type FileName = string | (() => string) | (() => Promise<string>);

export type FileStrategy = "overwrite" | "skip" | "error" | "merge";

export interface FileOptions {
  strategy?: FileStrategy;
}

export interface FileNode {
  type: "file";
  name: FileName;
  content?: FileContent | FileContentFn;
  options?: FileOptions;
}

export interface DirectoryNode {
  type: "dir";
  name: string;
  children: Node[];
}

export interface RootNode {
  type: "root";
  children: Node[];
}

export interface CopyNode {
  type: "copy";
  from: string;
  name: string;
}

export interface CopyDirNode {
  type: "copy-dir";
  from: string;
  options?: CopyDirOptions;
}

export interface CopyDirOptions {
  rename?: (name: string) => string;
  filter?: (path: string) => boolean;
}

export interface ConditionalNode {
  type: "conditional";
  condition: Condition;
  children: Node[];
}

export type Output = OutputFile | OutputDirectory | OutputCopy;

export interface OutputFile {
  type: "file";
  path: string;
  content?: FileContent;
  strategy?: FileStrategy;
}

export interface OutputDirectory {
  type: "dir";
  path: string;
}

export interface OutputCopy {
  type: "copy";
  path: string;
  from: string;
}
