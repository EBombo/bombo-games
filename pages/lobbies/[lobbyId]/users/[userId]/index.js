import React from "reactn";
import { SEOMeta } from "../../../../../src/components/common/seo";
import { Feedback } from "../../../../../src/pages/lobbies/_lobbyId/users/_userId";

const FeedbacksPage = (props) => (
  <>
    <SEOMeta {...props} />
    <Feedback {...props} />
  </>
);

export default FeedbacksPage;
