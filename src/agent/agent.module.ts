import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { UserContextStore } from '../user-context/user-context.store';
import { RagService } from '../rag/rag.service';

@Module({
  providers: [AgentService, UserContextStore, RagService],
  controllers: [AgentController],
})
export class AgentModule {}
