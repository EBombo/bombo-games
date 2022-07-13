import Cors from "cors";
import initMiddleware from "../../../../lib";
import { getSubscriptionPlan } from "../../../../src/api/companies/[companyId]";

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const apiLobbyReserveSeat = async (req, res) => {
  // Run cors
  await cors(req, res);

  switch (req.method) {
    case "PUT":
      return await getSubscriptionPlan(req, res);
    case "DELETE":
      return res.status(500).send({ error: "Method is not defined" });
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiLobbyReserveSeat;
