import { NextApiRequest, NextApiResponse } from "next";
import { Mutex } from "async-mutex";
import {
  firestore,
  firebase,
  firestoreEvents,
  firestoreBingo,
  firestoreHanged,
  databaseTrivia,
  firestoreTrivia,
  firestoreRoulette,
} from "../../../../../firebase";
import { games, functionalErrorName } from "../../../../../components/common/DataList";
import { transformSubscription, FREE_PLAN } from "../../../../../business";
import { selectFirestoreFromLobby, AssignLobbyResponse } from "./utils";

const mutex = new Mutex();

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

// AssignLobbySeat checks if can give seat in lobby to user
export const assignLobbySeat = async (
  gameName: string,
  lobbyId: string,
  userId: string,
  newUser: any
): Promise<AssignLobbyResponse> => {
  const firestore_ = selectFirestoreFromLobby(gameName);

  if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

  // fetchLobby from game's Firestore to update data
  const lobbySnapshot = await firestore_.doc(`lobbies/${lobbyId}`).get();

  const lobby = lobbySnapshot.data();

  const subscription = await fetchSubscriptionPlanFromLobby(lobby);

  if (lobby?.countPlayers >= subscription.users) {
    const error = new Error("Lobby room is full. User cannot join to lobby");
    error.name = functionalErrorName;
    console.error("Error on assignLobbySeat:", error.message);
    throw error;
  }

  const optionalPromiseTasks = [];

  // Lobby room can add this user.
  // Register user in lobby.
  if (lobby?.isPlaying && newUser !== null)
    optionalPromiseTasks.push(
      firestore_.collection("lobbies").doc(lobbyId).collection("users").doc(userId).set(newUser, { merge: true })
    );

  // Increase counter players.
  optionalPromiseTasks.push(
    firestore_.doc(`lobbies/${lobbyId}`).update({
      countPlayers: firebase.firestore.FieldValue.increment(1),
    })
  );

  await Promise.all([...optionalPromiseTasks]);

  return { success: true, lobby: lobby };
};

// ReserveLobbySeatSynced runs lobby seat assignation with mutex.
export const reserveLobbySeatSynced = async (
  gameName: string,
  lobbyId: string,
  userId: string,
  newUser: any
): Promise<AssignLobbyResponse> => {

  return await mutex.runExclusive(async () => {
    const result = await assignLobbySeat(gameName, lobbyId, userId, newUser);

    return result;
  });
};

export const reserveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId, newUser } = req.body;

    console.info(`>>>> Request params: lobbyId ${lobbyId}, gameName ${gameName}`);

    const response = await reserveLobbySeatSynced(gameName, lobbyId, userId, newUser);

    return res.send(response);
  } catch (error : any) {
    console.error("Error on reserveLobbySeat:", error);

    if (error?.message === functionalErrorName) return res.status(409).send({ success: false, error: error?.message });

    return res.status(500).send({ success: false, error: "Something went wrong" });
  }
};
