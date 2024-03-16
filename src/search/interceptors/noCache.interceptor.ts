import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class NoCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.header(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        );
        response.header('Pragma', 'no-cache');
        response.header('Expires', '0');
      }),
    );
  }
}
