import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;
    
    beforeEach(async () => {
        // Create a fake copy of the user service
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email = email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {
                    id: Math.floor(Math.random() * 999999),
                    email,
                    password
                } as User;
                users.push(user);
                return Promise.resolve(user);
            }
        };
        
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();
        
        service = module.get(AuthService);
    })
    
    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('create a new user with a salted and hashed password', async () => {
        const user = await service.signup('aaa@aaa.com', 'bbb');

        expect(user.password).not.toEqual('bbb');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        await service.signup('aaa@aaa.com', 'bbb');
        await expect(service.signup('aaa@aaa.com', 'bbb')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws if signs is called with an unused email', async () => {
        await expect(service.signin('aaa@aaa.com', 'bbb')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        await service.signup('aaa@aaa.com', 'bbb');
        await expect(service.signin('aaa@aaa.com', 'password')).rejects.toBeInstanceOf(BadRequestException);
    });


    it('return a user if correct password is provided', async () => {
        await service.signup('aaa@aaa.com', 'password');
        const user = await service.signin('aaa@aaa.com', 'password');
        expect(user).toBeDefined();
    });
});