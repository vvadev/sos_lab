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
import { Building } from '../entities';
import { createDataSource } from '../../db';
import { BuildingController } from './building.controller';

describe('BuildingController', () => {

  let dataSource: DataSource;
  let controller: BuildingController;
  let building1: Building;
  let building2: Building;

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
    controller = createController(BuildingController);

    await Building.clear();
    [ building1, building2 ] = await Building.save([
      {
        text: 'Building 1'
      },
      {
        text: 'Building 2'
      },
    ]);
  });

  describe('has a "findBuildings" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(BuildingController, 'findBuildings'), 'GET');
      strictEqual(getPath(BuildingController, 'findBuildings'), undefined);
    });

    it('should return an HttpResponseOK object with the building list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findBuildings(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of buildings.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(building => building.text === building1.text));
      ok(response.body.find(building => building.text === building2.text));
    });

    it('should support pagination', async () => {
      const building3 = await Building.save({
        text: 'Building 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findBuildings(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(building => building.id === building1.id));
      ok(response.body.find(building => building.id === building2.id));
      ok(!response.body.find(building => building.id === building3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findBuildings(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(building => building.id === building1.id));
      ok(response.body.find(building => building.id === building2.id));
      ok(response.body.find(building => building.id === building3.id));
    });

  });

  describe('has a "findBuildingById" method that', () => {

    it('should handle requests at GET /:buildingId.', () => {
      strictEqual(getHttpMethod(BuildingController, 'findBuildingById'), 'GET');
      strictEqual(getPath(BuildingController, 'findBuildingById'), '/:buildingId');
    });

    it('should return an HttpResponseOK object if the building was found.', async () => {
      const ctx = new Context({
        params: {
          buildingId: building2.id
        }
      });
      const response = await controller.findBuildingById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, building2.id);
      strictEqual(response.body.text, building2.text);
    });

    it('should return an HttpResponseNotFound object if the building was not found.', async () => {
      const ctx = new Context({
        params: {
          buildingId: -1
        }
      });
      const response = await controller.findBuildingById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createBuilding" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(BuildingController, 'createBuilding'), 'POST');
      strictEqual(getPath(BuildingController, 'createBuilding'), undefined);
    });

    it('should create the building in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Building 3',
        }
      });
      const response = await controller.createBuilding(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const building = await Building.findOneBy({ text: 'Building 3' });

      if (!building) {
        throw new Error('No building 3 was found in the database.');
      }

      strictEqual(building.text, 'Building 3');

      strictEqual(response.body.id, building.id);
      strictEqual(response.body.text, building.text);
    });

  });

  describe('has a "modifyBuilding" method that', () => {

    it('should handle requests at PATCH /:buildingId.', () => {
      strictEqual(getHttpMethod(BuildingController, 'modifyBuilding'), 'PATCH');
      strictEqual(getPath(BuildingController, 'modifyBuilding'), '/:buildingId');
    });

    it('should update the building in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Building 2 (version 2)',
        },
        params: {
          buildingId: building2.id
        }
      });
      const response = await controller.modifyBuilding(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const building = await Building.findOneBy({ id: building2.id });

      if (!building) {
        throw new Error();
      }

      strictEqual(building.text, 'Building 2 (version 2)');

      strictEqual(response.body.id, building.id);
      strictEqual(response.body.text, building.text);
    });

    it('should not update the other buildings.', async () => {
      const ctx = new Context({
        body: {
          text: 'Building 2 (version 2)',
        },
        params: {
          buildingId: building2.id
        }
      });
      await controller.modifyBuilding(ctx);

      const building = await Building.findOneBy({ id: building1.id });

      if (!building) {
        throw new Error();
      }

      notStrictEqual(building.text, 'Building 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          buildingId: -1
        }
      });
      const response = await controller.modifyBuilding(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceBuilding" method that', () => {

    it('should handle requests at PUT /:buildingId.', () => {
      strictEqual(getHttpMethod(BuildingController, 'replaceBuilding'), 'PUT');
      strictEqual(getPath(BuildingController, 'replaceBuilding'), '/:buildingId');
    });

    it('should update the building in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Building 2 (version 2)',
        },
        params: {
          buildingId: building2.id
        }
      });
      const response = await controller.replaceBuilding(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const building = await Building.findOneBy({ id: building2.id });

      if (!building) {
        throw new Error();
      }

      strictEqual(building.text, 'Building 2 (version 2)');

      strictEqual(response.body.id, building.id);
      strictEqual(response.body.text, building.text);
    });

    it('should not update the other buildings.', async () => {
      const ctx = new Context({
        body: {
          text: 'Building 2 (version 2)',
        },
        params: {
          buildingId: building2.id
        }
      });
      await controller.replaceBuilding(ctx);

      const building = await Building.findOneBy({ id: building1.id });

      if (!building) {
        throw new Error();
      }

      notStrictEqual(building.text, 'Building 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          buildingId: -1
        }
      });
      const response = await controller.replaceBuilding(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteBuilding" method that', () => {

    it('should handle requests at DELETE /:buildingId.', () => {
      strictEqual(getHttpMethod(BuildingController, 'deleteBuilding'), 'DELETE');
      strictEqual(getPath(BuildingController, 'deleteBuilding'), '/:buildingId');
    });

    it('should delete the building and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          buildingId: building2.id
        }
      });
      const response = await controller.deleteBuilding(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const building = await Building.findOneBy({ id: building2.id });

      strictEqual(building, null);
    });

    it('should not delete the other buildings.', async () => {
      const ctx = new Context({
        params: {
          buildingId: building2.id
        }
      });
      const response = await controller.deleteBuilding(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const building = await Building.findOneBy({ id: building1.id });

      notStrictEqual(building, null);
    });

    it('should return an HttpResponseNotFound if the building was not found.', async () => {
      const ctx = new Context({
        params: {
          buildingId: -1
        }
      });
      const response = await controller.deleteBuilding(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
