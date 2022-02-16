import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import { config, firebase, firestore, firestoreBingo, firestoreRoulette, firestoreTrivia } from "../../firebase";
import { NicknameStep } from "./NicknameStep";
import { snapshotToArray } from "../../utils";
import { EmailStep } from "./EmailStep";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useUser } from "../../hooks";
import { PinStep } from "./PinStep";
import { avatars, games } from "../../components/common/DataList";
import { Anchor } from "../../components/form";
import { fetchUserByEmail } from "./fetchUserByEmail";
import { getBingoCard } from "../../constants/bingoCards";
import { saveMembers } from "../../constants/saveMembers";
import { Tooltip } from "antd";

const Login = (props) => {
  const router = useRouter();
  const { pin } = router.query;

  const [, setAuthUserLs] = useUser();
  const [authUser, setAuthUser] = useGlobal("user");

  const [isLoading, setIsLoading] = useState(false);

  const fetchLobby = async (pin, avatar = avatars[0]) => {
    try {
      // Fetch lobby.
      const lobbyRef = await firestore.collection("lobbies").where("pin", "==", pin.toString()).limit(1).get();

      if (lobbyRef.empty) throw Error("No encontramos tu sala, intenta nuevamente");

      const currentLobby = snapshotToArray(lobbyRef)[0];

      if (currentLobby?.isLocked) throw Error("Este juego esta cerrado");

      if (currentLobby?.isClosed) {
        await setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });

        throw Error("Esta sala ha concluido");
      }

      const isAdmin = !!currentLobby?.game?.usersIds?.includes(authUser.id);

      await setAuthUser({ avatar, ...authUser, lobby: currentLobby, isAdmin });
      setAuthUserLs({ avatar, ...authUser, lobby: currentLobby, isAdmin });
    } catch (error) {
      props.showNotification("UPS", error.message, "warning");
    }
    setIsLoading(false);
  };

  // Redirect to lobby.
  useEffect(() => {
    if (!authUser?.lobby) return;
    if (!authUser?.nickname) return;
    if (authUser?.lobby?.settings?.userIdentity && !authUser?.email) return;

    // Determine is necessary create a user.
    const initialize = async () => {
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
        return setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email,
          nickname: authUser.nickname,
        });
      }

      // AuthUser is admin.
      if (authUser.lobby?.game?.usersIds?.includes(authUser.id))
        return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);

      // Replace "newUser" if user has already logged in before with the same email.
      const user_ = authUser?.email ? await fetchUserByEmail(authUser.email, authUser.lobby) : null;

      // If user has already logged then redirect.
      if (user_) {
        await setAuthUser(user_);
        setAuthUserLs(user_);
        return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);
      }

      if (!firestoreRef) return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);

      // Redirect to lobby.
      if (!lobby.isPlaying) return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);

      const userId = authUser?.id ?? firestore.collection("users").doc().id;
      const userCard = (gameName === games.BINGO)
        ? JSON.stringify(getBingoCard())
        : null;

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

      // Update metrics.
      const promiseMetric = firestoreRef.doc(`games/${lobby.game.id}`).update({
        countPlayers: firebase.firestore.FieldValue.increment(1),
      });

      // Register user in lobby.
      const promiseUser = firestoreRef
        .collection("lobbies")
        .doc(lobby.id)
        .collection("users")
        .doc(authUser.id)
        .set(newUser);

      // Register user as a member in company.
      const promiseMember = saveMembers(authUser.lobby, [newUser]);

      await Promise.all([promiseMetric, promiseUser, promiseMember]);

      await setAuthUser(newUser);
      setAuthUserLs(newUser);

      // Redirect to lobby.
      return router.push(`/${gameName}/lobbies/${authUser.lobby.id}`);
    };

    initialize();
  }, [authUser]);

  // Fetch lobby to auto login.
  useEffect(() => {
    if (!authUser?.lobby?.pin) return;

    setIsLoading(true);
    fetchLobby(authUser.lobby.pin);
  }, []);

  // Auto fetch lobby.
  useEffect(() => {
    if (!pin) return;

    setIsLoading(true);
    fetchLobby(pin);
  }, [pin]);

  const emailIsRequired = useMemo(() => {
    return !!authUser?.lobby?.settings?.userIdentity;
  }, [authUser]);

  const goToPinStep = useMemo(
    () => (
      <div className="back">
        <Anchor
          underlined
          variant="white"
          fontSize="16px"
          onClick={async () => {
            await setAuthUser({
              ...authUser,
              email: null,
              nickname: null,
              lobby: null,
            });
            setAuthUserLs({
              ...authUser,
              email: null,
              nickname: null,
              lobby: null,
            });
          }}
        >
          Volver
        </Anchor>
      </div>
    ),
    []
  );

  return (
    <LoginContainer storageUrl={config.storageUrl}>
      <div className="main-container">
        {!authUser?.lobby && (
          <>
            <PinStep isLoading={isLoading} setIsLoading={setIsLoading} fetchLobby={fetchLobby} {...props} />
            {authUser?.email && authUser?.nickname && (
              <div className="back">
                <Tooltip title={`email: ${authUser.email} nickname: ${authUser.nickname}`} placement="bottom">
                  <Anchor
                    underlined
                    variant="white"
                    fontSize="11px"
                    margin="10px auto"
                    onClick={async () => {
                      await setAuthUser({
                        ...authUser,
                        email: null,
                        nickname: null,
                        lobby: null,
                      });
                      setAuthUserLs({
                        ...authUser,
                        email: null,
                        nickname: null,
                        lobby: null,
                      });
                    }}
                  >
                    Remover email y nickname
                  </Anchor>
                </Tooltip>
              </div>
            )}
          </>
        )}
        {authUser?.lobby && (
          <>
            {emailIsRequired && !authUser?.email && (
              <>
                <EmailStep isLoading={isLoading} setIsLoading={setIsLoading} {...props} />
                {goToPinStep}
              </>
            )}

            {(emailIsRequired && authUser?.email && !authUser.nickname) || (!emailIsRequired && !authUser?.nickname) ? (
              <>
                <NicknameStep isLoading={isLoading} setIsLoading={setIsLoading} {...props} />
                {goToPinStep}
              </>
            ) : null}
          </>
        )}
      </div>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  color: ${(props) => props.theme.basic.white};
  width: 100%;
  height: 100vh;
  background-image: url("${(props) => `${props.storageUrl}/resources/coral-pattern-tablet.svg`}");
  background-position: center;
  background-size: contain;

  .main-container {
    padding: 10px;
    max-width: 400px;
    margin: 0 auto;
  }

  .login-container {
    padding: 15px;
    border-radius: 4px;
    background: ${(props) => props.theme.basic.white};

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .back {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 1rem;
  }
`;

export default Login;
