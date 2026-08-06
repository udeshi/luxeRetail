import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { USER_REPOSITORY, type UserRepository } from '../../domain/user.repository';
import type { UserEntity } from '../../domain/user.entity';

export class GetCurrentUserQuery {
  constructor(public readonly userId: string) {}
}

@Injectable()
@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery, UserEntity> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(query: GetCurrentUserQuery): Promise<UserEntity> {
    const user = await this.users.findById(query.userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
