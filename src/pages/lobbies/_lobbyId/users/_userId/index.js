import { useRouter } from "next/router";
import React, { useState, useEffect } from "reactn";
import { useForm } from "react-hook-form";
import { object, string, boolean } from "yup";

export const Feedback = (props) => {
  const router = useRouter();

  const { lobbyId, userId } = router.query;

  const [lobby, setLobby] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchLobby();
    };

    initialize();
  }, [lobbyId, userId]);

  const validationSchema = object().shape({
    name: string().required(),
    email: string().required().email(),
    attendance: boolean().required(),
  });

  const { register, errors, handleSubmit } = useForm({
    validationSchema,
    reValidateMode: "onSubmit",
  });

  const fetchUser = async () => {};

  const fetchLobby = async () => {};

  const saveFeedback = async (data) => {
    console.log(data);
  };

  if (loading) return <div>Espere</div>;

  return (
    <div className="bg-secondary w-full h-screen bg-center bg-contain bg-pattern">
      <div className="max-w-[550px] flex flex-col gap-4 mx-auto">
        <div className="text-whiteDark font-[700] text-[30px] leading-[36px] text-center">Feedback</div>
        <div className="text-whiteDark font-[400] text-[20px] leading-[24px] text-center">
          ¡Esperamos que la hayas pasado genial! ¡Déjanos tu opinión!
        </div>

        <form onSubmit={handleSubmit(saveFeedback)} className="w-full bg-whiteDark p-4 rounded-[4px]">
          <div className="bg-whiteLight p-2 rounded-[4px]">
            <div className="text-grayLight text-[14px] leading-[17px] mb-4 font-[700]">¿Te divertiste?</div>
            <div className="text-grayLight text-[14px] leading-[17px] mb-4 font-[400]">
              Elige la emoción que más te identifique
            </div>
            <div>
                
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
