export type Node = FileNode | DirectoryNode;

export type FileContent = string | Record<string, any>;

export interface FileNode {
    type: 'file';
    path: string;
    content?: FileContent;
}

export interface DirectoryNode {
    type: 'dir';
    path: string;
    children: Node[];
}

export interface RootNode {
    type: 'root';
    children: Node[];
}
