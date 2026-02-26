import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { User, UserCreation, UserUpdate } from '../types/user.type.js';
import { EncryptionUtility } from '../utilities/encryption.utility.js';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private encryptionUtility: EncryptionUtility,
  ) {}
  private readonly logger = new Logger(UserService.name);
  private async userHasRole(email: string, roleName: string): Promise<boolean> {
    const existing = await this.prisma.users_roles.findFirst({
      where: {
        user: { email },
        role: { name: roleName },
      },
    });
    return !!existing;
  }
  private async assignRolesToUser(email: string, roleName: string) {
    try {
      this.logger.log(
        `Assigning role: ${roleName} to user with email: ${email}`,
      );
      const hasRole = await this.userHasRole(email, roleName);
      if (hasRole) {
        this.logger.warn(
          `User with email: ${email} already has role: ${roleName}`,
        );
        throw new Error(`User already has the role '${roleName}' assigned`);
      }
      const assign = await this.prisma.users_roles.create({
        select: {
          role: true,
        },
        data: {
          user: { connect: { email } },
          role: { connect: { name: roleName } },
        },
      });
      return assign;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error assigning roles to user. ${error.message}`);
      throw err;
    }
  }
  private async removeRolesFromUser(email: string, roleName: string) {
    try {
      this.logger.log(
        `Removing role: ${roleName} from user with email: ${email}`,
      );
      const hasRole = await this.userHasRole(email, roleName);
      if (!hasRole) {
        this.logger.warn(
          `User with email: ${email} does not have role: ${roleName}`,
        );
        throw new Error(`User does not have the role '${roleName}' assigned`);
      }
      const remove = await this.prisma.users_roles.deleteMany({
        where: {
          user: { email },
          role: { name: roleName },
        },
      });
      return remove;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error removing roles from user. ${error.message}`);
      throw err;
    }
  }
  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Retrieving all users from the database');
      const users: User[] = [];
      const getUsers = await this.prisma.users.findMany({
        include: {
          users_roles: { include: { role: true } },
        },
      });
      this.logger.log(`Found ${getUsers.length} users in the database`);
      getUsers.forEach((user) => {
        users.push({
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          rut: `${user.rut}-${user.rut_dv}`,
          active: user.active,
          roles: user.users_roles.map((userRol) => {
            return userRol.role.name;
          }),
        });
      });
      return users;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error retrieving users. ${error.message}`);
      throw err;
    }
  }
  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Retrieving user with email: ${email}`);
      const getUser = await this.prisma.users.findUnique({
        include: {
          users_roles: { include: { role: true } },
        },
        where: { email },
      });
      if (!getUser) throw new Error('User not found');
      const user = {
        name: getUser.name,
        lastname: getUser.lastname,
        email: getUser.email,
        rut: `${getUser.rut}-${getUser.rut_dv}`,
        active: getUser.active,
        roles: getUser.users_roles.map((userRol) => {
          return userRol.role.name;
        }),
      };
      return user;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error retrieving user. ${error.message}`);
      throw err;
    }
  }
  async findByRut(rut: string): Promise<User> {
    try {
      this.logger.log(`Retrieving user with rut: ${rut}`);
      const getUser = await this.prisma.users.findUnique({
        include: {
          users_roles: { include: { role: true } },
        },
        where: {
          rut: Number.parseInt(rut.split('-')[0]),
          rut_dv: Number.parseInt(rut.split('-')[1]),
        },
      });
      if (!getUser) throw new Error('User not found');
      const user = {
        name: getUser.name,
        lastname: getUser.lastname,
        email: getUser.email,
        rut: `${getUser.rut}-${getUser.rut_dv}`,
        active: getUser.active,
        roles: getUser.users_roles.map((userRol) => {
          return userRol.role.name;
        }),
      };
      return user;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error retrieving user. ${error.message}`);
      throw err;
    }
  }
  async create(user: UserCreation): Promise<User> {
    try {
      this.logger.log(`Creating user with email: ${user.email}`);
      const passCrypted = await this.encryptionUtility.encrypt(user.password);
      const create = await this.prisma.users.create({
        data: {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          rut: Number.parseInt(user.rut.split('-')[0]),
          rut_dv: Number.parseInt(user.rut.split('-')[1]),
          password: passCrypted,
          active: true,
        },
      });
      await this.assignRolesToUser(create.email, 'user');
      const getUser = await this.findByEmail(create.email);
      if (!getUser) throw new Error('User not found after creation');
      const userCreated: User = {
        name: create.name,
        lastname: create.lastname,
        email: create.email,
        rut: `${create.rut}-${create.rut_dv}`,
        active: create.active,
        roles: getUser.roles?.map((role) => {
          return role;
        }),
      };
      return userCreated;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error creating user. ${error.message}`);
      throw err;
    }
  }
  async update(user: UserUpdate, email?: string, rut?: string): Promise<User> {
    try {
      if (user.rut || user.rut_dv || user.email || user.active) {
        this.logger.warn(
          `Attempt to update rut, rut_dv, email or active fields. This action is not allowed.`,
        );
        throw new Error(
          'Updating rut, rut_dv, email or active fields is not allowed',
        );
      }
      if (email) {
        this.logger.log(`Updating user with email: ${email}`);
        if (user.password) {
          user.password = await this.encryptionUtility.encrypt(user.password);
        }
        const update = await this.prisma.users.update({
          where: { email },
          data: { ...user },
        });
        const getUser = await this.findByEmail(update.email);
        return getUser;
      } else if (rut) {
        this.logger.log(`Updating user with rut: ${rut}`);
        if (user.password) {
          user.password = await this.encryptionUtility.encrypt(user.password);
        }
        const update = await this.prisma.users.update({
          where: {
            rut: Number.parseInt(rut.split('-')[0]),
            rut_dv: Number.parseInt(rut.split('-')[1]),
          },
          data: { ...user },
        });
        const getUser = await this.findByRut(`${update.rut}-${update.rut_dv}`);
        return getUser;
      } else {
        throw new Error('Email or rut must be provided for update');
      }
    } catch (err) {
      const error = Error(err as string);
      this.logger.error(`Error updating user. ${error.message}`);
      throw err;
    }
  }
  async updateRole(email: string, roleName: string, action: string) {
    try {
      this.logger.log('Updating user role');
      if (action === 'add') {
        const assign = await this.assignRolesToUser(email, roleName);
        return assign;
      } else if (action === 'remove') {
        const remove = await this.removeRolesFromUser(email, roleName);
        return remove;
      } else {
        this.logger.warn(`Invalid action: ${action} for updating user role`);
        throw new Error('Invalid action. Use <add> or <remove>.');
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error updating user role. ${error.message}`);
      throw err;
    }
  }
  async updateActiveStatus(email: string, active: boolean) {
    try {
      this.logger.log(
        `Updating active status for user with email: ${email} to ${active}`,
      );
      const update = await this.prisma.users.update({
        where: { email },
        data: { active },
      });
      const getUser = await this.findByEmail(update.email);
      return getUser;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(`Error updating user active status. ${error.message}`);
      throw err;
    }
  }
}
