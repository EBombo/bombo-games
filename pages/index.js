import React from "reactn";
import { SEOMeta } from "../src/components/common/seo";
import Login from "../src/pages/login";
import { WithAuthLobby } from "../src/session/WithAuthLobby";

const Init = (props) => (
  <>
    <SEOMeta {...props} />
    <WithAuthLobby {...props}>
      <Login {...props} />
    </WithAuthLobby>
  </>
);

export default Init;
