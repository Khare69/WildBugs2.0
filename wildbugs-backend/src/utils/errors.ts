export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, isOperational = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 404, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation error', details?: unknown) {
    super(message, 400, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access: Please authenticate', details?: unknown) {
    super(message, 401, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: You do not have permission to perform this action', details?: unknown) {
    super(message, 403, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict: Entity already exists', details?: unknown) {
    super(message, 409, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 500, false, details);
  }
}
