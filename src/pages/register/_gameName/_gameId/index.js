import React from "reactn";
import UserLayout from "../../../../components/UserLayout";
import { firestoreBingo, firestoreRoulette } from "../../../../firebase";
import { object, string } from "yup";
import { useForm } from "react-hook-form";
import { ButtonAnt, Input } from "../../../../components/form";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSendError } from "../../../../hooks";

export const Register = (props) => {
  const router = useRouter();
  const { gameName, gameId } = router.query;

  const { sendError } = useSendError();

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = object().shape({
    name: string().required(),
    email: string().required().email(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const fetchGame = async (gameRef) => {
    // Fetch game.
    const gameQuery = await gameRef.collection("games").doc(gameId).get();

    return gameQuery.data();
  };

  const saveRegistration = async (data) => {
    try {
      setIsLoading(true);

      // Define firebase ref.
      const firebaseRef = gameName === "bingo" ? firestoreBingo : firestoreRoulette;

      const game = await fetchGame(firebaseRef);

      if (!game)
        return props.showNotification("UPS", "No se encontro el juego. Consulte con el administrador", "error");

      const visitorRef = firebaseRef.collection("visitors");

      const visitorId = visitorRef.doc().id;

      await visitorRef.doc(visitorId).set({
        ...data,
        createAt: new Date(),
        updateAt: new Date(),
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

  return (
    <div className="bg-secondary w-full h-screen bg-center bg-contain bg-pattern">
      <UserLayout />
      <div className="w-full p-4 max-w-[820px] m-auto">
        <div className="flex flex-col-reverse items-center md:flex-row md:justify-between my-4 mx-auto">
          <div className="text-['Lato'] text-[30px] leading-[36px] font-[900] text-whiteDark my-4">
            Link de inscripción
          </div>
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
