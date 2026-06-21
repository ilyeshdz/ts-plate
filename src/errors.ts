export class TsPlateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TsPlateError";
  }
}

export class ValidationError extends TsPlateError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends TsPlateError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
