import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() payload: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(payload);
  }
}
