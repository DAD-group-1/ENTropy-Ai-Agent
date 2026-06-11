import { MiddlewareConsumer, Module } from '@nestjs/common';
import { McpModule } from './mcp/mcp.module';
import { AgentModule } from './agent/agent.module';
import { ConfigModule } from '@nestjs/config';
import { McpUserContextMiddleware } from './mcp/mcp-user-context.middleware';
import { UserContextStore } from './user-context/user-context.store';
import { UserContextModule } from './user-context/user-context.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    McpModule,
    AgentModule,
    UserContextModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(McpUserContextMiddleware).forRoutes('/mcp');
  }
}
