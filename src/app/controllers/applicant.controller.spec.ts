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
import { Applicant } from '../entities';
import { createDataSource } from '../../db';
import { ApplicantController } from './applicant.controller';

describe('ApplicantController', () => {

  let dataSource: DataSource;
  let controller: ApplicantController;
  let applicant1: Applicant;
  let applicant2: Applicant;

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
    controller = createController(ApplicantController);

    await Applicant.clear();
    [ applicant1, applicant2 ] = await Applicant.save([
      {
        text: 'Applicant 1'
      },
      {
        text: 'Applicant 2'
      },
    ]);
  });

  describe('has a "findApplicants" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'findApplicants'), 'GET');
      strictEqual(getPath(ApplicantController, 'findApplicants'), undefined);
    });

    it('should return an HttpResponseOK object with the applicant list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findApplicants(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of applicants.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(applicant => applicant.text === applicant1.text));
      ok(response.body.find(applicant => applicant.text === applicant2.text));
    });

    it('should support pagination', async () => {
      const applicant3 = await Applicant.save({
        text: 'Applicant 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findApplicants(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(applicant => applicant.id === applicant1.id));
      ok(response.body.find(applicant => applicant.id === applicant2.id));
      ok(!response.body.find(applicant => applicant.id === applicant3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findApplicants(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(applicant => applicant.id === applicant1.id));
      ok(response.body.find(applicant => applicant.id === applicant2.id));
      ok(response.body.find(applicant => applicant.id === applicant3.id));
    });

  });

  describe('has a "findApplicantById" method that', () => {

    it('should handle requests at GET /:applicantId.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'findApplicantById'), 'GET');
      strictEqual(getPath(ApplicantController, 'findApplicantById'), '/:applicantId');
    });

    it('should return an HttpResponseOK object if the applicant was found.', async () => {
      const ctx = new Context({
        params: {
          applicantId: applicant2.id
        }
      });
      const response = await controller.findApplicantById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, applicant2.id);
      strictEqual(response.body.text, applicant2.text);
    });

    it('should return an HttpResponseNotFound object if the applicant was not found.', async () => {
      const ctx = new Context({
        params: {
          applicantId: -1
        }
      });
      const response = await controller.findApplicantById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createApplicant" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'createApplicant'), 'POST');
      strictEqual(getPath(ApplicantController, 'createApplicant'), undefined);
    });

    it('should create the applicant in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Applicant 3',
        }
      });
      const response = await controller.createApplicant(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const applicant = await Applicant.findOneBy({ text: 'Applicant 3' });

      if (!applicant) {
        throw new Error('No applicant 3 was found in the database.');
      }

      strictEqual(applicant.text, 'Applicant 3');

      strictEqual(response.body.id, applicant.id);
      strictEqual(response.body.text, applicant.text);
    });

  });

  describe('has a "modifyApplicant" method that', () => {

    it('should handle requests at PATCH /:applicantId.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'modifyApplicant'), 'PATCH');
      strictEqual(getPath(ApplicantController, 'modifyApplicant'), '/:applicantId');
    });

    it('should update the applicant in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Applicant 2 (version 2)',
        },
        params: {
          applicantId: applicant2.id
        }
      });
      const response = await controller.modifyApplicant(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const applicant = await Applicant.findOneBy({ id: applicant2.id });

      if (!applicant) {
        throw new Error();
      }

      strictEqual(applicant.text, 'Applicant 2 (version 2)');

      strictEqual(response.body.id, applicant.id);
      strictEqual(response.body.text, applicant.text);
    });

    it('should not update the other applicants.', async () => {
      const ctx = new Context({
        body: {
          text: 'Applicant 2 (version 2)',
        },
        params: {
          applicantId: applicant2.id
        }
      });
      await controller.modifyApplicant(ctx);

      const applicant = await Applicant.findOneBy({ id: applicant1.id });

      if (!applicant) {
        throw new Error();
      }

      notStrictEqual(applicant.text, 'Applicant 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          applicantId: -1
        }
      });
      const response = await controller.modifyApplicant(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceApplicant" method that', () => {

    it('should handle requests at PUT /:applicantId.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'replaceApplicant'), 'PUT');
      strictEqual(getPath(ApplicantController, 'replaceApplicant'), '/:applicantId');
    });

    it('should update the applicant in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Applicant 2 (version 2)',
        },
        params: {
          applicantId: applicant2.id
        }
      });
      const response = await controller.replaceApplicant(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const applicant = await Applicant.findOneBy({ id: applicant2.id });

      if (!applicant) {
        throw new Error();
      }

      strictEqual(applicant.text, 'Applicant 2 (version 2)');

      strictEqual(response.body.id, applicant.id);
      strictEqual(response.body.text, applicant.text);
    });

    it('should not update the other applicants.', async () => {
      const ctx = new Context({
        body: {
          text: 'Applicant 2 (version 2)',
        },
        params: {
          applicantId: applicant2.id
        }
      });
      await controller.replaceApplicant(ctx);

      const applicant = await Applicant.findOneBy({ id: applicant1.id });

      if (!applicant) {
        throw new Error();
      }

      notStrictEqual(applicant.text, 'Applicant 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          applicantId: -1
        }
      });
      const response = await controller.replaceApplicant(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteApplicant" method that', () => {

    it('should handle requests at DELETE /:applicantId.', () => {
      strictEqual(getHttpMethod(ApplicantController, 'deleteApplicant'), 'DELETE');
      strictEqual(getPath(ApplicantController, 'deleteApplicant'), '/:applicantId');
    });

    it('should delete the applicant and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          applicantId: applicant2.id
        }
      });
      const response = await controller.deleteApplicant(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const applicant = await Applicant.findOneBy({ id: applicant2.id });

      strictEqual(applicant, null);
    });

    it('should not delete the other applicants.', async () => {
      const ctx = new Context({
        params: {
          applicantId: applicant2.id
        }
      });
      const response = await controller.deleteApplicant(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const applicant = await Applicant.findOneBy({ id: applicant1.id });

      notStrictEqual(applicant, null);
    });

    it('should return an HttpResponseNotFound if the applicant was not found.', async () => {
      const ctx = new Context({
        params: {
          applicantId: -1
        }
      });
      const response = await controller.deleteApplicant(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
