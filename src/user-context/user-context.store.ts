import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { HttpStatusCode } from 'axios';

export interface UserContext {
  id: string;
  email: string;
  role: string;
  token: string;
}

@Injectable()
export class UserContextStore {
  private readonly storage = new AsyncLocalStorage<UserContext>();

  run<T>(user: UserContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(user, fn);
  }

  enter(user: UserContext): void {
    this.storage.enterWith(user);
  }

  get(): UserContext {
    const ctx = this.storage.getStore();
    if (!ctx) {
      console.error('No user context in current execution scope');
      throw new Error('No user context in current execution scope');
    }
    return ctx;
  }
}
