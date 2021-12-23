import { firestoreBingo } from "../../firebase";
import { snapshotToArray } from "../../utils";

export const fetchUserByEmail = async (email, lobby) => {
  const gameName = lobby?.game?.adminGame?.name?.toLowerCase();

  // Prevent gameName is undefined.
  if (!gameName) return;

  // Create game firestore ref.
  let firebaseRef = gameName.includes("bingo")
    ? firestoreBingo.collection("lobbies").doc(lobby.id).collection("users")
    : null;

  // Prevent firebaseRef is undefined.
  if (!firebaseRef) return;

  const userQuery = await firebaseRef.where("email", "==", email).get();
  const currentUser = snapshotToArray(userQuery)[0];

  // Prevent currentUser is undefined.
  if (!currentUser) return;

  return currentUser;
};
