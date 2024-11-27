import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK } from '@foal/core';
import { ApplicantController } from './applicant.controller';
import { BuildingController } from './building.controller';
import { DepartmentController } from './department.controller';
import { DormitoryController } from './dormitory.controller';
import { InstituteController } from './institute.controller';
import { StudyDirectionController } from './study-direction.controller';
import { OpenapiController } from './openapi.controller';


@ApiInfo({
  title: 'Application API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
export class ApiController {

  subControllers = [
    controller('/buildings', BuildingController),
    controller('/dormitorys', DormitoryController),
    controller('/institutes', InstituteController),
    controller('/departments', DepartmentController),
    controller('/study-directions', StudyDirectionController),
    controller('/applicants', ApplicantController),
    controller('/swagger', OpenapiController)
  ];

  @Get('/')
  index(ctx: Context) {
    return new HttpResponseOK('Hello world!');
  }

}
