import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Every error the API returns (validation failures, domain errors thrown by
 * a CQRS handler, unexpected exceptions) is normalized to the same shape —
 * an RFC 7807-flavored problem body — so every client (web, admin, mobile)
 * has exactly one error format to handle.
 */
interface ProblemBody {
  status: number;
  title: string;
  detail?: string;
  errors?: Array<{ path: string; message: string }>;
  instance: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.toProblem(exception, request.url);

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception, undefined, request.url);
    }

    response.status(status).json(body);
  }

  private toProblem(exception: unknown, instance: string): { status: number; body: ProblemBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      // nestjs-zod's ZodValidationException (and Nest's built-in
      // ValidationPipe) both surface an array of per-field issues here.
      if (typeof payload === 'object' && payload !== null && 'issues' in payload) {
        const zodIssues = (payload as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
        return {
          status,
          body: {
            status,
            title: 'Validation failed',
            errors: zodIssues.map((i) => ({ path: i.path.join('.'), message: i.message })),
            instance,
          },
        };
      }

      const detail = typeof payload === 'string' ? payload : ((payload as { message?: string })?.message ?? exception.message);
      return { status, body: { status, title: exception.name, detail, instance } };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        title: 'Internal server error',
        instance,
      },
    };
  }
}
