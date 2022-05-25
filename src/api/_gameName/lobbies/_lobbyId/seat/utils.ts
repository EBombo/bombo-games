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

export const selectFirestoreFromLobby = (gameName: string) => {
  const gameName_ = gameName.toLowerCase();

  let selectedFirestore;

  console.log(`>>> firestoreTrivia ${firestoreTrivia}`);
  switch (gameName_) {
    case games.BINGO:
      selectedFirestore = firestoreBingo;
      break;
    case games.TRIVIA:
      console.log(`>>> firestoreTrivia ${firestoreTrivia}`);
      selectedFirestore = firestoreTrivia;
      break;
    case games.ROULETTE:
      selectedFirestore = firestoreRoulette;
      break;
    case games.HANGED:
      selectedFirestore = firestoreHanged;
      break;
  }

  console.log(`gameName_ ${gameName_}, selectedFirestore ${selectedFirestore}`);

  return selectedFirestore;
};
