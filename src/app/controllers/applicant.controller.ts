import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';

import { Applicant } from '../entities';

const applicantSchema = {
  additionalProperties: false,
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    studyDirectionId: { type: 'number' },
    instituteId: { type: 'number' },
  },
  required: [
    'firstName',
    'lastName',
    'email',
    'phone',
    'studyDirectionId',
    'instituteId',
  ],
  type: 'object',
};

@ApiUseTag('applicant')
export class ApplicantController {

  @Get()
  @ApiOperationId('findApplicants')
  @ApiOperationSummary('Find applicants.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of applicants.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findApplicants(ctx: Context) {
    const applicants = await Applicant.find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(applicants);
  }

  @Get('/:applicantId')
  @ApiOperationId('findApplicantById')
  @ApiOperationSummary('Find a applicant by ID.')
  @ApiResponse(404, { description: 'Applicant not found.' })
  @ApiResponse(200, { description: 'Returns the applicant.' })
  @ValidatePathParam('applicantId', { type: 'number' })
  async findApplicantById(ctx: Context) {
    const applicant = await Applicant.findOneBy({ id: ctx.request.params.applicantId });

    if (!applicant) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(applicant);
  }

  @Post()
  @ApiOperationId('createApplicant')
  @ApiOperationSummary('Create a new applicant.')
  @ApiResponse(400, { description: 'Invalid applicant.' })
  @ApiResponse(201, { description: 'Applicant successfully created. Returns the applicant.' })
  @ValidateBody(applicantSchema)
  async createApplicant(ctx: Context) {
    const applicant = await Applicant.save(ctx.request.body);
    return new HttpResponseCreated(applicant);
  }

  @Patch('/:applicantId')
  @ApiOperationId('modifyApplicant')
  @ApiOperationSummary('Update/modify an existing applicant.')
  @ApiResponse(400, { description: 'Invalid applicant.' })
  @ApiResponse(404, { description: 'Applicant not found.' })
  @ApiResponse(200, { description: 'Applicant successfully updated. Returns the applicant.' })
  @ValidatePathParam('applicantId', { type: 'number' })
  @ValidateBody({ ...applicantSchema, required: [] })
  async modifyApplicant(ctx: Context) {
    const applicant = await Applicant.findOneBy({ id: ctx.request.params.applicantId });

    if (!applicant) {
      return new HttpResponseNotFound();
    }

    Object.assign(applicant, ctx.request.body);

    await Applicant.save(applicant);

    return new HttpResponseOK(applicant);
  }

  @Put('/:applicantId')
  @ApiOperationId('replaceApplicant')
  @ApiOperationSummary('Update/replace an existing applicant.')
  @ApiResponse(400, { description: 'Invalid applicant.' })
  @ApiResponse(404, { description: 'Applicant not found.' })
  @ApiResponse(200, { description: 'Applicant successfully updated. Returns the applicant.' })
  @ValidatePathParam('applicantId', { type: 'number' })
  @ValidateBody(applicantSchema)
  async replaceApplicant(ctx: Context) {
    const applicant = await Applicant.findOneBy({ id: ctx.request.params.applicantId });

    if (!applicant) {
      return new HttpResponseNotFound();
    }

    Object.assign(applicant, ctx.request.body);

    await Applicant.save(applicant);

    return new HttpResponseOK(applicant);
  }

  @Delete('/:applicantId')
  @ApiOperationId('deleteApplicant')
  @ApiOperationSummary('Delete a applicant.')
  @ApiResponse(404, { description: 'Applicant not found.' })
  @ApiResponse(204, { description: 'Applicant successfully deleted.' })
  @ValidatePathParam('applicantId', { type: 'number' })
  async deleteApplicant(ctx: Context) {
    const applicant = await Applicant.findOneBy({ id: ctx.request.params.applicantId });

    if (!applicant) {
      return new HttpResponseNotFound();
    }

    await Applicant.delete({ id: ctx.request.params.applicantId });

    return new HttpResponseNoContent();
  }

}
