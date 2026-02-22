import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Pets } from '../types/pets.type.js';

@Injectable()
export class PetsService {
  constructor(private prismaService: PrismaService) {}
  private readonly logger = new Logger(PetsService.name);
  async getAllPets(): Promise<Pets[]> {
    try {
      this.logger.log('Obteniendo listado de mascotas');
      const pets: Pets[] = [];
      const getAll = await this.prismaService.pets.findMany({
        include: { owner: true, specie: true },
      });
      getAll.forEach((pet) => {
        pets.push({
          name: pet.name,
          specie: pet.specie.name,
          breed: pet.breed,
          born_date: `${pet.born_month} ${pet.born_year}`,
          age: pet.age,
          weight: `${pet.weight} ${pet.weight_unit}`,
          desease: `${pet.desease ? 'Fallecido' : 'Vivo'}`,
          owner: {
            name: pet.owner.name,
            email: pet.owner.email,
            rut: `${pet.owner.rut}-${pet.owner.rut_dv}`,
          },
        });
      });
      return pets;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `Ha ocurrido un error al obtener el listado de mascotas: ${error.message}`,
      );
      throw err;
    }
  }
}
