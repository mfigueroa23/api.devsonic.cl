import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import type { Response } from 'express';
import type { UserCreation, User, UserUpdate } from '../types/user.type.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { ProfileAdminGuard } from '../guards/profile.admin.guard.js';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  private readonly logger = new Logger(UserController.name);
  @Get()
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async findAll(@Res() res: Response) {
    try {
      this.logger.log('Request to retrieve all users');
      const users = await this.userService.findAll();
      if (users.length != 0) {
        this.logger.log(`Successfully retrieved ${users.length} users`);
        res.status(200).json(users);
      } else {
        this.logger.warn('No users found in the database');
        res.status(200).json({ message: 'No users found' });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while retrieving users. ${error.message}`,
      );
      res.status(500).json({
        message: 'An error occurred while retrieving users',
      });
    }
  }
  @Get('find')
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async findAllWithQuerys(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Res() res: Response,
  ) {
    try {
      if (email && rut) {
        this.logger.warn(`Both email and rut parameters are provided.`);
        res.status(400).json({
          message: 'Please provide either email or rut, not both',
        });
      } else if (email) {
        this.logger.log(`Request to retrieve user with email: ${email}`);
        const user = await this.userService.findByEmail(email);
        if (user) {
          this.logger.log(`Successfully retrieved user with email: ${email}`);
          res.status(200).json(user);
        } else {
          this.logger.warn(`No user found with email: ${email}`);
          res.status(404).json({ message: 'User not found' });
        }
      } else if (rut) {
        this.logger.log(`Request to retrieve user with rut: ${rut}`);
        const user = await this.userService.findByRut(rut);
        if (user) {
          this.logger.log(`Successfully retrieved user with rut: ${rut}`);
          res.status(200).json(user);
        } else {
          this.logger.warn(`No user found with rut: ${rut}`);
          res.status(404).json({ message: 'User not found' });
        }
      } else {
        this.logger.warn('No email or rut parameter provided');
        res.status(400).json({
          message: 'Please provide either email or rut as a query parameter',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while retrieving users. ${error.message}`,
      );
      if (error.message.includes('User not found')) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(500).json({
          message: 'An error occurred while retrieving users',
        });
      }
    }
  }
  @Post()
  async createUser(@Body() user: UserCreation, @Res() res: Response) {
    try {
      this.logger.log(`Request to create a new user`);
      const createdUser = await this.userService.create(user);
      this.logger.log(
        `Successfully created user with email. ${createdUser.email}`,
      );
      res.status(201).json(createdUser);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while creating a user. ${error.message}`,
      );
      if (error.message.includes('Unique constraint')) {
        this.logger.warn('A user with the same email or rut already exists');
        res.status(400).json({
          message: 'A user with the same email or rut already exists',
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while creating a user',
        });
      }
    }
  }
  @Patch()
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async updateUser(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Body() user: User,
    @Res() res: Response,
  ) {
    try {
      if (email) {
        this.logger.log(`Request to update user with email: ${email}`);
        const updatedUser = await this.userService.update(
          user as UserUpdate,
          email,
        );
        this.logger.log(`Successfully updated user with email: ${email}`);
        res.status(200).json(updatedUser);
      } else if (rut) {
        this.logger.log(`Request to update user with rut: ${rut}`);
        const updatedUser = await this.userService.update(
          user as UserUpdate,
          undefined,
          rut,
        );
        this.logger.log(`Successfully updated user with rut: ${rut}`);
        res.status(200).json(updatedUser);
      } else {
        this.logger.warn('No email or rut query parameter provided for update');
        res.status(400).json({
          message: 'Please provide either email or rut as a query parameter',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while updating a user. ${error.message}`,
      );
      if (error.message.includes('rut, rut_dv, email or active')) {
        this.logger.warn(
          `Attempt to update rut, rut_dv, email or active fields. This action is not allowed.`,
        );
        res.status(400).json({
          message:
            'Updating rut, rut_dv, email or active fields is not allowed',
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while updating a user',
        });
      }
    }
  }
  @Put()
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async updateUserRole(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Query('role') roleName: string,
    @Query('action') action: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Request to update user role');
      if (email && rut) {
        this.logger.warn(
          `Both email and rut parameters are provided for role update.`,
        );
        res.status(400).json({
          message:
            'Please provide either email or rut, not both, for role update',
        });
        return;
      } else if (email) {
        await this.userService.updateRole(email, roleName, action);
        const updatedUser = await this.userService.findByEmail(email);
        res.status(200).json(updatedUser);
      } else if (rut) {
        const user = await this.userService.findByRut(rut);
        await this.userService.updateRole(user.email!, roleName, action);
        const updatedUser = await this.userService.findByRut(rut);
        res.status(200).json(updatedUser);
      } else {
        this.logger.warn(
          'No email or rut query parameter provided for role update',
        );
        res.status(400).json({
          message: 'Please provide either email or rut as a query parameter',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while updating user role. ${error.message}`,
      );
      if (error.message.includes('Invalid action')) {
        res.status(400).json({
          message: 'Invalid action. Use <add> or <remove>',
        });
      } else if (error.message.includes('already has the role')) {
        res.status(400).json({
          message: 'The user already has this role',
        });
      } else if (error.message.includes('does not have the role')) {
        res.status(400).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while updating user role',
        });
      }
    }
  }
  @Delete()
  @UseGuards(AuthGuard, ProfileAdminGuard)
  async statusUser(
    @Query('email') email: string,
    @Query('rut') rut: string,
    @Query('active') active: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Request to update user status');
      if (email && rut) {
        this.logger.warn(
          `Both email and rut parameters are provided for status update.`,
        );
        res.status(400).json({
          message:
            'Please provide either email or rut, not both, for status update',
        });
        res.status(400).json({
          message:
            'Please provide either email or rut, not both, for status update',
        });
      } else if (email) {
        const updatedUser = await this.userService.updateActiveStatus(
          email,
          active === 'true' ? true : false,
        );
        res.status(200).json(updatedUser);
      } else if (rut) {
        const user = await this.userService.findByRut(rut);
        const updatedUser = await this.userService.updateActiveStatus(
          user.email!,
          active === 'true' ? true : false,
        );
        res.status(200).json(updatedUser);
      } else {
        this.logger.warn(
          'No email or rut query parameter provided for status update',
        );
        res.status(400).json({
          message: 'Please provide either email or rut as a query parameter',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `An error occurred while updating user status. ${error.message}`,
      );
      res.status(500).json({
        message: 'An error occurred while updating user status',
      });
    }
  }
}
