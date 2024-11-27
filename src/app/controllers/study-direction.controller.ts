import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { StudyDirection } from '../entities';

const studyDirectionSchema = {
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    departmentId: { type: 'number' },
  },
  required: [
    'name',
    'departmentId',
  ],
  type: 'object',
};

@ApiUseTag('studyDirection')
export class StudyDirectionController {

  @Get()
  @ApiOperationId('findStudyDirections')
  @ApiOperationSummary('Find studyDirections.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of studyDirections.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findStudyDirections(ctx: Context) {
    const studyDirections = await StudyDirection.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(studyDirections);
  }

  @Get('/:studyDirectionId')
  @ApiOperationId('findStudyDirectionById')
  @ApiOperationSummary('Find a studyDirection by ID.')
  @ApiResponse(404, { description: 'StudyDirection not found.' })
  @ApiResponse(200, { description: 'Returns the studyDirection.' })
  @ValidatePathParam('studyDirectionId', { type: 'number' })
  async findStudyDirectionById(ctx: Context) {
    const studyDirection = await StudyDirection.findOneBy({ id: ctx.request.params.studyDirectionId });

    if (!studyDirection) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(studyDirection);
  }

  @Post()
  @ApiOperationId('createStudyDirection')
  @ApiOperationSummary('Create a new studyDirection.')
  @ApiResponse(400, { description: 'Invalid studyDirection.' })
  @ApiResponse(201, { description: 'StudyDirection successfully created. Returns the studyDirection.' })
  @ValidateBody(studyDirectionSchema)
  async createStudyDirection(ctx: Context) {
    const studyDirection = await StudyDirection.save(ctx.request.body);
    return new HttpResponseCreated(studyDirection);
  }

  @Patch('/:studyDirectionId')
  @ApiOperationId('modifyStudyDirection')
  @ApiOperationSummary('Update/modify an existing studyDirection.')
  @ApiResponse(400, { description: 'Invalid studyDirection.' })
  @ApiResponse(404, { description: 'StudyDirection not found.' })
  @ApiResponse(200, { description: 'StudyDirection successfully updated. Returns the studyDirection.' })
  @ValidatePathParam('studyDirectionId', { type: 'number' })
  @ValidateBody({ ...studyDirectionSchema, required: [] })
  async modifyStudyDirection(ctx: Context) {
    const studyDirection = await StudyDirection.findOneBy({ id: ctx.request.params.studyDirectionId });

    if (!studyDirection) {
      return new HttpResponseNotFound();
    }

    Object.assign(studyDirection, ctx.request.body);

    await StudyDirection.save(studyDirection);

    return new HttpResponseOK(studyDirection);
  }

  @Put('/:studyDirectionId')
  @ApiOperationId('replaceStudyDirection')
  @ApiOperationSummary('Update/replace an existing studyDirection.')
  @ApiResponse(400, { description: 'Invalid studyDirection.' })
  @ApiResponse(404, { description: 'StudyDirection not found.' })
  @ApiResponse(200, { description: 'StudyDirection successfully updated. Returns the studyDirection.' })
  @ValidatePathParam('studyDirectionId', { type: 'number' })
  @ValidateBody(studyDirectionSchema)
  async replaceStudyDirection(ctx: Context) {
    const studyDirection = await StudyDirection.findOneBy({ id: ctx.request.params.studyDirectionId });

    if (!studyDirection) {
      return new HttpResponseNotFound();
    }

    Object.assign(studyDirection, ctx.request.body);

    await StudyDirection.save(studyDirection);

    return new HttpResponseOK(studyDirection);
  }

  @Delete('/:studyDirectionId')
  @ApiOperationId('deleteStudyDirection')
  @ApiOperationSummary('Delete a studyDirection.')
  @ApiResponse(404, { description: 'StudyDirection not found.' })
  @ApiResponse(204, { description: 'StudyDirection successfully deleted.' })
  @ValidatePathParam('studyDirectionId', { type: 'number' })
  async deleteStudyDirection(ctx: Context) {
    const studyDirection = await StudyDirection.findOneBy({ id: ctx.request.params.studyDirectionId });

    if (!studyDirection) {
      return new HttpResponseNotFound();
    }

    await StudyDirection.delete({ id: ctx.request.params.studyDirectionId });

    return new HttpResponseNoContent();
  }

}
