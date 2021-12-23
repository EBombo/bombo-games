import React, { useGlobal } from "reactn";
import { ButtonBingo, InputBingo } from "../../components/form";
import { Image } from "../../components/common/Image";
import { useForm } from "react-hook-form";
import { config } from "../../firebase";
import styled from "styled-components";
import { object, string } from "yup";
import { useUser } from "../../hooks";
import { ValidateNickname } from "./ValidateNickname";

export const NicknameStep = (props) => {
  const [, setAuthUserLs] = useUser();

  const [authUser, setAuthUser] = useGlobal("user");

  const validationSchema = object().shape({
    nickname: string().required(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const validateNickname = async (data) => {
    props.setIsLoading(true);

    await setAuthUser({ ...authUser, nickname: data.nickname });
    setAuthUserLs({ ...authUser, nickname: data.nickname });

    props.setIsLoading(false);
  };

  return (
    <NicknameForm onSubmit={handleSubmit(validateNickname)}>
      {props.isLoading && <ValidateNickname {...props} />}

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
