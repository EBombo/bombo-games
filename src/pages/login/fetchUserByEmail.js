import { firestoreBingo, firestoreRoulette, firestoreTrivia } from "../../firebase";
import { snapshotToArray } from "../../utils";
import { games } from "../../components/common/DataList";

export const fetchUserByEmail = async (email, lobby) => {
  const gameName = lobby?.game?.adminGame?.name?.toLowerCase();

  // Prevent gameName is undefined.
  if (!gameName) return;

  // Create game firestore ref.
  let firebaseRef = gameName.includes(games.BINGO)
    ? firestoreBingo.collection("lobbies").doc(lobby.id).collection("users")
    : gameName.includes(games.ROULETTE)
    ? firestoreRoulette.collection("lobbies").doc(lobby.id).collection("users")
    : gameName.includes(games.TRIVIA)
    ? firestoreTrivia.collection("lobbies").doc(lobby.id).collection("users")
    : null;

  // Prevent firebaseRef is undefined.
  if (!firebaseRef) return;

  const userQuery = await firebaseRef.where("email", "==", email).get();
  const currentUser = snapshotToArray(userQuery)[0];

  // Prevent currentUser is undefined.
  if (!currentUser) return;

  // Rollback hasExited.
  await firebaseRef.doc(currentUser.id).update({ hasExited: false });

  return currentUser;
};
