import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(payload: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(payload.password);
    const user = this.usersRepository.create({
      ...payload,
      password: hashedPassword,
    });
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('User with this name already exists');
      }
      throw error;
    }
  }
}
