import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { User } from '../types/users.type.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);
  async getAllUsers(): Promise<User[]> {
    try {
      this.logger.log('Obteniendo lista de usuarios');
      const users: User[] = [];
      const getUsers = await this.prisma.user.findMany();
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
    } catch (error) {
      this.logger.error('Ha ocurrido un error al obtener los usuarios');
      throw new Error(error as string);
    }
  }
}
