import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { User } from '../types/users.type.js';
import { CryptoUtil } from '../utils/crypto.util.js';
import { AppService } from '../app.service.js';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cryptoUtil: CryptoUtil,
    private appService: AppService,
  ) {}
  private readonly logger = new Logger(UsersService.name);
  async getAllUsers(): Promise<User[]> {
    try {
      await this.prisma.$connect();
      this.logger.log('Obteniendo lista de usuarios');
      const users: User[] = [];
      const getUsers = await this.prisma.users.findMany({
        where: { active: true },
      });
      getUsers.map((user) => {
        users.push({
          name: user.name,
          lastname: user.lastname,
          rut: `${user.rut}-${user.rut_dv}`,
          email: user.email,
          role: user.role,
        });
      });
      return users;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        'Ha ocurrido un error al obtener los usuarios',
        error.message,
      );
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async getUserByEmail(email: string): Promise<User> {
    try {
      await this.prisma.$connect();
      this.logger.log(`Obteniendo usuario con el email ${email}`);
      const user = await this.prisma.users.findUnique({
        where: { email, active: true },
      });
      if (!user) throw new Error('Usuario no existe');
      return {
        name: user.name,
        lastname: user.lastname,
        rut: `${user.rut}-${user.rut_dv}`,
        email: user.email,
        role: user.role,
      };
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al obtener el usuario. ${error.message}`,
      );
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async getUserByRut(rut_input: string): Promise<User> {
    try {
      await this.prisma.$connect();
      this.logger.log(`Obteniendo usuario con el rut ${rut_input}`);
      const [rut, rut_dv] = rut_input.split('-');
      const user = await this.prisma.users.findUnique({
        where: {
          rut: Number.parseInt(rut),
          rut_dv: Number.parseInt(rut_dv),
          active: true,
        },
      });
      if (!user) throw new Error('Usuario no existe');
      return {
        name: user.name,
        lastname: user.lastname,
        rut: `${user.rut}-${user.rut_dv}`,
        email: user.email,
        role: user.role,
      };
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al obtener el usuario. ${error.message}`,
      );
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async createUser(user: User): Promise<User> {
    try {
      this.logger.log('Procesando la creacion de usuario');
      await this.prisma.$connect();
      const [rut, rut_dv] = user.rut.split('-');
      const cryptoSecret = await this.appService.getProperty('CRYPTO_SECRET');
      const cryptoSalt = await this.appService.getProperty('CRYPTO_SALT');
      const passCrypto = this.cryptoUtil.encrypt(
        String(user.password),
        cryptoSecret.value,
        cryptoSalt.value,
      );
      const create = await this.prisma.users.create({
        data: {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          rut: Number.parseInt(rut),
          rut_dv: Number.parseInt(rut_dv),
          password: passCrypto,
        },
      });
      if (!create.id) this.logger.warn('No fue posible crear el usuario');
      this.logger.log(
        `Usuario creado con exito ID: ${create.id} | Perfil: ${create.role} | Activo: ${create.active}`,
      );
      return {
        id: create.id,
        name: create.name,
        lastname: create.lastname,
        email: create.email,
        rut: `${create.rut}-${create.rut_dv}`,
        role: create.role,
        active: create.active,
      };
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al crear el usuario ${error.message}`,
      );
      if (error.message.includes('Unique constraint')) {
        throw new Error('Usuario ya existe');
      } else {
        throw error;
      }
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
