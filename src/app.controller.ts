import { Body, Controller, Inject, Optional, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserRoutesController {
  constructor(
    @Optional() @Inject('SERVICES') private readonly client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userId = await firstValueFrom(
      this.client.send({ server: 'user', msg: 'create' }, createUserDto),
    );
    await this.client.emit('user.created', { ...createUserDto, userId });
    return { userId };
  }
}
