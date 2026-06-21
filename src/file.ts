import type {
  FileContent,
  FileContentFn,
  FileName,
  FileNode,
  FileOptions,
  FileStrategy,
} from "./types";

export function file(
  name: FileName,
  content: string,
  options?: FileOptions & { strategy?: Exclude<FileStrategy, "merge"> },
): FileNode;

export function file(
  name: FileName,
  content: Record<string, unknown>,
  options?: FileOptions,
): FileNode;

export function file(name: FileName, content?: FileContentFn, options?: FileOptions): FileNode;

export function file(
  name: FileName,
  content?: FileContent | FileContentFn,
  options?: FileOptions,
): FileNode {
  return {
    type: "file",
    name,
    content,
    options,
  };
}
