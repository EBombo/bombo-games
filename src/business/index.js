export const FREE_PLAN = {
  users: 10,
};

export const transformSubscription = (subscription) => {
  const users = parseInt(subscription.items[0].price?.product?.metadata?.["users"] ?? 0);

  return {
    ...subscription,
    users,
  };
};
