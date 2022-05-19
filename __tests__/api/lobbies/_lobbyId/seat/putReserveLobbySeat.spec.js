import 'dotenv/config'
import { fetchSubscriptionPlanFromLobby, reserveLobbySeatSynced } from "../../../../../src/api/lobbies/_lobbyId/seat/putReserveLobbySeat";
import { FREE_PLAN } from '../../../../../src/business';
import { firestore, firestoreTrivia } from "../../../../../src/firebase";
import { snapshotToArray } from "../../../../../src/utils";

// TODO: refactor test data because it cannot be integrated into CI/CD.
// It depends on current companies data in ebombo-events-dev
describe("fetchSubscriptionPlanFromLobby", () => {

  describe("Given a lobby from owner with paid subscription", () => {

    const companyId = "0Q1Z3eqGxdGXV05PmtW0";

    it("should return the right plan", async () => {

      const lobby = {
        game: { user: { companyId: companyId}},
      };

      const plan = await fetchSubscriptionPlanFromLobby(lobby);

      expect(plan.status).toBe("active");
      expect(plan.users).toEqual(expect.any(Number));
    });

  });

  describe("Given a lobby from owner with no subscription", () => {

    const companyId = "KAhjCEfIIDr74uJJL9L8";

    it("should return the default FREE plan", async () => {

      const lobby = {
        game: { user: { companyId: companyId}},
      };

      const plan = await fetchSubscriptionPlanFromLobby(lobby);

      expect(plan.status).toBeUndefined();
      expect(plan.users).toEqual(FREE_PLAN.users);
    });

  });

  describe("Given a lobby from owner with canceled subscription(s)", () => {

    const companyId = "ntl101yD5Nl5U5BszUUF";

    it("should return the default FREE plan", async () => {

      const lobby = {
        game: { user: { companyId: companyId}},
      };

      const plan = await fetchSubscriptionPlanFromLobby(lobby);

      expect(plan.status).toBeUndefined();
      expect(plan.users).toEqual(FREE_PLAN.users);
    });

  });

  describe("Given a lobby from an owner not customer", () => {

    const companyId = "lbeX0hPXhw4Vx1sn2oLd";

    it("should return the default FREE plan", async () => {

      const lobby = {
        game: { user: { companyId: companyId}},
      };

      const plan = await fetchSubscriptionPlanFromLobby(lobby);

      expect(plan.status).toBeUndefined();
      expect(plan.users).toEqual(FREE_PLAN.users);
    });

  });

  describe("Given a lobby from an owner without company", () => {

    it("should return the default FREE plan", async () => {

      const lobby = {
        game: { user: {}},
      };

      const plan = await fetchSubscriptionPlanFromLobby(lobby);

      expect(plan.status).toBeUndefined();
      expect(plan.users).toEqual(FREE_PLAN.users);
    });
  });
});

describe("A user requests to enter into a Game Lobby", () => {

  describe("the lobby has seats available and owner has a paid subscription", () => {

    // const triviaGameId = "4zZQ3JaY2icFfwTdWrWc";
    const lobbyId = `test_${firestoreTrivia.collection("lobbies").doc().id}`
    const companyId = "0Q1Z3eqGxdGXV05PmtW0";
    const lobby = {
      id: lobbyId,
      createAt: new Date(),
      game: {
        adminGame: {
          name: "trivia"
        },
        user: {
          companyId: companyId,
        }
      },
    };

    beforeAll(async () => {
      const setLobbyFirebaseTriviaPromise = firestoreTrivia.collection("lobbies").doc(lobbyId).set({
        ...lobby,
      });

      const setLobbyFirebasePromise = firestore.collection("lobbies").doc(lobbyId).set({
        ...lobby,
      });

      await Promise.all([setLobbyFirebaseTriviaPromise, setLobbyFirebasePromise]);
    });

    test("assigning a seat", async () => {
      let userId = "test_user";
      let newUser = {
        id: userId,
        userId,
        email: "abc@gmail.com",
        nickname: "abc",
        avatar: null,
        lobbyId: lobbyId,
        lobby,
      };

      const result = await reserveLobbySeatSynced(lobbyId, userId, newUser);

      expect(result?.success).toBe(true);
      expect(result?.lobby).not.toBe(null);

      const lobbyUsersSnapshot = await firestoreTrivia.collection(`lobbies/${lobbyId}/users`).get();
      
      expect(lobbyUsersSnapshot.size).toEqual(1);
    }, 5_000);

    afterAll(async () => {
      // delete all test data generated in firestore
      const setLobbyFirebaseTriviaPromise = firestoreTrivia.collection("lobbies").doc(lobbyId).delete();

      const setLobbyFirebasePromise = firestore.collection("lobbies").doc(lobbyId).delete();

      await Promise.all([setLobbyFirebaseTriviaPromise, setLobbyFirebasePromise]);
    });

  }, 5_000);
}, 5_000);

describe("reserveLobbySeatSynced", () => {

  describe("when lobby has seats available and owner has a paid subscription", () => {
    // plan supports 20 users in lobby
    const companyId = "0Q1Z3eqGxdGXV05PmtW0";
    const lobbyMaxSize = 20;
    const lobbyId = `test_${firestoreTrivia.collection("lobbies").doc().id}`
    const initialCountPlayers = 15;
    const lobby = {
      id: lobbyId,
      createAt: new Date(),
      countPlayers: initialCountPlayers,
      game: {
        adminGame: {
          name: "trivia"
        },
        user: {
          companyId: companyId,
        }
      },
    };

    beforeAll(async () => {
      const setLobbyFirebaseTriviaPromise = firestoreTrivia.collection("lobbies").doc(lobbyId).set({
        ...lobby,
      });

      const setLobbyFirebasePromise = firestore.collection("lobbies").doc(lobbyId).set({
        ...lobby,
      });

      await Promise.all([setLobbyFirebaseTriviaPromise, setLobbyFirebasePromise]);
    });

    it("should run once per request", async () => {

      // let userId = "test_user";

      const processes = [1,2,3,4,5,6,8].map((count) => ({
        lobbyId,
        userId: `user_test_${count}`,
        newUser: {
          userId: `user_test_${count}`,
          email: `user_test_${count}@gmail.com`,
          nickname: `user_test_${count}`,
          avatar: null,
          lobbyId,
          lobby,
        },
      }));
     
      const tasks = processes.map((proc) => reserveLobbySeatSynced(proc.lobbyId, proc.userId, proc.newUser));

      const responses = await Promise.all(tasks);

      const lobbyUsersSnapshot = await firestoreTrivia.collection(`lobbies/${lobbyId}/users`).get();

      const actualLobbySnapshot = await firestoreTrivia.doc(`lobbies/${lobbyId}`).get();
      const actualLobby = actualLobbySnapshot.data();
      
      expect(lobbyUsersSnapshot.size).toEqual(lobbyMaxSize - initialCountPlayers);
      expect(actualLobby.countPlayers).toEqual(lobbyMaxSize);

    }, 30_000);

    afterAll(async () => {
      // delete all test data generated in firestore
      const setLobbyFirebaseTriviaPromise = firestoreTrivia.collection("lobbies").doc(lobbyId).delete();

      const setLobbyFirebasePromise = firestore.collection("lobbies").doc(lobbyId).delete();

      await Promise.all([setLobbyFirebaseTriviaPromise, setLobbyFirebasePromise]);
    });
  });

}, 30_000);

