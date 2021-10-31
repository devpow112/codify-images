class CodifyError extends Error {
  constructor(message, code, exitCode = 1) {
    super(message);

    this.code = `codifyImages.${code}`;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
}

export class UnsupportedTypeError extends CodifyError {
  constructor(extension) {
    super(
      `Type '${extension}' is not a supported image format`,
      'unsupportedTypeError'
    );

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
  }
}

export class InvalidPathError extends CodifyError {
  constructor(path) {
    super(`Path '${path}' is not a valid path`, 'invalidPathError');

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
  }
}
