export const FREE_PLAN = {
  users: 10,
};

export const transformSubscription = (subscription) => {
  /** TODO: Que informacion se busca?????  **/
  const users = parseInt(subscription.items[0].price?.product?.metadata?.["users"] ?? 0);

  return {
    ...subscription,
    users,
  };
};
