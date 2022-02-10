import React from "reactn";
import UserLayout from "../../../../components/UserLayout";
import { Image } from "../../../../components/common/Image";
import { config, firestoreBingo, firestoreRoulette } from "../../../../firebase";
import { object, string } from "yup";
import { useForm } from "react-hook-form";
import { ButtonAnt, Input } from "../../../../components/form";
import { ArrowRightOutlined } from "@ant-design/icons";
import { darkTheme } from "../../../../theme";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSendError } from "../../../../hooks";

export const Register = (props) => {
  const router = useRouter();
  const { sendError } = useSendError();

  const { gameName, gameId } = router.query;

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = object().shape({
    name: string().required(),
    cardId: string().required(),
    email: string().required().email(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const saveRegistration = async (data) => {
    try {
      setIsLoading(true);
      const game = await fetchGame();

      if (!game)
        return props.showNotification("UPS", "No se encontro el juego. Consulte con el administrador", "error");

      const visitorRef = await (gameName === "bingo" ? firestoreBingo : firestoreRoulette).collection("visitors");

      const visitorId = visitorRef.doc().id;

      await (gameName === "bingo" ? firestoreBingo : firestoreRoulette)
        .collection("visitors")
        .doc(visitorId)
        .set({
          ...data,
          game: {
            id: gameId,
            name: game.name,
            createAt: game.createAt,
            user: game.user,
          },
        });

      props.showNotification("Congratulations!", "Se ha inscrito correctamente.", "success");
      router.push("/");
    } catch (error) {
      console.error(error);
      await sendError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGame = async () => {
    let game, gameRef;

    if (gameName === "bingo") {
      gameRef = await firestoreBingo.collection("games").doc(gameId).get();
    }

    if (gameName === "roulette") {
      gameRef = await firestoreRoulette.collectio("games").doc(gameId).get();
    }

    game = gameRef?.data();

    return game;
  };

  return (
    <div className="bg-secondary w-full h-screen bg-center bg-contain bg-pattern">
      <UserLayout />
      <div className="w-full p-4 max-w-[820px] m-auto">
        <div className="flex flex-col-reverse items-center md:flex-row md:justify-between my-4 mx-auto">
          <div className="text-['Lato'] text-[30px] leading-[36px] font-[900] text-whiteDark my-4">
            Link de inscripción
          </div>
          <Image
            src={`${config.storageUrl}/resources/companies/carvajal.png`}
            width="225px"
            height="auto"
            size="contain"
            margin="0"
          />
        </div>

        <div className="w-full rounded-[10px] bg-whiteDark p-4">
          <form className="w-full" onSubmit={handleSubmit(saveRegistration)}>
            <div className="w-full rounded-[4px] bg-whiteLight p-4 my-4">
              <div className="text-secondary mb-4 text-['Lato'] text-[20px] leading-[24px] font-bold">Tu nombre</div>
              <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <Input
                  ref={register}
                  error={errors.name}
                  name="name"
                  height="65px"
                  background="#E3E3E3"
                  placeholder="Nombres"
                  border="0"
                />

                <Input
                  ref={register}
                  error={errors.lastName}
                  name="lastName"
                  background="#E3E3E3"
                  height="65px"
                  border="0"
                  placeholder="Apellidos"
                />
              </div>
            </div>

            <div className="w-full rounded-[4px] bg-whiteLight p-4 my-4">
              <div className="text-secondary mb-4 text-['Lato'] text-[20px] leading-[24px] font-bold">
                Correo Electrónico
              </div>
              <div className="flex">
                <Input
                  ref={register}
                  error={errors.email}
                  name="email"
                  background="#E3E3E3"
                  height="65px"
                  border="0"
                  placeholder="Escribe tu correo aquí..."
                />
              </div>
            </div>

            <div className="w-full rounded-[4px] bg-whiteLight p-4 my-4">
              <div className="grid gap-[1rem] md:grid-cols-[2fr_1fr]">
                <div>
                  <div className="text-secondary mb-4 text-['Lato'] text-[20px] leading-[24px] font-bold">
                    ¿Cuál es el ID de tu cartilla?
                  </div>
                  <div className="text-['Lato'] font-[400] text-[16px] leading-[20px] text-grayLight my-4">
                    (Se encuentra en la parte superior izquierda de tu cartilla)
                  </div>
                  <div className="flex flex-col	 md:flex-row	">
                    <Input
                      ref={register}
                      error={errors.cardId}
                      name="cardId"
                      height="65px"
                      background="#E3E3E3"
                      border="0"
                      placeholder="Escribe el ID aquí..."
                    />
                  </div>
                </div>
                <div className="flex m-auto">
                  <ArrowRightOutlined style={{ fontSize: "16px", color: darkTheme.basic.secondary }} />
                  <div className="ml-[10px]">
                    <div className="text-['Lato'] font-bold text-[12px] leading-[14px] text-grayLight">ID 001</div>
                    <div>
                      <Image
                        src={`${config.storageUrl}/resources/bingo-card.png`}
                        width="115px"
                        height="145px"
                        size="contain"
                        margin="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ButtonAnt color="success" htmlType="submit" margin="auto" loading={isLoading} disabled={isLoading}>
                <div className="text-['Lato'] font-[900] text-[24px] leading-[28px] text-blackDarken">Enviar</div>
              </ButtonAnt>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
