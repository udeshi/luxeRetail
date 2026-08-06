import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { CART_REPOSITORY, type CartRepository } from '../../domain/cart.repository';

/** Reacts to auth's UserRegisteredEvent instead of auth reaching into cart
 *  directly — the two modules stay decoupled; cart just needs to know a
 *  user exists, not how registration works. */
@Injectable()
@EventsHandler(UserRegisteredEvent)
export class CreateCartOnRegistrationHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.carts.getOrCreateForUser(event.userId);
  }
}
