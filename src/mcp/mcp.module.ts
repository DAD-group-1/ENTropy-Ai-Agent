import { Module } from '@nestjs/common';
import { CoursesMcpServer } from './courses.mcp';
import { EnrollmentsMcpServer } from './enrollments.mcp';
import { NotificationsMcpServer } from './notifications.mcp';
import { McpModule as McpNest, McpTransportType } from '@rekog/mcp-nest';
import { GatewayHttpModule } from '../http/gateway-http.module';
import { UserContextStore } from '../user-context/user-context.store';
import { UserContextModule } from '../user-context/user-context.module';
import { UsersMcpServer } from './users.mcp';

/**
 * MCP Module
 * Registers all MCP servers for the AI Agent
 * These servers provide tools for the AI to interact with Gateway features
 */
@Module({
  imports: [
    UserContextModule,
    GatewayHttpModule,
    McpNest.forRoot({
      name: 'agent-mcp',
      version: '1.0.0',
      transport: McpTransportType.STREAMABLE_HTTP,
    }),
  ],
  providers: [
    CoursesMcpServer,
    EnrollmentsMcpServer,
    NotificationsMcpServer,
    UsersMcpServer,
  ],
  exports: [
    CoursesMcpServer,
    EnrollmentsMcpServer,
    NotificationsMcpServer,
    UsersMcpServer,
  ],
})
export class McpModule {}
