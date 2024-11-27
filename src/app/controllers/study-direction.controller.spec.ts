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
import { StudyDirection } from '../entities';
import { createDataSource } from '../../db';
import { StudyDirectionController } from './study-direction.controller';

describe('StudyDirectionController', () => {

  let dataSource: DataSource;
  let controller: StudyDirectionController;
  let studyDirection1: StudyDirection;
  let studyDirection2: StudyDirection;

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
    controller = createController(StudyDirectionController);

    await StudyDirection.clear();
    [ studyDirection1, studyDirection2 ] = await StudyDirection.save([
      {
        text: 'StudyDirection 1'
      },
      {
        text: 'StudyDirection 2'
      },
    ]);
  });

  describe('has a "findStudyDirections" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'findStudyDirections'), 'GET');
      strictEqual(getPath(StudyDirectionController, 'findStudyDirections'), undefined);
    });

    it('should return an HttpResponseOK object with the studyDirection list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findStudyDirections(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of studyDirections.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(studyDirection => studyDirection.text === studyDirection1.text));
      ok(response.body.find(studyDirection => studyDirection.text === studyDirection2.text));
    });

    it('should support pagination', async () => {
      const studyDirection3 = await StudyDirection.save({
        text: 'StudyDirection 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findStudyDirections(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(studyDirection => studyDirection.id === studyDirection1.id));
      ok(response.body.find(studyDirection => studyDirection.id === studyDirection2.id));
      ok(!response.body.find(studyDirection => studyDirection.id === studyDirection3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findStudyDirections(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(studyDirection => studyDirection.id === studyDirection1.id));
      ok(response.body.find(studyDirection => studyDirection.id === studyDirection2.id));
      ok(response.body.find(studyDirection => studyDirection.id === studyDirection3.id));
    });

  });

  describe('has a "findStudyDirectionById" method that', () => {

    it('should handle requests at GET /:studyDirectionId.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'findStudyDirectionById'), 'GET');
      strictEqual(getPath(StudyDirectionController, 'findStudyDirectionById'), '/:studyDirectionId');
    });

    it('should return an HttpResponseOK object if the studyDirection was found.', async () => {
      const ctx = new Context({
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      const response = await controller.findStudyDirectionById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, studyDirection2.id);
      strictEqual(response.body.text, studyDirection2.text);
    });

    it('should return an HttpResponseNotFound object if the studyDirection was not found.', async () => {
      const ctx = new Context({
        params: {
          studyDirectionId: -1
        }
      });
      const response = await controller.findStudyDirectionById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createStudyDirection" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'createStudyDirection'), 'POST');
      strictEqual(getPath(StudyDirectionController, 'createStudyDirection'), undefined);
    });

    it('should create the studyDirection in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'StudyDirection 3',
        }
      });
      const response = await controller.createStudyDirection(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const studyDirection = await StudyDirection.findOneBy({ text: 'StudyDirection 3' });

      if (!studyDirection) {
        throw new Error('No studyDirection 3 was found in the database.');
      }

      strictEqual(studyDirection.text, 'StudyDirection 3');

      strictEqual(response.body.id, studyDirection.id);
      strictEqual(response.body.text, studyDirection.text);
    });

  });

  describe('has a "modifyStudyDirection" method that', () => {

    it('should handle requests at PATCH /:studyDirectionId.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'modifyStudyDirection'), 'PATCH');
      strictEqual(getPath(StudyDirectionController, 'modifyStudyDirection'), '/:studyDirectionId');
    });

    it('should update the studyDirection in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'StudyDirection 2 (version 2)',
        },
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      const response = await controller.modifyStudyDirection(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection2.id });

      if (!studyDirection) {
        throw new Error();
      }

      strictEqual(studyDirection.text, 'StudyDirection 2 (version 2)');

      strictEqual(response.body.id, studyDirection.id);
      strictEqual(response.body.text, studyDirection.text);
    });

    it('should not update the other studyDirections.', async () => {
      const ctx = new Context({
        body: {
          text: 'StudyDirection 2 (version 2)',
        },
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      await controller.modifyStudyDirection(ctx);

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection1.id });

      if (!studyDirection) {
        throw new Error();
      }

      notStrictEqual(studyDirection.text, 'StudyDirection 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          studyDirectionId: -1
        }
      });
      const response = await controller.modifyStudyDirection(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceStudyDirection" method that', () => {

    it('should handle requests at PUT /:studyDirectionId.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'replaceStudyDirection'), 'PUT');
      strictEqual(getPath(StudyDirectionController, 'replaceStudyDirection'), '/:studyDirectionId');
    });

    it('should update the studyDirection in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'StudyDirection 2 (version 2)',
        },
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      const response = await controller.replaceStudyDirection(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection2.id });

      if (!studyDirection) {
        throw new Error();
      }

      strictEqual(studyDirection.text, 'StudyDirection 2 (version 2)');

      strictEqual(response.body.id, studyDirection.id);
      strictEqual(response.body.text, studyDirection.text);
    });

    it('should not update the other studyDirections.', async () => {
      const ctx = new Context({
        body: {
          text: 'StudyDirection 2 (version 2)',
        },
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      await controller.replaceStudyDirection(ctx);

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection1.id });

      if (!studyDirection) {
        throw new Error();
      }

      notStrictEqual(studyDirection.text, 'StudyDirection 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          studyDirectionId: -1
        }
      });
      const response = await controller.replaceStudyDirection(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteStudyDirection" method that', () => {

    it('should handle requests at DELETE /:studyDirectionId.', () => {
      strictEqual(getHttpMethod(StudyDirectionController, 'deleteStudyDirection'), 'DELETE');
      strictEqual(getPath(StudyDirectionController, 'deleteStudyDirection'), '/:studyDirectionId');
    });

    it('should delete the studyDirection and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      const response = await controller.deleteStudyDirection(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection2.id });

      strictEqual(studyDirection, null);
    });

    it('should not delete the other studyDirections.', async () => {
      const ctx = new Context({
        params: {
          studyDirectionId: studyDirection2.id
        }
      });
      const response = await controller.deleteStudyDirection(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const studyDirection = await StudyDirection.findOneBy({ id: studyDirection1.id });

      notStrictEqual(studyDirection, null);
    });

    it('should return an HttpResponseNotFound if the studyDirection was not found.', async () => {
      const ctx = new Context({
        params: {
          studyDirectionId: -1
        }
      });
      const response = await controller.deleteStudyDirection(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
