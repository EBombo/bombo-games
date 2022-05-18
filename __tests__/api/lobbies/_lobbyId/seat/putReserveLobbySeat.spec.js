import 'dotenv/config'
import { fetchSubscriptionPlanFromLobby, reserveLobbySeatSynced } from "../../../../../src/api/lobbies/_lobbyId/seat/putReserveLobbySeat";
import { FREE_PLAN } from '../../../../../src/business';
import { firestore, firestoreTrivia } from "../../../../../src/firebase";

// describe("sync fn", () => {
//   it("should run once per request", async () => {
//     const processes = [
//       { name: "proc One", id: "CBwynuKu6oEwHvhtmnm5" },
//       { name: "proc Two", id: "ygvhWw0WARvTCzPkyehx" },
//     ];
//     
//     const tasks = processes.map((proc) => assignLobbySeat(proc.name));
//
//     await Promise.all(tasks);
//   }, 8_000);
// }, 10_000);

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
    });

    afterAll(async () => {
      // delete all test data generated in firestore
      const setLobbyFirebaseTriviaPromise = firestoreTrivia.collection("lobbies").doc(lobbyId).delete();

      const setLobbyFirebasePromise = firestore.collection("lobbies").doc(lobbyId).delete();

      await Promise.all([setLobbyFirebaseTriviaPromise, setLobbyFirebasePromise]);
    });

  });
});
