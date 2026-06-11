import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';

/**
 * Notifications MCP Server
 * Provides tools for interacting with the Gateway's notification management services
 */
@Injectable()
export class NotificationsMcpServer {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'list_all_notifications',
    description:
      'List all notifications in the system with optional pagination.',
    parameters: z.object({
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z
        .number()
        .optional()
        .describe('Number of items per page (default: 10)'),
    }),
  })
  async listAllNotifications(input: {
    page?: number;
    limit?: number;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/notifications`, {
          params: { page: input.page || 1, limit: input.limit || 10 },
        }),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to list notifications', error);
    }
  }

  @Tool({
    name: 'get_user_notifications',
    description: 'Get all notifications for a specific user with pagination.',
    parameters: z.object({
      userId: z
        .number()
        .describe('The ID of the user to retrieve notifications for'),
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z
        .number()
        .optional()
        .describe('Number of items per page (default: 10)'),
    }),
  })
  async getUserNotifications(input: {
    userId: number;
    page?: number;
    limit?: number;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/users/${input.userId}/notifications`, {
          params: { page: input.page || 1, limit: input.limit || 10 },
        }),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to get notifications for user ${input.userId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'get_notification',
    description: 'Get a specific notification by ID',
    parameters: z.object({
      notificationId: z
        .string()
        .describe('The unique identifier for the notification'),
    }),
  })
  async getNotification(input: { notificationId: string }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/notifications/${input.notificationId}`),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to get notification ${input.notificationId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'create_notification',
    description: 'Create a new notification. Send targeted messages to users.',
    parameters: z.object({
      userId: z
        .number()
        .describe('The ID of the user to receive the notification'),
      title: z.string().describe('The notification title'),
      message: z.string().describe('The notification message content'),
      type: z
        .string()
        .optional()
        .describe('The type of notification (e.g., email, push, sms, in-app)'),
      priority: z
        .string()
        .optional()
        .describe('Priority level (low, normal, high, critical)'),
    }),
  })
  async createNotification(input: {
    userId: number;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/notifications`, input),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to create notification', error);
    }
  }

  @Tool({
    name: 'update_notification',
    description:
      'Update an existing notification (e.g., mark as read, update status).',
    parameters: z.object({
      notificationId: z
        .string()
        .describe('The unique identifier for the notification'),
      isRead: z
        .boolean()
        .optional()
        .describe('Mark the notification as read or unread'),
      status: z.string().optional().describe('Update the notification status'),
    }),
  })
  async updateNotification(input: {
    notificationId: string;
    isRead?: boolean;
    status?: string;
  }): Promise<string> {
    try {
      const { notificationId, ...updateData } = input;
      const response = await firstValueFrom(
        this.httpService.patch(`/notifications/${notificationId}`, updateData),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to update notification ${input.notificationId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'delete_notification',
    description: 'Delete a notification by its ID',
    parameters: z.object({
      notificationId: z
        .string()
        .describe('The unique identifier for the notification to delete'),
    }),
  })
  async deleteNotification(input: { notificationId: string }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/notifications/${input.notificationId}`),
      );
      return JSON.stringify({ success: true, data: response.data }, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to delete notification ${input.notificationId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'send_broadcast_notification',
    description:
      'Send a notification to multiple users or broadcast to all users',
    parameters: z.object({
      title: z.string().describe('The notification title'),
      message: z.string().describe('The notification message content'),
      userIds: z
        .array(z.number())
        .optional()
        .describe(
          'List of user IDs to send to. Leave empty for broadcast to all.',
        ),
      type: z
        .string()
        .optional()
        .describe('Type of notification (e.g., announcement, alert)'),
    }),
  })
  async sendBroadcastNotification(input: {
    title: string;
    message: string;
    userIds?: number[];
    type?: string;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/notifications/broadcast`, input),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to send broadcast notification', error);
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
