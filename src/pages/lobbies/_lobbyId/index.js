import React, { useEffect } from "reactn";
import styled from "styled-components";
import { SpinLoaderMin } from "../../../components/common/loader";
import { useRouter } from "next/router";
import { firestore } from "../../../firebase";

export const Lobby = () => {
  const router = useRouter();
  const { gameId, userId } = router.query;

  useEffect(() => {
    if (!gameId) return router.push("/");

    const fetchGame = async () => {
      // TODO: All games created on BIngo or Hanged should be clone to bombo-games
      const gameQuery = await firestore.doc(`games/${gameId}`).get();

      if (gameQuery.exists) return router.push("/");

      const currentGame = gameQuery.data();

      await router.push(`/${currentGame?.name?.toUpperCase()}/lobby/new?gameId=${gameId}&userId=${userId}`);
    };

    fetchGame();
  }, [gameId]);

  return <SpinLoaderMin />;
};

const ContainerCss = styled.div``;
