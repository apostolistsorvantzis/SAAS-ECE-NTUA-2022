const { spec } = require('pactum');

const baseURL = 'http://localhost:3320/api/v1';
const baseAuthURL = 'http://localhost:3333';

const testEmail = 'test@testme.com';
const testPassword = 'test';

let access_token = '';

describe('ATLmicroservice', () => {
  before(async function () {
    const sp = await spec()
      .post(`${baseAuthURL}/auth/signup`)
      .withBody({
        email: testEmail,
        password: testPassword,
      })
      .expectStatus(201)
      .expectJsonLike({ access_token: /[^\.]+\.[^\.]+\.[^\.]+/ });
    access_token = sp.body.access_token;
  });

  after(async () => {
    // Delete test users
    await spec().get(`${baseAuthURL}/auth/delete`).expectStatus(200);
  });

  describe('ATL', () => {
    // CREATE
    describe('Create', async () => {
      // No auth
      it('should return 401 when no token is provided', async () => {
        await spec().post(`${baseURL}/atl`).expectStatus(401);
      });
      // No auth
      it('should return proper message when no token is provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .expectJsonLike({ message: 'No token provided.' });
      });
      // No body params at all
      it('should return 400 when no body params are provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .withHeaders({ Authorization: `Bearer ${access_token}` })
          .expectStatus(400)
          .expectJsonLike({ message: 'Bad request' });
      });
      // No proper date for date_time
      it('should return proper message when no proper date is provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .withHeaders('authorization', `Bearer ${access_token}`)
          .withBody({
            map_code: 'test',
            date_time: 'test',
            update_time: 'test',
            total_load_value: 'test',
          })
          .expectJsonLike({ message: 'Bad date_time' });
      });
      // No proper date for update_time
      it('should return proper message when no proper update_time is provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .withHeaders('authorization', `Bearer ${access_token}`)
          .withBody({
            map_code: 'test',
            date_time: '2022-01-01',
            update_time: 'test',
            total_load_value: 'test',
          })
          .expectJsonLike({ message: 'Bad update_time' });
      });
      // No proper map_code
      it('should return proper message when no proper map_code is provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .withHeaders('authorization', `Bearer ${access_token}`)
          .withBody({
            map_code: 'BT',
            date_time: '2022-01-01',
            update_time: '2022-01-01',
            total_load_value: 'test',
          })
          .expectJsonLike({ message: 'Something went terribly wrong' });
      });
      // Pass a proper entry
      it('should return proper message when a proper entry is provided', async () => {
        await spec()
          .post(`${baseURL}/atl`)
          .withHeaders('authorization', `Bearer ${access_token}`)
          .withBody({
            map_code: 'ZZ',
            date_time: '1980-01-01',
            update_time: '1980-01-02',
            total_load_value: '123.2',
          })
          .expectStatus(200)
          .expectJsonLike({
            status: 'success',
            message: 'ActualTotalLoad created successfully',
          });
      });
    });
    // READ
    describe('Read', () => {
      it('should return 401 when no token is provided', async () => {
        await spec().get(`${baseURL}/atl`).expectStatus(401);
      });
      it('should return proper message when no token is provided', async () => {
        await spec()
          .get(`${baseURL}/atl`)
          .expectJsonLike({ message: 'No token provided.' });
      });
      it('should find the ATL that we created in previous tests', async () => {
        await spec()
          .withHeaders('authorization', `Bearer ${access_token}`)
          .get(`${baseURL}/atl/ZZ/1980-01-01`)
          .expectStatus(200)
          .expectJsonLike({
            data: [
              {
                map_code: 'ZZ',
              },
            ],
          });
      });
    });

    // DELETE
    describe('Delete', () => {
      it('should return 401 when no token is provided', async () => {
        await spec().delete(`${baseURL}/atl`).expectStatus(401);
      });
      it('should return proper message when no token is provided', async () => {
        await spec()
          .delete(`${baseURL}/atl`)
          .expectJsonLike({ message: 'No token provided.' });
      });
      it('should return 200 after deleting the previously created ATL', async () => {
        await spec()
          .withHeaders('authorization', `Bearer ${access_token}`)
          .delete(`${baseURL}/atl/ZZ/1980-01-01/1980-01-02`)
          .expectStatus(200);
      });
      it('should not return results when searching for the previously created atl', async () => {
        await spec()
          .withHeaders('authorization', `Bearer ${access_token}`)
          .get(`${baseURL}/atl/ZZ/1980-01-01`)
          .expectStatus(200)
          .expectJsonLike({
            data: [],
          });
      });
    });
  });
  // @todo: discuss removing Country-related endpoints
  // all-together and use like a hashmap or something
  describe('Countries', () => {
    describe('Create', () => {});
    describe('Read', () => {});
    describe('Delete', () => {});
  });
});
