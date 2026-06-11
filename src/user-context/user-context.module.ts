import { Module } from '@nestjs/common';
import { UserContextStore } from './user-context.store';

@Module({
  providers: [UserContextStore],
  exports: [UserContextStore],
})
export class UserContextModule {}
