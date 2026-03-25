class AppError extends Error {
  statusCode: number;
  success: boolean;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.success = statusCode.toString().startsWith("4") ? false : true;
    this.isOperational = true; 

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;