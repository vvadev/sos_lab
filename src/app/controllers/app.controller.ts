import { controller, IAppController } from '@foal/core';
import { ApiController } from './api.controller';
import { OpenapiController } from './openapi.controller';

export class AppController implements IAppController {
  subControllers = [
    controller('/api', ApiController),
    controller('/swagger', OpenapiController)
  ];
}
