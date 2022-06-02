import { firestoreBingo, firestoreHanged, firestoreTrivia, firestoreRoulette } from "../../../../../firebase";
import { games } from "../../../../../components/common/DataList";

export const selectFirestoreFromLobby = (gameName: string) => {
  const gameName_ = gameName.toLowerCase();

  let selectedFirestore;

  switch (gameName_) {
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

export interface AssignLobbyResponse {
  success: boolean;
  lobby?: any;
  error?: any;
}
