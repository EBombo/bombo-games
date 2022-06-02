import { NextApiRequest, NextApiResponse } from "next";
import { firebase, firestoreEvents } from "../../../../../firebase";
import { functionalErrorName } from "../../../../../components/common/DataList";
import { transformSubscription, FREE_PLAN } from "../../../../../business";
import { selectFirestoreFromLobby, AssignLobbyResponse } from "./utils";

export interface Lobby {
  isPlaying?: boolean;
  startAt?: any;
  countPlayers?: number;
}

const isLobbyPlaying = (lobby: Lobby | undefined | null) => lobby?.isPlaying || !!lobby?.startAt;

export const fetchSubscriptionPlanFromLobby = async (lobby: any) => {
  const companyId = lobby.game?.user?.companyId;
  // If no companyId, then return FREE_PLAN.
  if (!companyId) return FREE_PLAN;

  const customersQuerySnapshot = await firestoreEvents
    .collection("customers")
    .where("companyId", "==", companyId)
    .limit(1)
    .get();

  if (customersQuerySnapshot.empty) return FREE_PLAN;

  const customerId = customersQuerySnapshot.docs[0].id;

  // Fetch subscriptions by stripe customerId.
  const activeSubscriptionsQuery = await firestoreEvents
    .collection(`customers/${customerId}/subscriptions`)
    .where("status", "==", "active")
    .orderBy("created", "desc")
    .get();

  if (activeSubscriptionsQuery.empty) return FREE_PLAN;

  const activeSubscriptions = activeSubscriptionsQuery.docs.map((subscriptionDocSnapshot) => ({
    id: subscriptionDocSnapshot.id,
    ...subscriptionDocSnapshot.data(),
  }));

  const activeSubscription = activeSubscriptions[0];

  const subscription = transformSubscription(activeSubscription);

  return subscription;
};

export const assignLobbySeatSynced = async (
  firestore_: firebase.firestore.Firestore,
  lobbyRef: firebase.firestore.DocumentReference,
  maxNumberOfPlayers: number,
  userId: string,
  newUser: any
) => {
  return await firestore_.runTransaction(async (transaction) => {
    const lobbySnapshot = await transaction.get(lobbyRef);
    const lobby = lobbySnapshot.data() as Lobby;

    const countPlayers = lobby.countPlayers || 0;

    const userRef = lobbyRef.collection("users").doc(userId);
    const userSnapshot = await transaction.get(userRef);

    // Check if user already exists in lobby/_lobbyId/users so it can enter
    // without increasing countPlayers.
    if (userSnapshot.exists && isLobbyPlaying(lobby)) {
      transaction.update(userRef, { hasExited: false });

      return true;
    }

    // Check lobby room size.
    if (countPlayers >= maxNumberOfPlayers) {
      return false;
    }

    // If Lobby is playing then register user in collection.
    if (isLobbyPlaying(lobby) && newUser !== null) {
      const newUserRef = lobbyRef.collection("users").doc(userId);

      transaction.set(newUserRef, newUser, { merge: true });
    }

    // Increment counter.
    transaction.update(lobbyRef, {
      countPlayers: firebase.firestore.FieldValue.increment(1),
    });

    return true;
  });
};

// AssignLobbySeat checks if can give seat in lobby to user
export const assignLobbySeat = async (
  gameName: string,
  lobbyId: string,
  userId: string,
  newUser: any
): Promise<AssignLobbyResponse> => {
  const firestore_ = selectFirestoreFromLobby(gameName);

  if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

  // FetchLobby from game's Firestore to update data.
  const lobbySnapshot = await firestore_.doc(`lobbies/${lobbyId}`).get();

  const lobby = lobbySnapshot.data();

  if (lobby?.isLocked) {
    const error = new Error("Lobby is Locked. No one can join at this moment.");
    error.name = functionalErrorName;
    console.error("Error on assignLobbySeat:", error.message);
    throw error;
  }

  const subscription = await fetchSubscriptionPlanFromLobby(lobby);

  const wasUserAcceptedInLobby = await assignLobbySeatSynced(
    firestore_,
    lobbySnapshot.ref,
    subscription.users,
    userId,
    newUser
  );

  if (!wasUserAcceptedInLobby) {
    const error = new Error("Lobby room is full. User cannot join to lobby");
    error.name = functionalErrorName;
    console.error("Error on assignLobbySeat:", error.message);
    throw error;
  }

  return { success: true, lobby: lobby };
};

export const reserveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId, newUser } = req.body;

    console.info(`>>>> Request params: lobbyId ${lobbyId}, gameName ${gameName}`);

    const response = await assignLobbySeat(gameName, lobbyId, userId, newUser);

    return res.send(response);
  } catch (error: any) {
    console.error("Error on reserveLobbySeat:", error);

    if (error?.name === functionalErrorName) return res.status(409).send({ success: false, error: error?.message });

    return res.status(500).send({ success: false, error: "Something went wrong" });
  }
};
