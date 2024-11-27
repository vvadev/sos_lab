// std
import { notStrictEqual, ok, strictEqual } from 'assert';

// 3p
import {
  Context, createController, getHttpMethod, getPath,
  isHttpResponseCreated, isHttpResponseNoContent,
  isHttpResponseNotFound, isHttpResponseOK
} from '@foal/core';
import { DataSource } from 'typeorm';

// App
import { Institute } from '../entities';
import { createDataSource } from '../../db';
import { InstituteController } from './institute.controller';

describe('InstituteController', () => {

  let dataSource: DataSource;
  let controller: InstituteController;
  let institute1: Institute;
  let institute2: Institute;

  before(async () => {
    dataSource = createDataSource();
    await dataSource.initialize();
  });

  after(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    controller = createController(InstituteController);

    await Institute.clear();
    [ institute1, institute2 ] = await Institute.save([
      {
        text: 'Institute 1'
      },
      {
        text: 'Institute 2'
      },
    ]);
  });

  describe('has a "findInstitutes" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(InstituteController, 'findInstitutes'), 'GET');
      strictEqual(getPath(InstituteController, 'findInstitutes'), undefined);
    });

    it('should return an HttpResponseOK object with the institute list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findInstitutes(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of institutes.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(institute => institute.text === institute1.text));
      ok(response.body.find(institute => institute.text === institute2.text));
    });

    it('should support pagination', async () => {
      const institute3 = await Institute.save({
        text: 'Institute 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findInstitutes(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(institute => institute.id === institute1.id));
      ok(response.body.find(institute => institute.id === institute2.id));
      ok(!response.body.find(institute => institute.id === institute3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findInstitutes(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(institute => institute.id === institute1.id));
      ok(response.body.find(institute => institute.id === institute2.id));
      ok(response.body.find(institute => institute.id === institute3.id));
    });

  });

  describe('has a "findInstituteById" method that', () => {

    it('should handle requests at GET /:instituteId.', () => {
      strictEqual(getHttpMethod(InstituteController, 'findInstituteById'), 'GET');
      strictEqual(getPath(InstituteController, 'findInstituteById'), '/:instituteId');
    });

    it('should return an HttpResponseOK object if the institute was found.', async () => {
      const ctx = new Context({
        params: {
          instituteId: institute2.id
        }
      });
      const response = await controller.findInstituteById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, institute2.id);
      strictEqual(response.body.text, institute2.text);
    });

    it('should return an HttpResponseNotFound object if the institute was not found.', async () => {
      const ctx = new Context({
        params: {
          instituteId: -1
        }
      });
      const response = await controller.findInstituteById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createInstitute" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(InstituteController, 'createInstitute'), 'POST');
      strictEqual(getPath(InstituteController, 'createInstitute'), undefined);
    });

    it('should create the institute in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Institute 3',
        }
      });
      const response = await controller.createInstitute(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const institute = await Institute.findOneBy({ text: 'Institute 3' });

      if (!institute) {
        throw new Error('No institute 3 was found in the database.');
      }

      strictEqual(institute.text, 'Institute 3');

      strictEqual(response.body.id, institute.id);
      strictEqual(response.body.text, institute.text);
    });

  });

  describe('has a "modifyInstitute" method that', () => {

    it('should handle requests at PATCH /:instituteId.', () => {
      strictEqual(getHttpMethod(InstituteController, 'modifyInstitute'), 'PATCH');
      strictEqual(getPath(InstituteController, 'modifyInstitute'), '/:instituteId');
    });

    it('should update the institute in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Institute 2 (version 2)',
        },
        params: {
          instituteId: institute2.id
        }
      });
      const response = await controller.modifyInstitute(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const institute = await Institute.findOneBy({ id: institute2.id });

      if (!institute) {
        throw new Error();
      }

      strictEqual(institute.text, 'Institute 2 (version 2)');

      strictEqual(response.body.id, institute.id);
      strictEqual(response.body.text, institute.text);
    });

    it('should not update the other institutes.', async () => {
      const ctx = new Context({
        body: {
          text: 'Institute 2 (version 2)',
        },
        params: {
          instituteId: institute2.id
        }
      });
      await controller.modifyInstitute(ctx);

      const institute = await Institute.findOneBy({ id: institute1.id });

      if (!institute) {
        throw new Error();
      }

      notStrictEqual(institute.text, 'Institute 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          instituteId: -1
        }
      });
      const response = await controller.modifyInstitute(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceInstitute" method that', () => {

    it('should handle requests at PUT /:instituteId.', () => {
      strictEqual(getHttpMethod(InstituteController, 'replaceInstitute'), 'PUT');
      strictEqual(getPath(InstituteController, 'replaceInstitute'), '/:instituteId');
    });

    it('should update the institute in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Institute 2 (version 2)',
        },
        params: {
          instituteId: institute2.id
        }
      });
      const response = await controller.replaceInstitute(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const institute = await Institute.findOneBy({ id: institute2.id });

      if (!institute) {
        throw new Error();
      }

      strictEqual(institute.text, 'Institute 2 (version 2)');

      strictEqual(response.body.id, institute.id);
      strictEqual(response.body.text, institute.text);
    });

    it('should not update the other institutes.', async () => {
      const ctx = new Context({
        body: {
          text: 'Institute 2 (version 2)',
        },
        params: {
          instituteId: institute2.id
        }
      });
      await controller.replaceInstitute(ctx);

      const institute = await Institute.findOneBy({ id: institute1.id });

      if (!institute) {
        throw new Error();
      }

      notStrictEqual(institute.text, 'Institute 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          instituteId: -1
        }
      });
      const response = await controller.replaceInstitute(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteInstitute" method that', () => {

    it('should handle requests at DELETE /:instituteId.', () => {
      strictEqual(getHttpMethod(InstituteController, 'deleteInstitute'), 'DELETE');
      strictEqual(getPath(InstituteController, 'deleteInstitute'), '/:instituteId');
    });

    it('should delete the institute and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          instituteId: institute2.id
        }
      });
      const response = await controller.deleteInstitute(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const institute = await Institute.findOneBy({ id: institute2.id });

      strictEqual(institute, null);
    });

    it('should not delete the other institutes.', async () => {
      const ctx = new Context({
        params: {
          instituteId: institute2.id
        }
      });
      const response = await controller.deleteInstitute(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const institute = await Institute.findOneBy({ id: institute1.id });

      notStrictEqual(institute, null);
    });

    it('should return an HttpResponseNotFound if the institute was not found.', async () => {
      const ctx = new Context({
        params: {
          instituteId: -1
        }
      });
      const response = await controller.deleteInstitute(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
