import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    Logger.log('request:', request);
    Logger.log('错误提示', exception.response);
    let message;
    let code = 10000;
    if (exception.response?.code !== undefined) {
      code = exception.response.code;
    }
    if (typeof exception.response.message === 'string') {
      message = exception.response.message;
    } else {
      message =
        exception.response.message?.length > 0
          ? exception.response.message[0]
          : exception.response.message;
    }
    const errorResponse = {
      message: message,
      code: code, // 自定义code
      data: request.originalUrl, // 错误的url地址
    };
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // 设置返回的状态码、请求头、发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
