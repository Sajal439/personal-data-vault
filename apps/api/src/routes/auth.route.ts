import { FastifyInstance } from "fastify";
import { login, signup } from "../services/auth.service";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", async (req: any) => {
    const { email, password } = req.body;
    return signup(email, password);
  });

  app.post("/login", async (req: any) => {
    const { email, password } = req.body;
    return login(email, password);
  });
}
