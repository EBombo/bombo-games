import React, { useGlobal, useState } from "reactn";
import { config } from "../../firebase";
import { Image } from "../../components/common/Image";
import { ButtonBingo, InputBingo } from "../../components/form";
import { object, string } from "yup";
import { useForm } from "react-hook-form";
import { avatars } from "../../components/common/DataList";

export const PinStep = (props) => {
  const [authUser] = useGlobal("user");

  const [avatarIdx, setAvatarIdx] = useState(0);

  const validationSchema = object().shape({
    pin: string().required().min(6),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const validatePin = async (data) => {
    props.setIsLoading(true);

    await props.fetchLobby(data.pin, avatars[avatarIdx]);
  };

  return (
    <form onSubmit={handleSubmit(validatePin)}>
      <Image src={`${config.storageUrl}/resources/white-icon-ebombo.png`} width="180px" margin="3rem auto 2rem auto" />
      {/*
        <Carousel
        showArrows
        hideDots
        index={avatarIdx}
        setIndex={setAvatarIdx}
        components={avatars.map((avatar, index) => (
          <div className="avatar-container" key={`${index}-${avatar}`}>
            <Image
              src={avatar}
              height="150px"
              width="150px"
              borderRadius="50%"
              size="cover"
              margin="auto"
              border={`3px solid ${darkTheme.basic.whiteLight}`}
            />
          </div>
        ))}
      />
         */}
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
  );
};
