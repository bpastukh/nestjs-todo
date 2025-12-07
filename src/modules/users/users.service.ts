import { Injectable } from '@nestjs/common';
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
    return this.usersRepository.save(user);
  }
}
