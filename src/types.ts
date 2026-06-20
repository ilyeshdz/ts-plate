export type Node = RootNode | FileNode | DirectoryNode;

export type FileContent = string | Record<string, any>;

export interface FileNode {
  type: "file";
  name: string;
  content?: FileContent;
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

export type Output = OutputFile | OutputDirectory;

export interface OutputFile {
  type: "file";
  path: string;
  content?: FileContent;
}

export interface OutputDirectory {
  type: "dir";
  path: string;
}
