import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Pet, PetCreation, PetUpdate } from '../types/pet.type.js';
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
            id: pet.id,
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
  async getPetsByOwner(email: string): Promise<Pet[]> {
    try {
      this.logger.log(`Getting the pets from the user ${email}`);
      const userPets = await this.prisma.pets.findMany({
        include: {
          specie: true,
          owner: true,
          pet_weight: { include: { weight_unit: true } },
          pet_weight_history: { include: { weight_unit: true } },
        },
        where: { owner: { email } },
      });
      const pets: Pet[] = await Promise.all(
        userPets.map(async (pet) => {
          const user = await this.userService.findByEmail(pet.owner.email);
          return {
            id: pet.id,
            name: pet.name,
            born_date: `${pet.born_month} ${pet.born_year}`,
            age: pet.age,
            specie: pet.specie.name,
            breed: pet.breed,
            desease: pet.desease,
            user,
            pet_weight: `${pet.pet_weight[0].weight} ${pet.pet_weight[0].weight_unit.name}`,
            weight_history: pet.pet_weight_history.map((weight) => ({
              date: weight.date,
              weight: `${weight.weight} ${weight.weight_unit.name}`,
            })),
          };
        }),
      );
      return pets;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while getting the pets. ${error.message}`,
      );
      throw err;
    }
  }
  async getPetByNameAndOwner(name: string, email: string): Promise<Pet> {
    try {
      this.logger.log(`Getting the pet ${name} from the user ${email}`);
      const gettingPet: Pet[] = await this.getPetsByOwner(email);
      const userPet = gettingPet.find((pet) => pet.name === name);
      if (!userPet) {
        throw new Error(`Pet ${name} not found for user ${email}`);
      }
      this.logger.log(`Pet ${name} from the user ${email} found`);
      return userPet;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while getting the pet. ${error.message}`,
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
  async updatePet(
    petName: string,
    petData: PetUpdate,
    email: string,
  ): Promise<Pet> {
    try {
      this.logger.log(`Updating the pet ${petName} from the user: ${email}`);
      const userPet: Pet = await this.getPetByNameAndOwner(petName, email);
      if (petData.age) throw new Error('Age is autogenerated');
      this.logger.log(`Updating the pet ${petName}`);
      const update = await this.prisma.pets.update({
        data: { ...petData },
        where: { id: userPet.id },
      });
      const updatedPet = await this.getPetByNameAndOwner(update.name, email);
      return updatedPet;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while updating the pet. ${error.message}`,
      );
      throw err;
    }
  }
  async updateWeight(
    petName: string,
    weight: number,
    email: string,
  ): Promise<Pet> {
    try {
      this.logger.log(
        `Updating the weight of the pet ${petName} from the user ${email}`,
      );
      const { id } = await this.getPetByNameAndOwner(petName, email);
      const updatedWeight = await this.prisma.pet_weight.update({
        data: { weight },
        where: { pet_id: id },
      });
      const saveHistory = await this.prisma.pet_weight_history.create({
        data: {
          weight,
          date: new Date(),
          pet_id: Number(id),
        },
      });
      this.logger.log(
        `Weight of ${petName} updated to ${updatedWeight.weight} on ${saveHistory.date.getDay()} at ${saveHistory.date.getHours()}`,
      );
      const pet = await this.getPetByNameAndOwner(petName, email);
      return pet;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error has occurred while updating the pet weight. ${error.message}`,
      );
      throw err;
    }
  }
}
