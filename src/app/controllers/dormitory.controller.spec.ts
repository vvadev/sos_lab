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
import { Dormitory } from '../entities';
import { createDataSource } from '../../db';
import { DormitoryController } from './dormitory.controller';

describe('DormitoryController', () => {

  let dataSource: DataSource;
  let controller: DormitoryController;
  let dormitory1: Dormitory;
  let dormitory2: Dormitory;

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
    controller = createController(DormitoryController);

    await Dormitory.clear();
    [ dormitory1, dormitory2 ] = await Dormitory.save([
      {
        text: 'Dormitory 1'
      },
      {
        text: 'Dormitory 2'
      },
    ]);
  });

  describe('has a "findDormitorys" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'findDormitorys'), 'GET');
      strictEqual(getPath(DormitoryController, 'findDormitorys'), undefined);
    });

    it('should return an HttpResponseOK object with the dormitory list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findDormitorys(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of dormitorys.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(dormitory => dormitory.text === dormitory1.text));
      ok(response.body.find(dormitory => dormitory.text === dormitory2.text));
    });

    it('should support pagination', async () => {
      const dormitory3 = await Dormitory.save({
        text: 'Dormitory 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findDormitorys(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(dormitory => dormitory.id === dormitory1.id));
      ok(response.body.find(dormitory => dormitory.id === dormitory2.id));
      ok(!response.body.find(dormitory => dormitory.id === dormitory3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findDormitorys(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(dormitory => dormitory.id === dormitory1.id));
      ok(response.body.find(dormitory => dormitory.id === dormitory2.id));
      ok(response.body.find(dormitory => dormitory.id === dormitory3.id));
    });

  });

  describe('has a "findDormitoryById" method that', () => {

    it('should handle requests at GET /:dormitoryId.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'findDormitoryById'), 'GET');
      strictEqual(getPath(DormitoryController, 'findDormitoryById'), '/:dormitoryId');
    });

    it('should return an HttpResponseOK object if the dormitory was found.', async () => {
      const ctx = new Context({
        params: {
          dormitoryId: dormitory2.id
        }
      });
      const response = await controller.findDormitoryById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, dormitory2.id);
      strictEqual(response.body.text, dormitory2.text);
    });

    it('should return an HttpResponseNotFound object if the dormitory was not found.', async () => {
      const ctx = new Context({
        params: {
          dormitoryId: -1
        }
      });
      const response = await controller.findDormitoryById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createDormitory" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'createDormitory'), 'POST');
      strictEqual(getPath(DormitoryController, 'createDormitory'), undefined);
    });

    it('should create the dormitory in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Dormitory 3',
        }
      });
      const response = await controller.createDormitory(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const dormitory = await Dormitory.findOneBy({ text: 'Dormitory 3' });

      if (!dormitory) {
        throw new Error('No dormitory 3 was found in the database.');
      }

      strictEqual(dormitory.text, 'Dormitory 3');

      strictEqual(response.body.id, dormitory.id);
      strictEqual(response.body.text, dormitory.text);
    });

  });

  describe('has a "modifyDormitory" method that', () => {

    it('should handle requests at PATCH /:dormitoryId.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'modifyDormitory'), 'PATCH');
      strictEqual(getPath(DormitoryController, 'modifyDormitory'), '/:dormitoryId');
    });

    it('should update the dormitory in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Dormitory 2 (version 2)',
        },
        params: {
          dormitoryId: dormitory2.id
        }
      });
      const response = await controller.modifyDormitory(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const dormitory = await Dormitory.findOneBy({ id: dormitory2.id });

      if (!dormitory) {
        throw new Error();
      }

      strictEqual(dormitory.text, 'Dormitory 2 (version 2)');

      strictEqual(response.body.id, dormitory.id);
      strictEqual(response.body.text, dormitory.text);
    });

    it('should not update the other dormitorys.', async () => {
      const ctx = new Context({
        body: {
          text: 'Dormitory 2 (version 2)',
        },
        params: {
          dormitoryId: dormitory2.id
        }
      });
      await controller.modifyDormitory(ctx);

      const dormitory = await Dormitory.findOneBy({ id: dormitory1.id });

      if (!dormitory) {
        throw new Error();
      }

      notStrictEqual(dormitory.text, 'Dormitory 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          dormitoryId: -1
        }
      });
      const response = await controller.modifyDormitory(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceDormitory" method that', () => {

    it('should handle requests at PUT /:dormitoryId.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'replaceDormitory'), 'PUT');
      strictEqual(getPath(DormitoryController, 'replaceDormitory'), '/:dormitoryId');
    });

    it('should update the dormitory in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Dormitory 2 (version 2)',
        },
        params: {
          dormitoryId: dormitory2.id
        }
      });
      const response = await controller.replaceDormitory(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const dormitory = await Dormitory.findOneBy({ id: dormitory2.id });

      if (!dormitory) {
        throw new Error();
      }

      strictEqual(dormitory.text, 'Dormitory 2 (version 2)');

      strictEqual(response.body.id, dormitory.id);
      strictEqual(response.body.text, dormitory.text);
    });

    it('should not update the other dormitorys.', async () => {
      const ctx = new Context({
        body: {
          text: 'Dormitory 2 (version 2)',
        },
        params: {
          dormitoryId: dormitory2.id
        }
      });
      await controller.replaceDormitory(ctx);

      const dormitory = await Dormitory.findOneBy({ id: dormitory1.id });

      if (!dormitory) {
        throw new Error();
      }

      notStrictEqual(dormitory.text, 'Dormitory 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          dormitoryId: -1
        }
      });
      const response = await controller.replaceDormitory(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteDormitory" method that', () => {

    it('should handle requests at DELETE /:dormitoryId.', () => {
      strictEqual(getHttpMethod(DormitoryController, 'deleteDormitory'), 'DELETE');
      strictEqual(getPath(DormitoryController, 'deleteDormitory'), '/:dormitoryId');
    });

    it('should delete the dormitory and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          dormitoryId: dormitory2.id
        }
      });
      const response = await controller.deleteDormitory(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const dormitory = await Dormitory.findOneBy({ id: dormitory2.id });

      strictEqual(dormitory, null);
    });

    it('should not delete the other dormitorys.', async () => {
      const ctx = new Context({
        params: {
          dormitoryId: dormitory2.id
        }
      });
      const response = await controller.deleteDormitory(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const dormitory = await Dormitory.findOneBy({ id: dormitory1.id });

      notStrictEqual(dormitory, null);
    });

    it('should return an HttpResponseNotFound if the dormitory was not found.', async () => {
      const ctx = new Context({
        params: {
          dormitoryId: -1
        }
      });
      const response = await controller.deleteDormitory(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
