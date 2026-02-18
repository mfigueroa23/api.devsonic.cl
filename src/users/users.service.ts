import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { User } from '../types/users.type.js';
import { CryptoUtil } from '../utils/crypto.util.js';
import { AppService } from '../app.service.js';
import { Roles } from 'generated/prisma/enums.js';

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
      throw err;
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
      throw err;
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
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async createUser(user: User): Promise<User> {
    try {
      this.logger.log('Procesando la creacion de usuario');
      await this.prisma.$connect();
      if (!user.name || !user.lastname || !user.email || !user.rut) {
        throw new Error('Faltan datos para completar la solicitud');
      }
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
        throw err;
      }
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async updateUserByEmail(email: string, userData: User): Promise<User> {
    try {
      this.logger.log(`Actualizando usuario con el email ${email}`);
      await this.prisma.$connect();
      let user = await this.prisma.users.findUnique({
        select: {
          name: true,
          lastname: true,
          password: true,
          role: true,
          active: true,
        },
        where: { email },
      });
      if (!user) throw new Error('El usuario no existe');
      if (userData.name) {
        this.logger.log('Actualizando nombre del usuario');
        user = {
          name: String(userData.name),
          lastname: user.lastname,
          password: user.password,
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { email },
        });
      }
      if (userData.lastname) {
        this.logger.log('Actualizando apellido del usuario');
        user = {
          name: user.name,
          lastname: String(userData.lastname),
          password: user.password,
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { email },
        });
      }
      if (userData.password) {
        this.logger.log('Actualizando contraseña del usuario');
        const CRYPTO_SECRET =
          await this.appService.getProperty('CRYPTO_SECRET');
        const CRYPTO_SALT = await this.appService.getProperty('CRYPTO_SALT');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: this.cryptoUtil.encrypt(
            String(userData.password),
            CRYPTO_SECRET.value,
            CRYPTO_SALT.value,
          ),
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { email },
        });
      }
      if (userData.role) {
        this.logger.log('Actualizando rol del usuario');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: user.password,
          role: String(userData.role) as Roles,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { email },
        });
      }
      if (userData.active == true || userData.active == false) {
        this.logger.log('Actualizando estado del usuario');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: user.password,
          role: user.role,
          active: userData.active,
        };
        await this.prisma.users
          .update({
            data: user,
            where: { email },
          })
          .then((user) => {
            if (!user.active) {
              throw new Error('desactivado');
            }
          });
      }
      return await this.getUserByEmail(email);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la actualizacion ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async updateUserByRut(rutData: string, userData: User): Promise<User> {
    try {
      this.logger.log(`Actualizando usuario con el rut ${rutData}`);
      const [rut, rut_dv] = rutData.split('-');
      await this.prisma.$connect();
      let user = await this.prisma.users.findUnique({
        select: {
          name: true,
          lastname: true,
          password: true,
          role: true,
          active: true,
        },
        where: { rut: Number.parseInt(rut), rut_dv: Number.parseInt(rut_dv) },
      });
      if (!user) throw new Error('El usuario no existe');
      if (userData.name) {
        this.logger.log('Actualizando nombre del usuario');
        user = {
          name: String(userData.name),
          lastname: user.lastname,
          password: user.password,
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { rut: Number.parseInt(rut), rut_dv: Number.parseInt(rut_dv) },
        });
      }
      if (userData.lastname) {
        this.logger.log('Actualizando apellido del usuario');
        user = {
          name: user.name,
          lastname: String(userData.lastname),
          password: user.password,
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { rut: Number.parseInt(rut), rut_dv: Number.parseInt(rut_dv) },
        });
      }
      if (userData.password) {
        this.logger.log('Actualizando contraseña del usuario');
        const CRYPTO_SECRET =
          await this.appService.getProperty('CRYPTO_SECRET');
        const CRYPTO_SALT = await this.appService.getProperty('CRYPTO_SALT');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: this.cryptoUtil.encrypt(
            String(userData.password),
            CRYPTO_SECRET.value,
            CRYPTO_SALT.value,
          ),
          role: user.role,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { rut: Number.parseInt(rut), rut_dv: Number.parseInt(rut_dv) },
        });
      }
      if (userData.role) {
        this.logger.log('Actualizando rol del usuario');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: user.password,
          role: String(userData.role) as Roles,
          active: user.active,
        };
        await this.prisma.users.update({
          data: user,
          where: { rut: Number.parseInt(rut), rut_dv: Number.parseInt(rut_dv) },
        });
      }
      if (userData.active == true || userData.active == false) {
        this.logger.log('Actualizando estado del usuario');
        user = {
          name: user.name,
          lastname: user.lastname,
          password: user.password,
          role: user.role,
          active: userData.active,
        };
        await this.prisma.users
          .update({
            data: user,
            where: {
              rut: Number.parseInt(rut),
              rut_dv: Number.parseInt(rut_dv),
            },
          })
          .then((user) => {
            if (!user.active) {
              throw new Error('desactivado');
            }
          });
      }
      return await this.getUserByRut(rutData);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la actualizacion ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async getUserPasswd(email: string): Promise<string> {
    try {
      this.logger.log(`Obteniendo contraseña del usuario ${email}`);
      const userPass = await this.prisma.users.findUnique({
        select: { password: true },
        where: { email },
      });
      if (!userPass?.password) {
        this.logger.warn(
          `No es posible encontrar usuario con el email ${email}`,
        );
        throw new Error('Usuario no existe');
      } else {
        return userPass.password;
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al procesar la obtencion de credenciales ${error.message}`,
      );
      throw err;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
