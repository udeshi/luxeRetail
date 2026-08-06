/** Published after a user is created. Other modules react instead of the
 *  auth module reaching into them directly — e.g. the cart module listens
 *  for this to provision an empty cart (see cart/application/events). */
export class UserRegisteredEvent {
  constructor(public readonly userId: string) {}
}
