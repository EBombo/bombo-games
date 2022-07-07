import { NextApiRequest, NextApiResponse } from "next";
import { firebase } from "../../../../../firebase";
import { functionalErrorName } from "../../../../../components/common/DataList";
import { selectFirestoreFromLobby, AssignLobbyResponse } from "./utils";

// FreeLobbySeat frees a seat in lobby. Reduces users counter.
export const freeLobbySeat = async (
  gameName: string,
  lobbyId: string,
  userId: string
): Promise<AssignLobbyResponse> => {
  const firestore_ = selectFirestoreFromLobby(gameName);

  if (!firestore_) throw new Error("Selected Game Database is null/undefined.");

  // Decrease counter players.
  const promiseCounter = firestore_.doc(`lobbies/${lobbyId}`).update({
    countPlayers: firebase.firestore.FieldValue.increment(-1),
  });

  await Promise.all([promiseCounter]);

  return { success: true };
};

// FreeLobbySeatSynced frees lobby seat with mutex.
export const leaveLobbySeat = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lobbyId, gameName } = req.query as { [key: string]: string };
    const { userId } = req.body;

    const response = await freeLobbySeat(gameName, lobbyId, userId);

    return res.send(response);
  } catch (error: any) {
    console.error("Error on leaveLobbySeat", error);

    if (error?.message === functionalErrorName) return res.status(409).send({ success: false, error: error?.message });

    return res.status(500).send({ success: false, error: "Something went wrong" });
  }
};
