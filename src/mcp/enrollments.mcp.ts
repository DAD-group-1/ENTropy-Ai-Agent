import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';

/**
 * Enrollments MCP Server
 * Provides tools for interacting with the Gateway's enrollment management services
 */
@Injectable()
export class EnrollmentsMcpServer {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'list_enrollments',
    description:
      'List all enrollments with optional pagination. Supports filtering by student or course.',
    parameters: z.object({
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z
        .number()
        .optional()
        .describe('Number of items per page (default: 10)'),
    }),
  })
  async listEnrollments(input: {
    page?: number;
    limit?: number;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/enrollments`, {
          params: { page: input.page || 1, limit: input.limit || 10 },
        }),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to list enrollments', error);
    }
  }

  @Tool({
    name: 'get_enrollment',
    description: 'Get a specific enrollment by ID',
    parameters: z.object({
      enrollmentId: z
        .number()
        .describe('The unique identifier for the enrollment'),
    }),
  })
  async getEnrollment(input: { enrollmentId: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/enrollments/${input.enrollmentId}`),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to get enrollment ${input.enrollmentId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'create_enrollment',
    description:
      'Enroll a student in a course. Returns the created enrollment object.',
    parameters: z.object({
      studentId: z.number().describe('The ID of the student to enroll'),
      courseId: z.number().describe('The ID of the course to enroll in'),
      enrollmentDate: z
        .string()
        .optional()
        .describe('The enrollment date (ISO 8601 format)'),
    }),
  })
  async createEnrollment(input: {
    studentId: number;
    courseId: number;
    enrollmentDate?: string;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/enrollments`, input),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to create enrollment', error);
    }
  }

  @Tool({
    name: 'update_enrollment',
    description:
      'Update an existing enrollment. Provide the enrollment ID and the fields to update.',
    parameters: z.object({
      enrollmentId: z
        .number()
        .describe('The unique identifier for the enrollment'),
      status: z
        .string()
        .optional()
        .describe(
          'The new status of the enrollment (e.g., active, completed, dropped)',
        ),
      grade: z
        .string()
        .optional()
        .describe('The final grade for the enrollment'),
    }),
  })
  async updateEnrollment(input: {
    enrollmentId: number;
    status?: string;
    grade?: string;
  }): Promise<string> {
    try {
      const { enrollmentId, ...updateData } = input;
      const response = await firstValueFrom(
        this.httpService.patch(`/enrollments/${enrollmentId}`, updateData),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to update enrollment ${input.enrollmentId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'delete_enrollment',
    description: 'Delete/unenroll a student from a course by enrollment ID',
    parameters: z.object({
      enrollmentId: z
        .number()
        .describe('The unique identifier for the enrollment to delete'),
    }),
  })
  async deleteEnrollment(input: { enrollmentId: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/enrollments/${input.enrollmentId}`),
      );
      return JSON.stringify({ success: true, data: response.data }, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to delete enrollment ${input.enrollmentId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'get_student_enrollments',
    description: 'Get all enrollments for a specific student with pagination',
    parameters: z.object({
      studentId: z.number().describe('The ID of the student'),
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z
        .number()
        .optional()
        .describe('Number of items per page (default: 10)'),
    }),
  })
  async getStudentEnrollments(input: {
    studentId: number;
    page?: number;
    limit?: number;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/students/${input.studentId}/enrollments`, {
          params: { page: input.page || 1, limit: input.limit || 10 },
        }),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to get enrollments for student ${input.studentId}`,
        error,
      );
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
