import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { Dormitory } from '../entities';

const dormitorySchema = {
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    capacity: { type: 'number' },
    buildingId: { type: 'number' },
  },
  required: [
    'name',
    'capacity',
    'buildingId',
  ],
  type: 'object',
};

@ApiUseTag('dormitory')
export class DormitoryController {

  @Get()
  @ApiOperationId('findDormitorys')
  @ApiOperationSummary('Find dormitorys.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of dormitorys.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findDormitorys(ctx: Context) {
    const dormitorys = await Dormitory.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(dormitorys);
  }

  @Get('/:dormitoryId')
  @ApiOperationId('findDormitoryById')
  @ApiOperationSummary('Find a dormitory by ID.')
  @ApiResponse(404, { description: 'Dormitory not found.' })
  @ApiResponse(200, { description: 'Returns the dormitory.' })
  @ValidatePathParam('dormitoryId', { type: 'number' })
  async findDormitoryById(ctx: Context) {
    const dormitory = await Dormitory.findOneBy({ id: ctx.request.params.dormitoryId });

    if (!dormitory) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(dormitory);
  }

  @Post()
  @ApiOperationId('createDormitory')
  @ApiOperationSummary('Create a new dormitory.')
  @ApiResponse(400, { description: 'Invalid dormitory.' })
  @ApiResponse(201, { description: 'Dormitory successfully created. Returns the dormitory.' })
  @ValidateBody(dormitorySchema)
  async createDormitory(ctx: Context) {
    const dormitory = await Dormitory.save(ctx.request.body);
    return new HttpResponseCreated(dormitory);
  }

  @Patch('/:dormitoryId')
  @ApiOperationId('modifyDormitory')
  @ApiOperationSummary('Update/modify an existing dormitory.')
  @ApiResponse(400, { description: 'Invalid dormitory.' })
  @ApiResponse(404, { description: 'Dormitory not found.' })
  @ApiResponse(200, { description: 'Dormitory successfully updated. Returns the dormitory.' })
  @ValidatePathParam('dormitoryId', { type: 'number' })
  @ValidateBody({ ...dormitorySchema, required: [] })
  async modifyDormitory(ctx: Context) {
    const dormitory = await Dormitory.findOneBy({ id: ctx.request.params.dormitoryId });

    if (!dormitory) {
      return new HttpResponseNotFound();
    }

    Object.assign(dormitory, ctx.request.body);

    await Dormitory.save(dormitory);

    return new HttpResponseOK(dormitory);
  }

  @Put('/:dormitoryId')
  @ApiOperationId('replaceDormitory')
  @ApiOperationSummary('Update/replace an existing dormitory.')
  @ApiResponse(400, { description: 'Invalid dormitory.' })
  @ApiResponse(404, { description: 'Dormitory not found.' })
  @ApiResponse(200, { description: 'Dormitory successfully updated. Returns the dormitory.' })
  @ValidatePathParam('dormitoryId', { type: 'number' })
  @ValidateBody(dormitorySchema)
  async replaceDormitory(ctx: Context) {
    const dormitory = await Dormitory.findOneBy({ id: ctx.request.params.dormitoryId });

    if (!dormitory) {
      return new HttpResponseNotFound();
    }

    Object.assign(dormitory, ctx.request.body);

    await Dormitory.save(dormitory);

    return new HttpResponseOK(dormitory);
  }

  @Delete('/:dormitoryId')
  @ApiOperationId('deleteDormitory')
  @ApiOperationSummary('Delete a dormitory.')
  @ApiResponse(404, { description: 'Dormitory not found.' })
  @ApiResponse(204, { description: 'Dormitory successfully deleted.' })
  @ValidatePathParam('dormitoryId', { type: 'number' })
  async deleteDormitory(ctx: Context) {
    const dormitory = await Dormitory.findOneBy({ id: ctx.request.params.dormitoryId });

    if (!dormitory) {
      return new HttpResponseNotFound();
    }

    await Dormitory.delete({ id: ctx.request.params.dormitoryId });

    return new HttpResponseNoContent();
  }

}
