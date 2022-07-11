import { firebase, firestoreEvents } from "../../../../../firebase";
import { functionalErrorName } from "../../../../../components/common/DataList";
import { FREE_PLAN } from "../../../../../business";
import { FunctionalError, selectFirestoreFromLobby } from "./utils";

export const reserveLobbySeat = async (req, res) => {
  try {
    const { lobbyId, gameName } = req.query;
    const { userId, newUser, isValidate } = req.body;

    console.info("reserveLobbySeat", lobbyId, gameName, userId, newUser);

    const firestoreRef = selectFirestoreFromLobby(gameName);

    if (!firestoreRef) {
      throw new Error("Selected Game Database is null/undefined.");
    }

    const { lobby, lobbyRef } = await fetchLobby(firestoreRef, lobbyId);

    if (lobby?.isLocked) {
      throw new FunctionalError("Lobby is Locked. No one can join at this moment.");
    }

    const customerId = await fetchCustomerId(lobby);

    const activeSubscription = await fetchSubscriptionPlan(customerId);

    const limitUsersBySubscription = getLimitUsers(activeSubscription);

    console.log("limitUsersBySubscription", limitUsersBySubscription);

    /** Limit allowed **/
    const wasUserAcceptedInLobby = await firestoreRef.runTransaction(async (transaction) => {
      // Get lobby.
      const lobbySnapshot = await transaction.get(lobbyRef);
      const lobby = lobbySnapshot.data();

      const countPlayers = lobby?.countPlayers ?? 0;

      /** Check lobby room size. **/
      if (countPlayers >= limitUsersBySubscription) return false;

      /** It is used as query. **/
      if (isValidate) return countPlayers < limitUsersBySubscription;

      // Increment total users.
      transaction.update(lobbyRef, { countPlayers: firebase.firestore.FieldValue.increment(1) });

      if (newUser === null) return true;
      /** Si el juego ya empezo, debe registrar el usuario  directamente a la colleccion users. **/
      if (!lobby?.isPlaying) return true;
      /** Si el juego esta en la pagina de LOADING de carga del juego, debe registrar el usuario  directamente a la colleccion users. **/
      if (lobby?.startAt !== null) return true;

      // If Lobby is playing then register user in collection.
      const newUserRef = lobbyRef.collection("users").doc(userId);
      transaction.set(newUserRef, { ...newUser, hasExited: false }, { merge: true });

      return true;
    });

    if (!wasUserAcceptedInLobby) {
      throw new FunctionalError("Lobby room is full. User cannot join to lobby");
    }

    return res.send({ success: true, lobby });
  } catch (error) {
    console.error("Error on reserveLobbySeat:", error);

    if (error?.name === functionalErrorName) {
      return res.status(409).send({ success: false, message: error?.message });
    }

    return res.status(500).send({ success: false, message: "Something went wrong" });
  }
};

const fetchLobby = async (firestoreRef, lobbyId) => {
  const lobbySnapshot = await firestoreRef.doc(`lobbies/${lobbyId}`).get();

  const lobbyRef = lobbySnapshot.ref;
  const lobby = lobbySnapshot.data();

  return { lobby, lobbyRef };
};

const fetchCustomerId = async (lobby) => {
  /** Prevent fetch customer without companyId. */
  if (!lobby.game?.user?.companyId) return;

  /** Fetch Customer. **/
  const customersQuerySnapshot = await firestoreEvents
    .collection("customers")
    .where("companyId", "==", lobby.game?.user?.companyId)
    .limit(1)
    .get();

  /** If customer is empty, then return FREE_PLAN. */
  if (customersQuerySnapshot.empty) return FREE_PLAN;

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

const getLimitUsers = (subscription) => parseInt(subscription.items?.[0].price?.product?.metadata?.["users"] ?? 0);
