import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  UserContext,
  UserContextStore,
} from '../user-context/user-context.store';

@Injectable()
export class McpUserContextMiddleware implements NestMiddleware {
  constructor(private readonly userContextStore: UserContextStore) {}

  use(req: Request, res: Response, next: NextFunction) {
    const header = req.headers['x-user-context'];

    if (header) {
      try {
        const user = JSON.parse(header as string) as UserContext;

        this.userContextStore.enter(user);
        console.log(user);
      } catch {
        // ignore malformed header
      }
    }
    next();
  }
}
