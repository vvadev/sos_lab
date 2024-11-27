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
import { Department } from '../entities';
import { createDataSource } from '../../db';
import { DepartmentController } from './department.controller';

describe('DepartmentController', () => {

  let dataSource: DataSource;
  let controller: DepartmentController;
  let department1: Department;
  let department2: Department;

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
    controller = createController(DepartmentController);

    await Department.clear();
    [ department1, department2 ] = await Department.save([
      {
        text: 'Department 1'
      },
      {
        text: 'Department 2'
      },
    ]);
  });

  describe('has a "findDepartments" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'findDepartments'), 'GET');
      strictEqual(getPath(DepartmentController, 'findDepartments'), undefined);
    });

    it('should return an HttpResponseOK object with the department list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findDepartments(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of departments.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(department => department.text === department1.text));
      ok(response.body.find(department => department.text === department2.text));
    });

    it('should support pagination', async () => {
      const department3 = await Department.save({
        text: 'Department 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findDepartments(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(department => department.id === department1.id));
      ok(response.body.find(department => department.id === department2.id));
      ok(!response.body.find(department => department.id === department3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findDepartments(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(department => department.id === department1.id));
      ok(response.body.find(department => department.id === department2.id));
      ok(response.body.find(department => department.id === department3.id));
    });

  });

  describe('has a "findDepartmentById" method that', () => {

    it('should handle requests at GET /:departmentId.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'findDepartmentById'), 'GET');
      strictEqual(getPath(DepartmentController, 'findDepartmentById'), '/:departmentId');
    });

    it('should return an HttpResponseOK object if the department was found.', async () => {
      const ctx = new Context({
        params: {
          departmentId: department2.id
        }
      });
      const response = await controller.findDepartmentById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, department2.id);
      strictEqual(response.body.text, department2.text);
    });

    it('should return an HttpResponseNotFound object if the department was not found.', async () => {
      const ctx = new Context({
        params: {
          departmentId: -1
        }
      });
      const response = await controller.findDepartmentById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createDepartment" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'createDepartment'), 'POST');
      strictEqual(getPath(DepartmentController, 'createDepartment'), undefined);
    });

    it('should create the department in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Department 3',
        }
      });
      const response = await controller.createDepartment(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const department = await Department.findOneBy({ text: 'Department 3' });

      if (!department) {
        throw new Error('No department 3 was found in the database.');
      }

      strictEqual(department.text, 'Department 3');

      strictEqual(response.body.id, department.id);
      strictEqual(response.body.text, department.text);
    });

  });

  describe('has a "modifyDepartment" method that', () => {

    it('should handle requests at PATCH /:departmentId.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'modifyDepartment'), 'PATCH');
      strictEqual(getPath(DepartmentController, 'modifyDepartment'), '/:departmentId');
    });

    it('should update the department in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Department 2 (version 2)',
        },
        params: {
          departmentId: department2.id
        }
      });
      const response = await controller.modifyDepartment(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const department = await Department.findOneBy({ id: department2.id });

      if (!department) {
        throw new Error();
      }

      strictEqual(department.text, 'Department 2 (version 2)');

      strictEqual(response.body.id, department.id);
      strictEqual(response.body.text, department.text);
    });

    it('should not update the other departments.', async () => {
      const ctx = new Context({
        body: {
          text: 'Department 2 (version 2)',
        },
        params: {
          departmentId: department2.id
        }
      });
      await controller.modifyDepartment(ctx);

      const department = await Department.findOneBy({ id: department1.id });

      if (!department) {
        throw new Error();
      }

      notStrictEqual(department.text, 'Department 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          departmentId: -1
        }
      });
      const response = await controller.modifyDepartment(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceDepartment" method that', () => {

    it('should handle requests at PUT /:departmentId.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'replaceDepartment'), 'PUT');
      strictEqual(getPath(DepartmentController, 'replaceDepartment'), '/:departmentId');
    });

    it('should update the department in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Department 2 (version 2)',
        },
        params: {
          departmentId: department2.id
        }
      });
      const response = await controller.replaceDepartment(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const department = await Department.findOneBy({ id: department2.id });

      if (!department) {
        throw new Error();
      }

      strictEqual(department.text, 'Department 2 (version 2)');

      strictEqual(response.body.id, department.id);
      strictEqual(response.body.text, department.text);
    });

    it('should not update the other departments.', async () => {
      const ctx = new Context({
        body: {
          text: 'Department 2 (version 2)',
        },
        params: {
          departmentId: department2.id
        }
      });
      await controller.replaceDepartment(ctx);

      const department = await Department.findOneBy({ id: department1.id });

      if (!department) {
        throw new Error();
      }

      notStrictEqual(department.text, 'Department 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          departmentId: -1
        }
      });
      const response = await controller.replaceDepartment(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteDepartment" method that', () => {

    it('should handle requests at DELETE /:departmentId.', () => {
      strictEqual(getHttpMethod(DepartmentController, 'deleteDepartment'), 'DELETE');
      strictEqual(getPath(DepartmentController, 'deleteDepartment'), '/:departmentId');
    });

    it('should delete the department and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          departmentId: department2.id
        }
      });
      const response = await controller.deleteDepartment(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const department = await Department.findOneBy({ id: department2.id });

      strictEqual(department, null);
    });

    it('should not delete the other departments.', async () => {
      const ctx = new Context({
        params: {
          departmentId: department2.id
        }
      });
      const response = await controller.deleteDepartment(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const department = await Department.findOneBy({ id: department1.id });

      notStrictEqual(department, null);
    });

    it('should return an HttpResponseNotFound if the department was not found.', async () => {
      const ctx = new Context({
        params: {
          departmentId: -1
        }
      });
      const response = await controller.deleteDepartment(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
