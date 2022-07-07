import { NextApiRequest, NextApiResponse } from "next";
import { firebase, firestoreEvents } from "../../../../../firebase";
import { functionalErrorName } from "../../../../../components/common/DataList";
import { FREE_PLAN, transformSubscription } from "../../../../../business";
import { AssignLobbyResponse, FunctionalError, selectFirestoreFromLobby } from "./utils";

export interface Lobby {
  isPlaying?: boolean;
  startAt?: any;
  countPlayers?: number;
}

export const reserveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId, newUser } = req.body;

    console.info(`>>>> Request params: lobbyId ${lobbyId}, gameName ${gameName}`);
    console.info("users->",userId, newUser);

    const firestore_ = selectFirestoreFromLobby(gameName);

    if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

    // FetchLobby from game's Firestore to update data.
    const lobbySnapshot = await firestore_.doc(`lobbies/${lobbyId}`).get();

    const lobbyRef = lobbySnapshot.ref;
    const lobby = lobbySnapshot.data();

    if (lobby?.isLocked) {
      throw new FunctionalError("Lobby is Locked. No one can join at this moment.");
    }

    const { users: maxNumberOfPlayers } = await fetchSubscriptionPlanFromLobby(lobby);

    console.log("maxNumberOfPlayers", maxNumberOfPlayers);

    const wasUserAcceptedInLobby = await firestore_.runTransaction(async (transaction) => {
      const lobbySnapshot = await transaction.get(lobbyRef);

      const lobby = lobbySnapshot.data() as Lobby;

      const countPlayers = lobby.countPlayers || 0;

      // Check lobby room size.
      if (countPlayers >= maxNumberOfPlayers) return false;

      // If Lobby is playing then register user in collection.
      if ((lobby?.isPlaying || !!lobby?.startAt) && newUser !== null) {
        const newUserRef = lobbyRef.collection("users").doc(userId);

        transaction.set(newUserRef, { ...newUser, hasExited: false }, { merge: true });
      }

      // Increment counter.
      transaction.update(lobbyRef, { countPlayers: firebase.firestore.FieldValue.increment(1) });

      return true;
    });

    if (!wasUserAcceptedInLobby) {
      throw new FunctionalError("Lobby room is full. User cannot join to lobby");
    }

    return res.send(<AssignLobbyResponse>{ success: true, lobby });
  } catch (error: any) {
    console.error("Error on reserveLobbySeat:", error);

    if (error?.name === functionalErrorName) return res.status(409).send({ success: false, error: error?.message });

    return res.status(500).send(<AssignLobbyResponse>{ success: false, error: "Something went wrong" });
  }
};

export const fetchSubscriptionPlanFromLobby = async (lobby: any) => {
  const companyId = lobby.game?.user?.companyId;

  /** If no companyId, then return FREE_PLAN. */
  if (!companyId) return FREE_PLAN;

  const customersQuerySnapshot = await firestoreEvents
    .collection("customers")
    .where("companyId", "==", companyId)
    .limit(1)
    .get();

  /** If customer is empty, then return FREE_PLAN. */
  if (customersQuerySnapshot.empty) return FREE_PLAN;

  const customerId = customersQuerySnapshot.docs[0].id;

  // Fetch subscriptions by stripe customerId.
  const activeSubscriptionsQuery = await firestoreEvents
    .collection(`customers/${customerId}/subscriptions`)
    .where("status", "==", "active")
    .orderBy("created", "desc")
    .limit(1)
    .get();

  /** If customer is empty, then return FREE_PLAN. */
  if (activeSubscriptionsQuery.empty) return FREE_PLAN;

  const activeSubscriptions = activeSubscriptionsQuery.docs.map((subscriptionDocSnapshot) => ({
    id: subscriptionDocSnapshot.id,
    ...subscriptionDocSnapshot.data(),
  }));

  const activeSubscription = activeSubscriptions[0];

  /** TODO: Que se hace con esta transformacion?????  **/
  return transformSubscription(activeSubscription);
};
