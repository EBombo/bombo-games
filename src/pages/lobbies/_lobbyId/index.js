import React, { useEffect } from "reactn";
import { SpinLoaderMin } from "../../../components/common/loader";
import { useRouter } from "next/router";
import { firestore } from "../../../firebase";

export const Lobby = (props) => {
  const router = useRouter();
  const { gameId, userId, lobbyId } = router.query;

  useEffect(() => {
    if (!gameId) return router.push("/");

    const fetchGame = async () => {
      // TODO: All games created on BIngo or Hanged should be clone to bombo-games
      const gameQuery = await firestore.doc(`games/${gameId}`).get();

      if (!gameQuery.exists) {
        props.showNotification("ERROR", "Juego no encontrado!");
        return router.push("/");
      }

      const currentGame = gameQuery.data();

      await router.push(`/${currentGame?.name?.toUpperCase()}/lobbies/${lobbyId}?gameId=${gameId}&userId=${userId}`);
    };

    fetchGame();
  }, [gameId]);

  return <SpinLoaderMin />;
};
