/**
 * Context metadata attached to ts-plate errors.
 *
 * All fields are optional and populated based on the error scenario.
 * Consumers can inspect these properties to provide programmatic
 * error handling or detailed diagnostics.
 */
export interface ErrorContext {
  /** The filesystem path or filename involved in the error. */
  readonly path?: string;
  /** The node type (e.g., `"file"`, `"dir"`, `"copy"`) that caused the error. */
  readonly nodeType?: string;
  /** The conflict strategy in effect when the error occurred. */
  readonly strategy?: string;
  /** The underlying cause, typically an original `Error` or `unknown`. */
  readonly cause?: unknown;
}

/**
 * Base error for all ts-plate errors.
 *
 * Provides structured metadata via {@link ErrorContext} so consumers can
 * inspect and handle errors programmatically rather than parsing strings.
 */
export class TsPlateError extends Error {
  /** The filesystem path or filename involved. */
  readonly path?: string;

  /** The node type that caused the error. */
  readonly nodeType?: string;

  /** The conflict strategy in effect when the error occurred. */
  readonly strategy?: string;

  /** The underlying cause, typically an original `Error` or `unknown`. */
  readonly cause?: unknown;

  constructor(message: string, context?: ErrorContext) {
    super(message, context?.cause ? { cause: context.cause } : undefined);
    this.name = "TsPlateError";
    this.path = context?.path;
    this.nodeType = context?.nodeType;
    this.strategy = context?.strategy;
    this.cause = context?.cause;
  }
}

/**
 * Thrown when input validation fails during tree evaluation.
 *
 * Typically raised during `emit()` when a filename is empty, contains
 * directory traversal (`..`), or is an absolute path.
 */
export class ValidationError extends TsPlateError {
  /** Actionable guidance for resolving the error. */
  readonly hint?: string;

  constructor(message: string, context?: ErrorContext & { hint?: string }) {
    super(message, context);
    this.name = "ValidationError";
    this.hint = context?.hint;
  }
}

/**
 * Thrown when a file already exists on disk and the conflict strategy
 * is set to `"error"`.
 *
 * Raised during `write()` when the strategy check fails.
 */
export class ConflictError extends TsPlateError {
  /** The conflict strategy that triggered the error (always `"error"`). */
  readonly strategy: string;

  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "ConflictError";
    this.strategy = context?.strategy ?? "error";
  }
}

/**
 * Thrown when a filesystem operation fails during `write()`.
 *
 * Wraps raw Node.js filesystem errors (ENOENT, EPERM, etc.) with
 * ts-plate context so consumers get a consistent error shape.
 */
export class FileSystemError extends TsPlateError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "FileSystemError";
  }
}
