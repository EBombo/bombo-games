import React, { useEffect, useGlobal, useMemo, useState } from "reactn";
import { config, firestore } from "../../firebase";
import { NicknameStep } from "./NicknameStep";
import { snapshotToArray } from "../../utils";
import { EmailStep } from "./EmailStep";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useTranslation, useUser } from "../../hooks";
import { PinStep } from "./PinStep";
import { avatars } from "../../components/common/DataList";
import { Anchor } from "../../components/form";
import { Tooltip } from "antd";

const Login = (props) => {
  const router = useRouter();
  const { pin } = router.query;

  const { t, SwitchTranslation } = useTranslation("login");

  const [, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const [isLoading, setIsLoading] = useState(false);

  const fetchLobby = async (pin, avatar = avatars[0]) => {
    try {
      // Fetch lobby.
      const lobbyRef = await firestore.collection("lobbies").where("pin", "==", pin.toString()).limit(1).get();

      if (lobbyRef.empty) throw Error(t("cant-find-room"));

      const currentLobby = snapshotToArray(lobbyRef)[0];

      if (currentLobby?.isLocked) throw Error(t("game-is-closed"));

      if (currentLobby?.isClosed) {
        await setAuthUser({
          id: firestore.collection("users").doc().id,
          lobby: null,
          isAdmin: false,
          email: authUser.email || null,
          nickname: authUser.nickname,
        });

        throw Error(t("room-is-over"));
      }

      const isAdmin = !!currentLobby?.game?.usersIds?.includes(authUser.id);

      await setAuthUser({ avatar, ...authUser, email: authUser.email || null, lobby: currentLobby, isAdmin });
      setAuthUserLs({ avatar, ...authUser, email: authUser.email || null, lobby: currentLobby, isAdmin });
    } catch (error) {
      props.showNotification("UPS", error.message, "warning");
    }
    setIsLoading(false);
  };

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
          {t("back")}
        </Anchor>
      </div>
    ),
    []
  );

  return (
    <LoginContainer storageUrl={config.storageUrl}>
      <div className="absolute top-4 right-4 lg:top-10 lg:right-10">
        <SwitchTranslation />
      </div>

      <div className="main-container">
        {!authUser?.lobby && (
          <>
            <PinStep isLoading={isLoading} setIsLoading={setIsLoading} fetchLobby={fetchLobby} {...props} />

            {(authUser?.email || authUser?.nickname) && (
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
                    {t("remove-info")}
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
