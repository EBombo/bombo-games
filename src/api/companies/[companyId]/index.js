import { firestoreEvents } from "../../../firebase";
import { FREE_PLAN } from "../../../business";

export const getSubscriptionPlan = async (req, res) => {
  try {
    const { companyId } = req.query;

    const customerId = await fetchCustomer(companyId);

    const activeSubscription = await fetchSubscriptionPlan(customerId);

    const limitUsersBySubscription = getLimitUsers(activeSubscription);

    console.log("limitUsersBySubscription", limitUsersBySubscription);

    return res.send({ limitUsersBySubscription });
  } catch (error) {
    console.error(error);
  }
};

const fetchCustomer = async (companyId) => {
  /** Prevent fetch customer without companyId. */
  if (!companyId) return;

  /** Fetch Customer. **/
  const customersQuerySnapshot = await firestoreEvents
    .collection("customers")
    .where("companyId", "==", companyId)
    .limit(1)
    .get();

  /** If customer is empty, then return FREE_PLAN. */
  if (customersQuerySnapshot.empty) return;

  return customersQuerySnapshot.docs[0].id;
};

const fetchSubscriptionPlan = async (customerId) => {
  /** If customer is empty, then return FREE_PLAN. */
  if (!customerId) return FREE_PLAN;

  /** Fetch subscriptions by stripe customerId. */
  const activeSubscriptionsQuery = await firestoreEvents
    .collection(`customers/${customerId}/subscriptions`)
    .where("status", "==", "active")
    .orderBy("created", "desc")
    .limit(1)
    .get();

  /** If customer is empty, then return FREE_PLAN. */
  if (activeSubscriptionsQuery.empty) return FREE_PLAN;

  // TODO: Use snapshotToArray.
  const activeSubscriptions = activeSubscriptionsQuery.docs.map((subscriptionDocSnapshot) => ({
    id: subscriptionDocSnapshot.id,
    ...subscriptionDocSnapshot.data(),
  }));

  return activeSubscriptions[0];
};

const getLimitUsers = (subscription) =>
  parseInt(subscription.items?.[0].price?.product?.metadata?.["users"] ?? subscription?.users);
