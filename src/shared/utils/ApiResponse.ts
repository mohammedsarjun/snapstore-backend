export class ApiResponse {
  static success(res: any, statusCode: number, message: string, data: any) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: any, statusCode: number, message: string) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}