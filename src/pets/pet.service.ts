import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Pet, PetCreation } from '../types/pet.type.js';
import { UserService } from '../users/user.service.js';
import { User } from '../types/user.type.js';

@Injectable()
export class PetService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(PetService.name);
  async allPets(): Promise<Pet[]> {
    try {
      this.logger.log('Getting all the pets');
      const getAllPets = await this.prisma.pets.findMany({
        include: {
          owner: true,
          specie: true,
          pet_weight: { include: { weight_unit: true } },
          pet_weight_history: { include: { weight_unit: true } },
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
              weight: `${weight.weight} ${weight.weight_unit.name}`,
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
  async createPet(petData: PetCreation, email: string): Promise<Pet> {
    try {
      this.logger.log(`Creating a pet for the user ${email}`);
      const pet = await this.prisma.pets.create({
        include: {
          specie: true,
          pet_weight: { include: { weight_unit: true } },
          pet_weight_history: { include: { weight_unit: true } },
          owner: true,
        },
        data: {
          name: petData.name,
          born_year: petData.born_year,
          born_month: petData.born_month,
          age: petData.age || '0',
          desease: petData.deseace || false,
          breed: petData.breed,
          owner: { connect: { email } },
          specie: { connect: { name: petData.specie } },
          pet_weight: {
            create: {
              weight: petData.weight,
              weight_unit: { connect: { name: petData.weight_unit } },
            },
          },
          pet_weight_history: {
            create: {
              weight: petData.weight,
              weight_unit: { connect: { name: petData.weight_unit } },
              date: new Date(),
            },
          },
        },
      });
      const user: User = await this.userService.findByEmail(pet.owner.email);
      return {
        name: pet.name,
        born_date: `${pet.born_month} ${pet.born_year}`,
        age: pet.age,
        desease: pet.desease,
        specie: pet.specie.name,
        breed: pet.breed,
        user,
        pet_weight: `${pet.pet_weight[0].weight} ${pet.pet_weight[0].weight_unit.name}`,
        weight_history: pet.pet_weight_history.map((history) => ({
          weight: `${history.weight} ${history.weight_unit.name}`,
          date: history.date,
        })),
      };
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while creating the pet. ${error.message}`,
      );
      throw err;
    }
  }
}
