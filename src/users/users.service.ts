import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { User } from '../types/users.type.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);
  async getAllUsers(): Promise<User[]> {
    try {
      await this.prisma.$connect();
      this.logger.log('Obteniendo lista de usuarios');
      const users: User[] = [];
      const getUsers = await this.prisma.users.findMany();
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
        where: { email },
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
}
