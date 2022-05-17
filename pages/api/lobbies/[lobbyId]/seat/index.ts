import Cors from "cors";
import initMiddleware from "../../.././../../lib";
import reserveLobbySeat from "../../../../../src/api/lobbies/_lobbyId/seat/putReserveLobbySeat";
import type { NextApiRequest, NextApiResponse } from "next";

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  })
);

const apiLobbyReserveSeat = async (req: NextApiRequest, res: NextApiResponse) => {
  // Run cors
  await cors(req, res);

  switch (req.method) {
    case "PUT":
      return await reserveLobbySeat(req, res);
    default:
      return res.status(500).send({ error: "Method is not defined" });
  }
};

export default apiLobbyReserveSeat;


