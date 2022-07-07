export const FREE_PLAN = {
  users: 10,
};

export const getMaxUsersAllowedFromSubscription = (subscription) => {
  /** Parsea la metadata de nro máximo de usuarios en lobby de (string) a (number)  **/
  const maxNumberOfPlayers = parseInt(subscription.items[0].price?.product?.metadata?.["users"] ?? FREE_PLAN.users);

  return maxNumberOfPlayers;
};
