import { firestoreBingo, firestoreHanged, firestoreRoulette, firestoreTrivia } from "../../../../../firebase";
import { functionalErrorName, games } from "../../../../../components/common/DataList";

export const selectFirestoreFromLobby = (gameName: string) => {
  const gameNameFormatted = gameName.toLowerCase();

  let selectedFirestore;

  switch (gameNameFormatted) {
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

export class FunctionalError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = functionalErrorName;
  }
}
