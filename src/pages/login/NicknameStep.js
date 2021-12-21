import React, { useEffect, useGlobal, useState } from "reactn";
import { ButtonBingo, InputBingo } from "../../components/form";
import { Image } from "../../components/common/Image";
import { useForm } from "react-hook-form";
import { config, database, firebase, firestoreBingo, firestoreEvents } from "../../firebase";
import styled from "styled-components";
import { object, string } from "yup";
import { useSendError, useUser } from "../../hooks";
import { ValidateNickname } from "./ValidateNickname";
import { snapshotToArray } from "../../utils";
import { getBingoCard } from "../../constants/bingoCards";

export const NicknameStep = (props) => {
  const { sendError } = useSendError();

  const [, setAuthUserLs] = useUser();
  const [authUser, setAuthUser] = useGlobal("user");

  const [users, setUsers] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validationSchema = object().shape({
    nickname: string().required(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (!authUser?.lobby) return;

    const fetchUsers = async () => {
      const userStatusDatabaseRef = database.ref(`lobbies/${authUser.lobby.id}/users`);

      userStatusDatabaseRef.on("value", (snapshot) => {
        let users_ = Object.values(snapshot.val() ?? {});
        users_ = users_.filter((user) => user.state.includes("online"));
        setUsers(users_);
      });
    };

    fetchUsers();
  }, [authUser.lobby]);

  const validateNickname = async (data) => {
    setIsValidating(true);
    props.setIsLoading(true);

    try {
      const gameName = authUser.lobby.game.adminGame.name.toLowerCase();

      // TODO: Use subCollection to validate nickname.
      /*
      if (defaultTo(users, []).some((user) => user.nickname === data.nickname)) {
        setIsValidating(false);
        throw Error("ERROR", "El nickname ya se encuentra registrado");
      }
       */

      const newUser = {
        id: authUser?.id ?? null,
        email: authUser?.email ?? null,
        userId: authUser?.id ?? null,
        nickname: data.nickname,
        avatar: authUser?.avatar ?? null,
        lobbyId: authUser.lobby.id,
        lobby: authUser.lobby,
      };

      if (gameName === "bingo") {
        const lobbyRef = await firestoreBingo.doc(`lobbies/${newUser.lobbyId}`).get();
        const lobby = lobbyRef.data();

        if (lobby?.isPlaying) {
          newUser.card = JSON.stringify(getBingoCard());

          await firestoreBingo.doc(`games/${lobby.game.id}`).update({
            countPlayers: firebase.firestore.FieldValue.increment(1),
          });

          await firestoreBingo.collection("lobbies").doc(lobby.id).collection("users").doc(authUser.id).set(newUser);

          await saveMembers(lobby, [newUser]);
        }
      }

      await setAuthUser(newUser);
      setAuthUserLs(newUser);
    } catch (error) {
      props.showNotification("Error", error.message);

      await sendError({
        error: Object(error).toString(),
        action: "nicknameSubmit",
      });
    }

    props.setIsLoading(false);
    setIsValidating(false);
  };

  const saveMembers = async (lobby, users) => {
    if (!lobby.companyId) return;

    const promises = Object.values(users).map(async (user) => {
      const { nickname, email } = user;

      const membersRef = firestoreEvents.collection("companies").doc(lobby.companyId).collection("members");

      // Fetch users to verify.
      const usersQuery = await membersRef
        .where("searchName", "array-contains-any", [nickname?.toUpperCase(), email?.toUpperCase()])
        .get();
      const currentUsers = snapshotToArray(usersQuery);
      const currentUser = currentUsers[0];

      // Default properties.
      let newUser = {};
      const memberId = currentUser?.id ?? membersRef.doc().id;

      // Create member with format.
      if (!currentUser)
        newUser = {
          nickname: user.nickname ?? null,
          email: user.email ?? null,
          id: memberId,
          createAt: new Date(),
          updateAt: new Date(),
          deleted: false,
          status: "Active",
          role: "member",
          ads: [],
          searchName: [nickname?.toUpperCase(), email?.toUpperCase()],
        };

      // Update members.
      membersRef
        .doc(memberId)
        .set({ ...newUser, countPlays: firebase.firestore.FieldValue.increment(1) }, { merge: true });
    });

    await Promise.all(promises);
  };

  return (
    <NicknameForm onSubmit={handleSubmit(validateNickname)}>
      {isValidating && <ValidateNickname {...props} />}

      <Image src={`${config.storageUrl}/resources/white-icon-ebombo.png`} width="180px" margin="10px auto" />

      <div className="login-container">
        <InputBingo
          ref={register}
          error={errors.nickname}
          name="nickname"
          align="center"
          width="100%"
          margin="10px auto"
          variant="default"
          defaultValue={authUser?.nickname ?? null}
          disabled={props.isLoading}
          placeholder="Apodo"
          autoComplete="off"
        />

        <ButtonBingo width="100%" disabled={props.isLoading} loading={props.isLoading} htmlType="submit">
          Ingresar
        </ButtonBingo>
      </div>
    </NicknameForm>
  );
};

const NicknameForm = styled.form`
  padding: 10px;
  max-width: 400px;
  margin: 10% auto auto auto;
  color: ${(props) => props.theme.basic.white};
`;
