import { NextApiRequest, NextApiResponse } from "next";
import { Mutex } from "async-mutex";
import {
  firestore,
  firebase,
  firestoreEvents,
  firestoreBingo,
  firestoreHanged,
  firestoreTrivia,
  firestoreRoulette,
} from "../../../../../firebase";
import { games } from "../../../../../components/common/DataList";
import { transformSubscription, FREE_PLAN } from "../../../../../business";
import { selectFirestoreFromLobby } from "./utils";

// freeLobbySeat frees a seat in lobby. Reduces users counter.
export const freeLobbySeat = async (
  gameName: string,
  lobbyId: string,
  userId: string
): Promise<AssignLobbyResponse> => {
  try {
    const firestore_ = selectFirestoreFromLobby(gameName);

    if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

    // decrease counter players
    const promiseCounter = firestore_.doc(`lobbies/${lobbyId}`).update({
      countPlayers: firebase.firestore.FieldValue.increment(-1),
    });

    await Promise.all([promiseCounter]);

    return { success: true };
  } catch (e) {
    console.error("Error on freeLobbySeat", e);
    return { success: false, error: e };
  }
};

// freeLobbySeatSynced frees lobby seat with mutex
export const leaveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId } = req.body;

    const response = await freeLobbySeat(gameName, lobbyId, userId);

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, error: "Something went wrong" });
  }
};
