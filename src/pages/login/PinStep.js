import React, {useGlobal} from "reactn";
import {useUser} from "../../hooks";
import styled from "styled-components";
import {config} from "../../firebase";
import {Image} from "../../components/common/Image";
import {ButtonBingo, InputBingo} from "../../components/form";
import {object, string} from "yup";
import {useForm} from "react-hook-form";

export const PinStep = (props) => {
  const [, setAuthUserLs] = useUser();
  const [authUser, setAuthUser] = useGlobal("user");

  const validationSchema = object().shape({
    pin: string().required().min(6),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const validatePin = async (data) => {
    props.setIsLoading(true);

    await props.fetchLobby(data.pin);

    await setAuthUser({ ...authUser, isAdmin: false });
    setAuthUserLs({ ...authUser, isAdmin: false });
  };

  return (
    <ContainerCss>
      <form onSubmit={handleSubmit(validatePin)}>
        <Image
          src={`${config.storageUrl}/resources/white-icon-ebombo.png`}
          width="180px"
          margin="3rem auto 2rem auto"
        />
        <div className="login-container">
          <InputBingo
            ref={register}
            error={errors.pin}
            type="number"
            name="pin"
            align="center"
            width="100%"
            variant="default"
            margin="10px auto"
            defaultValue={authUser?.lobby?.pin ?? null}
            disabled={props.isLoading}
            placeholder="Pin del juego"
          />
          <ButtonBingo width="100%" disabled={props.isLoading} loading={props.isLoading} htmlType="submit">
            Ingresar
          </ButtonBingo>
        </div>
      </form>
    </ContainerCss>
  );
};

const ContainerCss = styled.div``;
