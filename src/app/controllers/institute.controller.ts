import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { Institute } from '../entities';

const instituteSchema = {
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    address: { type: 'string' },
  },
  required: [
    'name',
    'address',
  ],
  type: 'object',
};

@ApiUseTag('institute')
export class InstituteController {

  @Get()
  @ApiOperationId('findInstitutes')
  @ApiOperationSummary('Find institutes.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of institutes.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findInstitutes(ctx: Context) {
    const institutes = await Institute.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(institutes);
  }

  @Get('/:instituteId')
  @ApiOperationId('findInstituteById')
  @ApiOperationSummary('Find a institute by ID.')
  @ApiResponse(404, { description: 'Institute not found.' })
  @ApiResponse(200, { description: 'Returns the institute.' })
  @ValidatePathParam('instituteId', { type: 'number' })
  async findInstituteById(ctx: Context) {
    const institute = await Institute.findOneBy({ id: ctx.request.params.instituteId });

    if (!institute) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(institute);
  }

  @Post()
  @ApiOperationId('createInstitute')
  @ApiOperationSummary('Create a new institute.')
  @ApiResponse(400, { description: 'Invalid institute.' })
  @ApiResponse(201, { description: 'Institute successfully created. Returns the institute.' })
  @ValidateBody(instituteSchema)
  async createInstitute(ctx: Context) {
    const institute = await Institute.save(ctx.request.body);
    return new HttpResponseCreated(institute);
  }

  @Patch('/:instituteId')
  @ApiOperationId('modifyInstitute')
  @ApiOperationSummary('Update/modify an existing institute.')
  @ApiResponse(400, { description: 'Invalid institute.' })
  @ApiResponse(404, { description: 'Institute not found.' })
  @ApiResponse(200, { description: 'Institute successfully updated. Returns the institute.' })
  @ValidatePathParam('instituteId', { type: 'number' })
  @ValidateBody({ ...instituteSchema, required: [] })
  async modifyInstitute(ctx: Context) {
    const institute = await Institute.findOneBy({ id: ctx.request.params.instituteId });

    if (!institute) {
      return new HttpResponseNotFound();
    }

    Object.assign(institute, ctx.request.body);

    await Institute.save(institute);

    return new HttpResponseOK(institute);
  }

  @Put('/:instituteId')
  @ApiOperationId('replaceInstitute')
  @ApiOperationSummary('Update/replace an existing institute.')
  @ApiResponse(400, { description: 'Invalid institute.' })
  @ApiResponse(404, { description: 'Institute not found.' })
  @ApiResponse(200, { description: 'Institute successfully updated. Returns the institute.' })
  @ValidatePathParam('instituteId', { type: 'number' })
  @ValidateBody(instituteSchema)
  async replaceInstitute(ctx: Context) {
    const institute = await Institute.findOneBy({ id: ctx.request.params.instituteId });

    if (!institute) {
      return new HttpResponseNotFound();
    }

    Object.assign(institute, ctx.request.body);

    await Institute.save(institute);

    return new HttpResponseOK(institute);
  }

  @Delete('/:instituteId')
  @ApiOperationId('deleteInstitute')
  @ApiOperationSummary('Delete a institute.')
  @ApiResponse(404, { description: 'Institute not found.' })
  @ApiResponse(204, { description: 'Institute successfully deleted.' })
  @ValidatePathParam('instituteId', { type: 'number' })
  async deleteInstitute(ctx: Context) {
    const institute = await Institute.findOneBy({ id: ctx.request.params.instituteId });

    if (!institute) {
      return new HttpResponseNotFound();
    }

    await Institute.delete({ id: ctx.request.params.instituteId });

    return new HttpResponseNoContent();
  }

}
