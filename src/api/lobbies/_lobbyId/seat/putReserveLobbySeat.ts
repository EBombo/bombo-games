import { NextApiRequest, NextApiResponse } from "next";
import { Mutex } from "async-mutex";
import { firestore, firebase, firestoreEvents, firestoreBingo, firestoreHanged, firestoreTrivia, firestoreRoulette} from "../../../../firebase";
import { games } from "../../../../components/common/DataList";
import { transformSubscription, FREE_PLAN } from "../../../../business";

const mutex = new Mutex();

interface AssignLobbyResponse {
  success: boolean,
  lobby?: any,
  error?: any,
};


const selectFirestoreFromLobby = (lobby : any) => {

  const gameName = lobby.game.adminGame.name.toLowerCase();
  let selectedFirestore;

  switch(gameName) {
    case games.BINGO:
      selectedFirestore = firestoreBingo;
      break;
    case games.TRIVIA:
      selectedFirestore = firestoreTrivia;
      break;
    case games.ROULETTE:
      selectedFirestore = firestoreRoulette;
      break;
    case games.HANGED:
      selectedFirestore = firestoreHanged;
      break;
  }

  return selectedFirestore;
};

export const fetchSubscriptionPlanFromLobby = async (lobby: any) => {

  const companyId = lobby.game?.user?.companyId;
  // if no companyId, then return FREE_PLAN
  if (!companyId) return FREE_PLAN; 

  const customersQuerySnapshot = await firestoreEvents.collection("customers").where("companyId", "==", companyId).limit(1).get();

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
export const assignLobbySeat = async (lobbyId : string, userId : string, newUser : any) : Promise<AssignLobbyResponse> => {
  try {
    // fetchLobby from Firestore BomboGames 
    const lobbySnapshot_ = await firestore.doc(`lobbies/${lobbyId}`).get();

    const lobby_ = lobbySnapshot_.data();

    const firestore_ = selectFirestoreFromLobby(lobby_);

    if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

    // fetchLobby from game's Firestore to update data
    const lobbySnapshot = await firestore_.doc(`lobbies/${lobbyId}`).get();

    const lobby = lobbySnapshot.data();

    const subscription = await fetchSubscriptionPlanFromLobby(lobby);

    if (lobby?.countPlayers >= subscription.users) throw new Error("Lobby room is complete. User cannot join to lobby");

    // lobby room can add this user
    // Register user in lobby.
    const promiseUser = firestore_
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .doc(userId)
      .set(newUser);

    // increase counter players
    const promiseCounter = firestore_.doc(`lobbies/${lobbyId}`).update({
      countPlayers: firebase.firestore.FieldValue.increment(1),
    });

    await Promise.all([promiseUser, promiseCounter]);

    return { success: true, lobby: lobby };
  } catch (e) {
    return { success: false, error: e };
  }
};

// reserveLobbySeatSynced runs lobby seat assignation with mutex
export const reserveLobbySeatSynced = async (lobbyId : string, userId : string, newUser : any) : Promise<AssignLobbyResponse> => {
  try {
    return await mutex.runExclusive(async () => {

      const result = await assignLobbySeat(lobbyId, userId, newUser);

      return result;
    });
  } catch (e) {
    return { success: false, error: e };
  }
};

const reserveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId } = req.query as { [key: string]: string };
    const { userId, newUser } = req.body;

    const response = await reserveLobbySeatSynced(lobbyId, userId, newUser);

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({success: false, error: "Something went wrong"});
  }
};

export default reserveLobbySeat;
