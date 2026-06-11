import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AgentService } from './agent.service';
import { UserContext } from '../user-context/user-context.store';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @MessagePattern('agent.chat')
  async chat(
    @Payload() data: { message: string; user: UserContext; token: string },
  ) {
    // `data.user` is the validated JWT payload forwarded by the gateway
    const reply = await this.agentService.chat(data.message, {
      ...data.user,
      token: data.token,
    });
    return { reply };
  }
}
