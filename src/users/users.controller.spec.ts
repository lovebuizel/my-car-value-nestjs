import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'aaa@aaa.com',
          password: 'bbb'
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'bbb' } as User]);
      },
      // remove: () => {},
      // update: () => {}
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      }
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('aaa@aaa.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('aaa@aaa.com');
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('signin updates session object and returns user',async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      {
        email: 'aaa@aaa.com',
        password: 'bbb'
      },
      session
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
