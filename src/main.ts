import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from '@dad-group-1/backend-common';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { AgentService } from './agent/agent.service';
import { RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';

dotenv.config(); // Load environment variables from .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger('agent', 'info'),
  });
  const configService = app.get(ConfigService);

  const mcpListenPort = configService.get<number>('MCP_LISTEN_PORT', 3009);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        {
          username: configService.getOrThrow<string>('RABBITMQ_USERNAME'),
          password: configService.getOrThrow<string>('RABBITMQ_PASSWORD'),
          hostname: configService.getOrThrow<string>('RABBITMQ_HOST'),
          port: configService.getOrThrow<number>('RABBITMQ_PORT'),
        } as RmqUrl,
      ],
      queue: `AGENT_SERVICE_QUEUE`,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(mcpListenPort); // ✅ HTTP server is now up

  new Logger('Bootstrap').log(`AI Agent started - MCP HTTP: ${mcpListenPort}`);
}
bootstrap();
