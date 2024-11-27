import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { Department } from '../entities';

const departmentSchema = {
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    instituteId: { type: 'number' },
  },
  required: [
    'name',
    'instituteId',
  ],
  type: 'object',
};

@ApiUseTag('department')
export class DepartmentController {

  @Get()
  @ApiOperationId('findDepartments')
  @ApiOperationSummary('Find departments.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of departments.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findDepartments(ctx: Context) {
    const departments = await Department.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(departments);
  }

  @Get('/:departmentId')
  @ApiOperationId('findDepartmentById')
  @ApiOperationSummary('Find a department by ID.')
  @ApiResponse(404, { description: 'Department not found.' })
  @ApiResponse(200, { description: 'Returns the department.' })
  @ValidatePathParam('departmentId', { type: 'number' })
  async findDepartmentById(ctx: Context) {
    const department = await Department.findOneBy({ id: ctx.request.params.departmentId });

    if (!department) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(department);
  }

  @Post()
  @ApiOperationId('createDepartment')
  @ApiOperationSummary('Create a new department.')
  @ApiResponse(400, { description: 'Invalid department.' })
  @ApiResponse(201, { description: 'Department successfully created. Returns the department.' })
  @ValidateBody(departmentSchema)
  async createDepartment(ctx: Context) {
    const department = await Department.save(ctx.request.body);
    return new HttpResponseCreated(department);
  }

  @Patch('/:departmentId')
  @ApiOperationId('modifyDepartment')
  @ApiOperationSummary('Update/modify an existing department.')
  @ApiResponse(400, { description: 'Invalid department.' })
  @ApiResponse(404, { description: 'Department not found.' })
  @ApiResponse(200, { description: 'Department successfully updated. Returns the department.' })
  @ValidatePathParam('departmentId', { type: 'number' })
  @ValidateBody({ ...departmentSchema, required: [] })
  async modifyDepartment(ctx: Context) {
    const department = await Department.findOneBy({ id: ctx.request.params.departmentId });

    if (!department) {
      return new HttpResponseNotFound();
    }

    Object.assign(department, ctx.request.body);

    await Department.save(department);

    return new HttpResponseOK(department);
  }

  @Put('/:departmentId')
  @ApiOperationId('replaceDepartment')
  @ApiOperationSummary('Update/replace an existing department.')
  @ApiResponse(400, { description: 'Invalid department.' })
  @ApiResponse(404, { description: 'Department not found.' })
  @ApiResponse(200, { description: 'Department successfully updated. Returns the department.' })
  @ValidatePathParam('departmentId', { type: 'number' })
  @ValidateBody(departmentSchema)
  async replaceDepartment(ctx: Context) {
    const department = await Department.findOneBy({ id: ctx.request.params.departmentId });

    if (!department) {
      return new HttpResponseNotFound();
    }

    Object.assign(department, ctx.request.body);

    await Department.save(department);

    return new HttpResponseOK(department);
  }

  @Delete('/:departmentId')
  @ApiOperationId('deleteDepartment')
  @ApiOperationSummary('Delete a department.')
  @ApiResponse(404, { description: 'Department not found.' })
  @ApiResponse(204, { description: 'Department successfully deleted.' })
  @ValidatePathParam('departmentId', { type: 'number' })
  async deleteDepartment(ctx: Context) {
    const department = await Department.findOneBy({ id: ctx.request.params.departmentId });

    if (!department) {
      return new HttpResponseNotFound();
    }

    await Department.delete({ id: ctx.request.params.departmentId });

    return new HttpResponseNoContent();
  }

}
