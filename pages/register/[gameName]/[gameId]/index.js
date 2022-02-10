import React from "reactn";
import { SEOMeta } from "../../../../src/components/common/seo";
import { Register } from "../../../../src/pages/register/_gameName/_gameId";

const RegisterPage = (props) => (
  <>
    <SEOMeta {...props} />
    <Register {...props} />
  </>
);

export default RegisterPage;
