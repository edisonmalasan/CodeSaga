import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { slugSchema } from '@codesaga/contracts';
import { z } from 'zod';
import { ZodValidationPipe } from '../http';
import { PublishedContent } from './content.service';

const noQuery = new ZodValidationPipe(z.strictObject({}));
const slug = new ZodValidationPipe(slugSchema);

@Controller('api/v1/content')
export class ContentController {
  constructor(@Inject(PublishedContent) private readonly content: PublishedContent) {}

  @Get('catalog')
  catalog(@Query(noQuery) _query: Record<string, never>) { return this.content.catalog(); }

  @Get('courses/:course')
  course(@Param('course', slug) course: string, @Query(noQuery) _query: Record<string, never>) {
    return this.content.course(course);
  }

  @Get('courses/:course/chapters/:chapter')
  chapter(@Param('course', slug) course: string, @Param('chapter', slug) chapter: string,
    @Query(noQuery) _query: Record<string, never>) {
    return this.content.chapter(course, chapter);
  }

  @Get('courses/:course/lessons/:lesson')
  lesson(@Param('course', slug) course: string, @Param('lesson', slug) lesson: string,
    @Query(noQuery) _query: Record<string, never>) {
    return this.content.lesson(course, lesson);
  }

  @Get('resources/:resource')
  resource(@Param('resource', slug) resource: string, @Query(noQuery) _query: Record<string, never>) {
    return this.content.resource(resource);
  }
}
