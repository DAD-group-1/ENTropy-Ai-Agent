import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Injectable } from '@nestjs/common';
import { Ollama } from 'ollama';
import {
  UserContext,
  UserContextStore,
} from '../user-context/user-context.store';
import { ConfigService } from '@nestjs/config';
import { RagService } from '../rag/rag.service';

// agent/agent.service.ts
@Injectable()
export class AgentService {
  private readonly ollama: Ollama;
  private readonly model: string;
  private readonly mcpPort: number;
  constructor(
    private readonly userContextStore: UserContextStore,
    private readonly configService: ConfigService,
    private readonly ragService: RagService,
  ) {
    this.ollama = new Ollama({
      host: this.configService.get<string>(
        'OLLAMA_HOST',
        'http://localhost:11434',
      ),
    });
    this.mcpPort = this.configService.get<number>('MCP_LISTEN_PORT', 3009);
    this.model = this.configService.get<string>('MODEL', 'llama3.2');
  }

  private async createMcpClient(user: UserContext): Promise<Client> {
    const client = new Client({ name: 'agent-client', version: '1.0.0' });

    const transport = new StreamableHTTPClientTransport(
      new URL(`http://localhost:${this.mcpPort}/mcp`),
      {
        requestInit: {
          headers: {
            // Pass user context as header — decoded by middleware on the other side
            'x-user-context': JSON.stringify({
              id: user.id,
              email: user.email,
              role: user.role,
              token: user.token,
            }),
          },
        },
      },
    );

    await client.connect(transport);
    return client;
  }

  private buildSystemPrompt(user: UserContext, ragDocs: string[]): string {
    const docsSection = ragDocs.length
      ? `\nRelevant documentation for this request:\n${ragDocs.map((d) => `- ${d}`).join('\n')}`
      : '';

    return `
You are a helpful assistant in charge of helping users in a school campus web portal. Users such as students, teachers, and administrators can ask you to perform various tasks. You have access to a set of tools that allow you to interact with the system on behalf of the user.

Current user:
- ID: ${user.id}
- Email: ${user.email}
- Role: ${user.role}

Rules:
- Always personalise responses using the user's information when relevant.
- NEVER perform actions outside the user's role permissions.
- If a user asks for something their role does not allow, politely explain why.
- NEVER answer inappropriate questions.
- If you don't know the answer, say so instead of making something up.
- Do not mention internal tools or system details.

Tool usage:
- ONLY call a tool when the user's request explicitly requires fetching or modifying data.
- For greetings, general questions, or anything you can answer directly — respond in plain text WITHOUT calling any tool.
- Never call a tool just because tools are available.
${docsSection}
  `.trim();
  }

  private async getMcpToolsAsOllamaTools(mcpClient: Client) {
    const { tools } = await mcpClient.listTools();

    // Convert MCP tool schema → Ollama tool format
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }

  async chat(userMessage: string, user: UserContext): Promise<string> {
    console.log(user);
    return this.userContextStore.run(user, () =>
      this.runAgentLoop(userMessage, user),
    );
  }

  private async runAgentLoop(
    userMessage: string,
    user: UserContext,
  ): Promise<string> {
    const mcpClient = await this.createMcpClient(user);
    try {
      const tools = await this.getMcpToolsAsOllamaTools(mcpClient);
      console.log(tools);
      const ragDocs = await this.ragService.retrieve(userMessage, user.role);
      const messages: any[] = [
        { role: 'system', content: this.buildSystemPrompt(user, ragDocs) },
        { role: 'user', content: userMessage },
      ];

      while (true) {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          tools,
        });

        console.log(response);

        messages.push(response.message);

        if (!response.message.tool_calls?.length)
          return response.message.content;

        for (const call of response.message.tool_calls) {
          const result = await mcpClient.callTool({
            name: call.function.name,
            arguments: call.function.arguments,
          });
          messages.push({
            role: 'tool',
            content: JSON.stringify(result.content),
          });
        }
      }
    } finally {
      await mcpClient.close(); // 👈 always clean up
    }
  }
}
