import { useEffect, useGlobal, useState } from "reactn";
import { games } from "../components/common/DataList";
import { config, firestore, firestoreBingo, firestoreRoulette, firestoreTrivia } from "../firebase";
import { fetchUserByEmail } from "../pages/login/fetchUserByEmail";
import { getBingoCard } from "../constants/bingoCards";
import { useRouter } from "next/router";
import { useSendError, useUser } from "../hooks";
import { useFetch } from "../hooks/useFetch";
import { spinLoader } from "../components/common/loader";

export const WithAuthLobby = (props) => {
  const router = useRouter();

  const { Fetch } = useFetch();

  const { sendError } = useSendError();

  const [, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const [isLoading, setIsLoading] = useState(true);

  // Redirect to lobby.
  useEffect(() => {
    if (!authUser?.lobby) return setIsLoading(false);
    if (authUser?.isAdmin) return setIsLoading(false);
    if (!authUser?.nickname) return setIsLoading(false);
    if (authUser?.lobby?.settings?.userIdentity && !authUser?.email) return setIsLoading(false);

    const reserveLobbySeat = async (gameName, lobbyId, userId, newUser) => {
      const fetchProps = {
        url: `${config.serverUrl}/${gameName}/lobbies/${lobbyId}/seat`,
        method: "PUT",
      };

      const { error } = await Fetch(fetchProps.url, fetchProps.method, {
        userId,
        newUser,
        //isValidate: true,
      });

      if (error) throw new Error(error?.message ?? "Something went wrong");
    };

    // Determine is necessary create a user.
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Get game name.
        const gameName = authUser.lobby.game.adminGame.name.toLowerCase();

        // Determine firestore ref.
        const firestoreRef = gameName.includes(games.BINGO)
          ? firestoreBingo
          : gameName.includes(games.ROULETTE)
          ? firestoreRoulette
          : gameName.includes(games.TRIVIA)
          ? firestoreTrivia
          : null;

        // Fetch lobby.
        const lobbyRef = await firestoreRef.doc(`lobbies/${authUser.lobby.id}`).get();
        const lobby = lobbyRef.data();

        if (lobby?.isClosed) {
          props.showNotification("UPS", "El juego esta cerrado");

          await setAuthUser({
            id: firestore.collection("users").doc().id,
            lobby: null,
            isAdmin: false,
            email: authUser.email,
            nickname: authUser.nickname,
          });

          return setIsLoading(false);
        }

        // AuthUser is admin.
        if (authUser.lobby?.game?.usersIds?.includes(authUser.id)) {
          return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);
        }

        // Replace "newUser" if user has already logged in before with the same email.
        const user_ = authUser?.email ? await fetchUserByEmail(authUser.email, authUser.lobby) : null;

        // If user has already logged then redirect.
        if (user_) {
          await reserveLobbySeat(authUser.lobby.game.adminGame.name, authUser.lobby.id, user_.id, user_);

          await setAuthUser(user_);
          setAuthUserLs(user_);

          return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);
        }

        const userId = authUser?.id ?? firestore.collection("users").doc().id;
        const userCard = gameName === games.BINGO ? JSON.stringify(getBingoCard()) : null;

        let newUser = {
          id: userId,
          userId,
          email: authUser?.email ?? null,
          nickname: authUser.nickname,
          avatar: authUser?.avatar ?? null,
          card: userCard,
          lobbyId: lobby.id,
          lobby,
        };

        await reserveLobbySeat(authUser.lobby.game.adminGame.name, authUser.lobby.id, userId, newUser);

        /**
        // Update metrics.
        const promiseMetric = firestoreRef.doc(`games/${lobby?.game?.id}`).update({
          countPlayers: firebase.firestore.FieldValue.increment(1),
        });

        // Register user as a member in company.
        const promiseMember = saveMembers(authUser.lobby, [newUser]);

        await Promise.all([promiseMetric, promiseMember]);
        **/

        await setAuthUser(newUser);
        setAuthUserLs(newUser);

        // Redirect to lobby.
        await router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);
      } catch (error) {
        console.error(error);
        sendError(error, "initialize");
        props.showNotification("Joining to lobby is not possible.", error?.message);

        await setAuthUser({
          id: authUser.id || firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });
      }
      setIsLoading(false);
    };

    initialize();
  }, [authUser.id, authUser?.lobby?.id, authUser?.nickname, authUser?.email]);

  if (isLoading) return spinLoader();

  return props.children;
};
