import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";
import { CreateUserDto } from "../src/dto/create-user.dto";

@Controller()
export class UserController {
  @MessagePattern({ server: 'user', msg: 'create' })
  create(data: CreateUserDto) {
    return 'testy test';
  }

  @EventPattern('user.created')
  createUser(data: CreateUserDto) {
    console.log('user.created');
    return null;
  }
}
