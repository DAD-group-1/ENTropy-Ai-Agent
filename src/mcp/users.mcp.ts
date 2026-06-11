import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';

/**
 * Courses MCP Server
 * Provides tools for interacting with the Gateway's course management services
 */
@Injectable()
export class UsersMcpServer {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'get_user_information',
    description: 'Get information about the user and related data',
    parameters: z.object({
      id: z.number(),
    }),
  })
  async getUserInfo(input: { id: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/users/${input.id}`),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to list courses', error);
    }
  }

  private formatError(message: string, error: unknown): string {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    return JSON.stringify(
      {
        error: message,
        details: errorMessage,
      },
      null,
      2,
    );
  }
}
