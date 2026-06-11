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
export class CoursesMcpServer {
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'list_courses',
    description:
      'List all courses with optional pagination. Returns a paginated list of courses.',
    parameters: z.object({
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z
        .number()
        .optional()
        .describe('Number of items per page (default: 10)'),
    }),
  })
  async listCourses(input: { page?: number; limit?: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/courses`, {
          params: { page: input.page || 1, limit: input.limit || 10 },
        }),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to list courses', error);
    }
  }

  @Tool({
    name: 'get_course',
    description: 'Get a specific course by ID',
    parameters: z.object({
      courseId: z.number().describe('The unique identifier for the course'),
    }),
  })
  async getCourse(input: { courseId: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/courses/${input.courseId}`),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(`Failed to get course ${input.courseId}`, error);
    }
  }

  @Tool({
    name: 'create_course',
    description:
      'Create a new course with the provided details. Returns the created course object.',
    parameters: z.object({
      title: z.string().describe('The title or name of the course'),
      description: z
        .string()
        .optional()
        .describe('A detailed description of the course content'),
      code: z.string().describe('Unique course code (e.g., CS101)'),
      credits: z.number().describe('Number of credit hours for the course'),
      programId: z.number().describe('The program ID this course belongs to'),
    }),
  })
  async createCourse(input: {
    title: string;
    description?: string;
    code: string;
    credits: number;
    programId: number;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/courses`, input),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError('Failed to create course', error);
    }
  }

  @Tool({
    name: 'update_course',
    description:
      'Update an existing course. Provide the course ID and the fields to update.',
    parameters: z.object({
      courseId: z.number().describe('The unique identifier for the course'),
      title: z.string().optional().describe('The title or name of the course'),
      description: z
        .string()
        .optional()
        .describe('A detailed description of the course content'),
      credits: z
        .number()
        .optional()
        .describe('Number of credit hours for the course'),
    }),
  })
  async updateCourse(input: {
    courseId: number;
    title?: string;
    description?: string;
    credits?: number;
  }): Promise<string> {
    try {
      const { courseId, ...updateData } = input;
      const response = await firstValueFrom(
        this.httpService.patch(`/courses/${courseId}`, updateData),
      );
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to update course ${input.courseId}`,
        error,
      );
    }
  }

  @Tool({
    name: 'delete_course',
    description: 'Delete a course by its ID',
    parameters: z.object({
      courseId: z
        .number()
        .describe('The unique identifier for the course to delete'),
    }),
  })
  async deleteCourse(input: { courseId: number }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/courses/${input.courseId}`),
      );
      return JSON.stringify({ success: true, data: response.data }, null, 2);
    } catch (error) {
      return this.formatError(
        `Failed to delete course ${input.courseId}`,
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
