import { INestApplication, INestMicroservice } from "@nestjs/common";
import * as request from 'supertest';
import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRoutesController } from "../src/app.controller";
import { CreateUserDto } from "../src/dto/create-user.dto";
import { UserController } from "./microserviceMock.controller";

const createMicroservicesApp = async () => {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [],
    controllers: [UserController],
    providers: [],
  }).compile();

  const app = fixture.createNestMicroservice({
    transport: Transport.TCP,
  });

  await app.listen();

  return app;
};

const createApp = async () => {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [],
    controllers: [UserRoutesController],
    providers: [
      {
        provide: 'SERVICES',
        useValue: ClientProxyFactory.create({
          transport: Transport.TCP,
        }),
      },
    ],
  }).compile();

  const app = fixture.createNestApplication();

  await app.init();

  await app.startAllMicroservices();

  return app;
};

describe('User App (e2e)', () => {
  let app: INestApplication;
  let service: INestMicroservice;
  let userController: UserController;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    service = await createMicroservicesApp();
    userController = service.get<UserController>(UserController);
    app = await createApp();
  });

  afterAll(async () => {
    await Promise.all([app.close(), service.close()]);
    jest.clearAllMocks();
  });

  describe('/user (POST)', () => {
    const fakeUser: CreateUserDto = {
      description: 'This is an User',
      name: 'Jimmy cool af',
    };

    it('create User', async () => {
      const spied = jest.spyOn(userController, 'createUser');
      const res = await request(app.getHttpServer())
        .post('/user')
        .send(fakeUser);
      const { userId } = res.body;
      expect(userId.length).toEqual(10);
      expect(spied).toHaveBeenCalled();
    });
  });
});
