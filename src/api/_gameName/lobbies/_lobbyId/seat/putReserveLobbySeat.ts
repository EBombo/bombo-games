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
import { games } from "../../../../../components/common/DataList";
import { transformSubscription, FREE_PLAN } from "../../../../../business";
import { selectFirestoreFromLobby } from "./utils";

const mutex = new Mutex();

interface AssignLobbyResponse {
  success: boolean;
  lobby?: any;
  error?: any;
}

export const fetchSubscriptionPlanFromLobby = async (lobby: any) => {
  const companyId = lobby.game?.user?.companyId;
  // if no companyId, then return FREE_PLAN
  if (!companyId) return FREE_PLAN;

  const customersQuerySnapshot = await firestoreEvents
    .collection("customers")
    .where("companyId", "==", companyId)
    .limit(1)
    .get();

  if (customersQuerySnapshot.empty) return FREE_PLAN;

  const customerId = customersQuerySnapshot.docs[0].id;

  // fetch subscriptions by stripe customerId
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

// assignLobbySeat checks if can give seat in lobby to user
export const assignLobbySeat = async (gameName : string, lobbyId: string, userId: string, newUser: any): Promise<AssignLobbyResponse> => {
  try {
    const firestore_ = selectFirestoreFromLobby(gameName);

    if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

    // fetchLobby from game's Firestore to update data
    const lobbySnapshot = await firestore_.doc(`lobbies/${lobbyId}`).get();

    const lobby = lobbySnapshot.data();

    const subscription = await fetchSubscriptionPlanFromLobby(lobby);

    if (lobby?.countPlayers >= subscription.users) throw new Error("Lobby room is complete. User cannot join to lobby");


    const optionalPromiseTasks = [];

    // lobby room can add this user
    // Register user in lobby.
    if (lobby?.isPlaying && newUser !== null) optionalPromiseTasks.push(firestore_.collection("lobbies").doc(lobbyId).collection("users").doc(userId).set(newUser, { merge: true }));

    // let userAlreadyExists = false;

    // if (lobby?.isPlaying) {
    //   const lobbyUser = await firestore_.collection("lobbies").doc(lobbyId).collection("users").doc(userId).get();
    //   userAlreadyExists = lobbyUser.exists;
    // } else {
    //   const realtimeLobbyUser = await databaseTrivia.ref(`/lobbies/${lobbyId}/users/${userId}`).get();
    //   userAlreadyExists = realtimeLobbyUser.exists();
    // }

    // if (!userAlreadyExists) {
    // }

    // increase counter players
    optionalPromiseTasks.push(firestore_.doc(`lobbies/${lobbyId}`).update({
      countPlayers: firebase.firestore.FieldValue.increment(1),
    }))

    await Promise.all([...optionalPromiseTasks]);

    return { success: true, lobby: lobby };
  } catch (e) {
    console.error("Error on assignLobbySeat", e);
    return { success: false, error: e };
  }
};

// reserveLobbySeatSynced runs lobby seat assignation with mutex
export const reserveLobbySeatSynced = async (
  gameName: string,
  lobbyId: string,
  userId: string,
  newUser: any,
): Promise<AssignLobbyResponse> => {
  try {
    return await mutex.runExclusive(async () => {
      const result = await assignLobbySeat(gameName, lobbyId, userId, newUser);

      return result;
    });
  } catch (e) {
    return { success: false, error: e };
  }
};

export const reserveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId, newUser } = req.body;

    console.log(`>>>> lobbyId ${lobbyId}, gameName ${gameName}`);

    const response = await reserveLobbySeatSynced(gameName, lobbyId, userId, newUser);

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, error: "Something went wrong" });
  }
};

