import type { NextApiRequest, NextApiResponse } from "next";
import ApiRoute from "../../src/api";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await ApiRoute(req, res);
};
