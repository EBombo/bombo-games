import React from "reactn";
import {SEOMeta} from "../../../src/components/common/seo";
import {Game} from "../../../src/pages/games/_gameId";

const LobbyPage = (props) => (
  <>
    <SEOMeta {...props} />
    <Game {...props} />
  </>
);

export default LobbyPage;
