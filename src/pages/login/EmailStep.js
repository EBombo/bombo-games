import React, { useGlobal, useState } from "reactn";
import styled from "styled-components";
import { Image } from "../../components/common/Image";
import { config, firestoreBingo } from "../../firebase";
import { ButtonBingo, InputBingo } from "../../components/form";
import { object, string } from "yup";
import { useForm } from "react-hook-form";
import { ModalVerification } from "./ModalVerification";
import { useSendError, useUser } from "../../hooks";
import { snapshotToArray } from "../../utils";

export const EmailStep = (props) => {
  const { sendError } = useSendError();

  const [, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationSchema = object().shape({
    email: string().required().email(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const emailVerification = async (data) => {
    try {
      setLoading(true);
      const user_ = await fetchUserByEmail(data.email.toLowerCase());

      if (user_) {
        await setAuthUser({ ...authUser, ...user_ });
        return setAuthUserLs({ ...authUser, ...user_ });
      }

      setEmail(data.email.toLowerCase());
    } catch (error) {
      props.showNotification("UPS", "Algo salio mal, intentalo nuevamente", "error");
      await sendError(error, "emailVerification");
    }
    setLoading(true);
  };

  const fetchUserByEmail = async (email) => {
    const gameName = authUser.lobby.game.adminGame.name.toLowerCase();

    // Prevent gameName is undefined.
    if (!gameName) return;

    // Create game firestore ref.
    let firebaseRef = gameName.toLowerCase().includes("bingo")
      ? firestoreBingo.collection("lobbies").doc(authUser.lobby.id).collection("users")
      : null;

    // Prevent firebaseRef is undefined.
    if (!firebaseRef) return;

    const userQuery = await firebaseRef.where("email", "==", email).get();
    const currentUser = snapshotToArray(userQuery)[0];

    // Prevent currentUser is undefined.
    if (!currentUser) return;

    return currentUser;
  };

  return (
    <EmailForm onSubmit={handleSubmit(emailVerification)}>
      {email && (
        <ModalVerification
          email={email}
          isVisibleModalVerification={!!email}
          setIsVisibleModalVerification={async (email) => {
            await setAuthUser({ ...authUser, email: email });
            setAuthUserLs({ ...authUser, email: email });
          }}
          {...props}
        />
      )}

      <Image src={`${config.storageUrl}/resources/white-icon-ebombo.png`} width="180px" margin="10px auto" />

      <div className="login-container">
        <div className="subtitle">Añadir identificación del jugador</div>
        <div className="description">
          El anfitrión del juego ha pedido que coloques tu mail cómo una medida de identificación para entrar al juego
        </div>

        <InputBingo
          ref={register}
          error={errors.email}
          name="email"
          align="center"
          width="100%"
          variant="default"
          margin="10px auto"
          defaultValue={authUser?.email ?? null}
          disabled={props.isLoading}
          placeholder="Ingresa tu email"
        />

        <ButtonBingo width="100%" disabled={props.isLoading} htmlType="submit" loading={loading} disabled={loading}>
          Ingresar
        </ButtonBingo>
      </div>
    </EmailForm>
  );
};

const EmailForm = styled.form`
  padding: 10px;
  max-width: 400px;
  margin: 10% auto auto auto;
  color: ${(props) => props.theme.basic.white};

  .subtitle {
    font-family: Lato;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 22px;
    color: ${(props) => props.theme.basic.blackDarken};
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .description {
    font-family: Lato;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 18px;
    color: ${(props) => props.theme.basic.blackDarken};
    text-align: center;
  }
`;
