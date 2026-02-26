import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Pet } from '../types/pet.type.js';
import { UserService } from '../users/user.service.js';

@Injectable()
export class PetService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(PetService.name);
  async allPets() {
    try {
      this.logger.log('Getting all the pets');
      const getAllPets = await this.prisma.pets.findMany({
        include: {
          owner: true,
          specie: true,
          pet_weight: {
            include: { weight_unit: true },
          },
          pet_weight_history: true,
        },
      });
      const pets: Pet[] = await Promise.all(
        getAllPets.map(async (pet) => {
          const user = await this.userService.findByEmail(pet.owner.email);
          return {
            name: pet.name,
            born_date: `${pet.born_month} ${pet.born_year}`,
            age: `${pet.age}`,
            desease: pet.desease,
            specie: pet.specie.name,
            breed: pet.breed,
            user: user,
            pet_weight: `${pet.pet_weight[0].weight} ${pet.pet_weight[0].weight_unit.name}`,
            weight_history: pet.pet_weight_history.map((weight) => ({
              weight: String(weight.weight),
              date: weight.date,
            })),
          };
        }),
      );
      return pets;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while fetching all the pets. ${error.message}`,
      );
      throw err;
    }
  }
}
