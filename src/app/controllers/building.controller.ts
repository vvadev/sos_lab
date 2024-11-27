import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { Building } from '../entities';

const buildingSchema = {
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

@ApiUseTag('building')
export class BuildingController {

  @Get()
  @ApiOperationId('findBuildings')
  @ApiOperationSummary('Find buildings.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of buildings.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findBuildings(ctx: Context) {
    const buildings = await Building.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(buildings);
  }

  @Get('/:buildingId')
  @ApiOperationId('findBuildingById')
  @ApiOperationSummary('Find a building by ID.')
  @ApiResponse(404, { description: 'Building not found.' })
  @ApiResponse(200, { description: 'Returns the building.' })
  @ValidatePathParam('buildingId', { type: 'number' })
  async findBuildingById(ctx: Context) {
    const building = await Building.findOneBy({ id: ctx.request.params.buildingId });

    if (!building) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(building);
  }

  @Post()
  @ApiOperationId('createBuilding')
  @ApiOperationSummary('Create a new building.')
  @ApiResponse(400, { description: 'Invalid building.' })
  @ApiResponse(201, { description: 'Building successfully created. Returns the building.' })
  @ValidateBody(buildingSchema)
  async createBuilding(ctx: Context) {
    const building = await Building.save(ctx.request.body);
    return new HttpResponseCreated(building);
  }

  @Patch('/:buildingId')
  @ApiOperationId('modifyBuilding')
  @ApiOperationSummary('Update/modify an existing building.')
  @ApiResponse(400, { description: 'Invalid building.' })
  @ApiResponse(404, { description: 'Building not found.' })
  @ApiResponse(200, { description: 'Building successfully updated. Returns the building.' })
  @ValidatePathParam('buildingId', { type: 'number' })
  @ValidateBody({ ...buildingSchema, required: [] })
  async modifyBuilding(ctx: Context) {
    const building = await Building.findOneBy({ id: ctx.request.params.buildingId });

    if (!building) {
      return new HttpResponseNotFound();
    }

    Object.assign(building, ctx.request.body);

    await Building.save(building);

    return new HttpResponseOK(building);
  }

  @Put('/:buildingId')
  @ApiOperationId('replaceBuilding')
  @ApiOperationSummary('Update/replace an existing building.')
  @ApiResponse(400, { description: 'Invalid building.' })
  @ApiResponse(404, { description: 'Building not found.' })
  @ApiResponse(200, { description: 'Building successfully updated. Returns the building.' })
  @ValidatePathParam('buildingId', { type: 'number' })
  @ValidateBody(buildingSchema)
  async replaceBuilding(ctx: Context) {
    const building = await Building.findOneBy({ id: ctx.request.params.buildingId });

    if (!building) {
      return new HttpResponseNotFound();
    }

    Object.assign(building, ctx.request.body);

    await Building.save(building);

    return new HttpResponseOK(building);
  }

  @Delete('/:buildingId')
  @ApiOperationId('deleteBuilding')
  @ApiOperationSummary('Delete a building.')
  @ApiResponse(404, { description: 'Building not found.' })
  @ApiResponse(204, { description: 'Building successfully deleted.' })
  @ValidatePathParam('buildingId', { type: 'number' })
  async deleteBuilding(ctx: Context) {
    const building = await Building.findOneBy({ id: ctx.request.params.buildingId });

    if (!building) {
      return new HttpResponseNotFound();
    }

    await Building.delete({ id: ctx.request.params.buildingId });

    return new HttpResponseNoContent();
  }

}
