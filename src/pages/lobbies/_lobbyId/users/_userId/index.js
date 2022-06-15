import React, { useEffect, useState } from "reactn";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import {
  config,
  firestore,
  firestoreBingo,
  firestoreHanged,
  firestoreRoulette,
  firestoreTrivia,
} from "../../../../../firebase";
import { Image } from "../../../../../components/common/Image";
import { ButtonAnt, Checkbox, TextArea } from "../../../../../components/form";
import { spinLoader } from "../../../../../components/common/loader";

export const Feedback = (props) => {
  const router = useRouter();

  const { lobbyId, userId } = router.query;

  const [lobby, setLobby] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewScore, setReviewScore] = useState(null);
  const [playWithoutProblem, setPlayWithoutProblem] = useState(null);
  const [playAgain, setPlayAgain] = useState(null);
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, []);

  useEffect(() => {
    const fetchUser = async (_lobby) => {
      const currentFirestore = gamesFirestore(_lobby?.game?.adminGame?.name);

      const _userRef = await currentFirestore.collection("lobbies").doc(lobbyId).collection("users").doc(userId).get();

      setUser(_userRef);
      setLoading(false);
    };

    const fetchLobby = async () => {
      const _lobbyRef = await firestore.collection("lobbies").doc(lobbyId).get();

      const _lobby = _lobbyRef.data();

      setLobby(_lobby);

      await fetchUser(_lobby);
    };

    fetchLobby();
  }, [lobbyId, userId]);

  const validationSchema = object().shape({
    comment: string().required(),
  });

  const { register, errors, handleSubmit, reset } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const gamesFirestore = (name) => {
    switch (name) {
      case "bingo":
        return firestoreBingo;
      case "trivia":
        return firestoreTrivia;
      case "hanged":
        return firestoreHanged;
      case "roulette":
        return firestoreRoulette;
      case "rouletteQuestions":
        return firestoreRoulette;
      default:
        return firestore;
    }
  };

  const saveFeedback = async (data) => {
    if (!reviewScore || !playWithoutProblem || !playAgain)
      return props.showNotification("Error", "Complete todos los campos!");

    setSavingFeedback(true);

    const currentFirestore = gamesFirestore(lobby?.game?.adminGame?.name);

    const newId = currentFirestore.collection("feedbacks").doc().id;

    await currentFirestore
      .collection("feedbacks")
      .doc(newId)
      .set(
        {
          reviewScore,
          playWithoutProblem,
          playAgain,
          comment: data.comment,
          lobbyId,
          user: JSON.stringify(user),
        },
        { merge: true }
      );

    props.showNotification("OK", "Muchas gracias por el feedback!", "success");

    await reset();
    setReviewScore(null);
    setPlayWithoutProblem(null);
    setPlayAgain(null);

    setSavingFeedback(false);

    router.push("/");
  };

  if (loading)
    return <div className="bg-secondary w-full h-screen bg-center bg-contain bg-pattern">{spinLoader()}</div>;

  return (
    <div className="bg-secondary w-full h-screen bg-center bg-contain bg-pattern">
      <div className="bg-whiteDark h-[50px] flex items-center w-full shadow-[2px_0_4px_rgba(0,0,0,0.25)] mb-8">
        <div className="no-wrap text-blackDarken text-[25px] leading-[30px] font-[700] text-center w-full">
          {lobby?.game?.name}
        </div>
      </div>
      <div className="max-w-[550px] flex flex-col gap-4 mx-auto">
        <div className="text-whiteDark font-[700] text-[30px] leading-[36px] text-center">Feedback</div>
        <div className="text-whiteDark font-[400] text-[20px] leading-[24px] text-center p-2">
          ¡Esperamos que la hayas pasado genial! ¡Déjanos tu opinión!
        </div>
        <div className="w-full p-4">
          <form onSubmit={handleSubmit(saveFeedback)} className="w-full bg-whiteDark p-4 rounded-[4px]">
            <div className="bg-whiteLight p-2 rounded-[4px]">
              <div className="text-grayLight text-[14px] leading-[17px] mb-4 font-[700]">¿Te divertiste?</div>
              <div className="text-grayLight text-[14px] leading-[17px] mb-4 font-[400]">
                Elige la emoción que más te identifique
              </div>
              <div className="max-w-[90%] mx-auto py-4 flex items-center justify-between">
                <Image
                  src={`${config.storageUrl}/resources/scores/score-0.svg`}
                  width="42px"
                  height="42px"
                  size="contain"
                  borderRadius="50%"
                  margin="0"
                  border={reviewScore === 0 ? "3px solid #956DFC" : "none"}
                  cursor="pointer"
                  onClick={() => setReviewScore(0)}
                />
                <Image
                  src={`${config.storageUrl}/resources/scores/score-1.svg`}
                  width="42px"
                  height="42px"
                  size="contain"
                  borderRadius="50%"
                  margin="0"
                  border={reviewScore === 1 ? "3px solid #956DFC" : "none"}
                  cursor="pointer"
                  onClick={() => setReviewScore(1)}
                />
                <Image
                  src={`${config.storageUrl}/resources/scores/score-2.svg`}
                  width="42px"
                  height="42px"
                  size="contain"
                  borderRadius="50%"
                  margin="0"
                  border={reviewScore === 2 ? "3px solid #956DFC" : "none"}
                  cursor="pointer"
                  onClick={() => setReviewScore(2)}
                />
                <Image
                  src={`${config.storageUrl}/resources/scores/score-3.svg`}
                  width="42px"
                  height="42px"
                  size="contain"
                  borderRadius="50%"
                  margin="0"
                  border={reviewScore === 3 ? "3px solid #956DFC" : "none"}
                  cursor="pointer"
                  onClick={() => setReviewScore(3)}
                />
                <Image
                  src={`${config.storageUrl}/resources/scores/score-4.svg`}
                  width="42px"
                  height="42px"
                  size="contain"
                  borderRadius="50%"
                  margin="0"
                  border={reviewScore === 4 ? "3px solid #956DFC" : "none"}
                  cursor="pointer"
                  onClick={() => setReviewScore(4)}
                />
              </div>
            </div>

            <div className="bg-whiteLight p-2 rounded-[4px] flex items-center justify-between my-4">
              <div className="text-grayLight text-[14px] leading-[17px] font-[700]">¿Jugaste sin problema?</div>
              <div className="flex items-center gap-4">
                <Checkbox checked={playWithoutProblem} onChange={() => setPlayWithoutProblem(true)}>
                  Si
                </Checkbox>

                <Checkbox checked={playWithoutProblem === false} onChange={() => setPlayWithoutProblem(false)}>
                  No
                </Checkbox>
              </div>
            </div>

            <div className="bg-whiteLight p-2 rounded-[4px] flex items-center justify-between my-4">
              <div className="text-grayLight text-[14px] leading-[17px] font-[700]">¿Jugarías de nuevo?</div>
              <div className="flex items-center gap-2">
                <Checkbox checked={playAgain === "yes"} onChange={() => setPlayAgain("yes")}>
                  Si
                </Checkbox>

                <Checkbox checked={playAgain === "maybe"} onChange={() => setPlayAgain("maybe")}>
                  Tal vez
                </Checkbox>

                <Checkbox checked={playAgain === "no"} onChange={() => setPlayAgain("no")}>
                  No
                </Checkbox>
              </div>
            </div>

            <div className="bg-whiteLight p-2 rounded-[4px] my-4">
              <div className="text-grayLight text-[14px] leading-[17px] font-[700] mb-4">¿Tienes algún comentario?</div>
              <TextArea
                rows="5"
                border="none"
                background="#F2F2F2"
                color="#242424"
                name="comment"
                ref={register}
                error={errors.comment}
                placeholder="Escribe aquí"
              />
            </div>

            <ButtonAnt color="success" htmlType="submit" loading={savingFeedback} disabled={savingFeedback}>
              Enviar
            </ButtonAnt>
          </form>
        </div>
      </div>
    </div>
  );
};
