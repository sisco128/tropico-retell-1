// server.js
import Fastify from "fastify";
import formBody from "@fastify/formbody";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import { registerOutboundRoutes } from "./outbound-routes.js";

// 1. Load .env variables
dotenv.config();

// 2. Initialize Fastify
const fastify = Fastify({ logger: true });

// 3. Register CORS
fastify.register(fastifyCors, {
  origin: "*", // or specific domains
  methods: ["POST", "GET", "OPTIONS"],
  credentials: true,
});

// 4. Register formbody for parsing form data
fastify.register(formBody);

// 5. Optional: Simple API key auth
fastify.addHook("preHandler", async (request, reply) => {
  // Public routes that don't need auth
  const publicRoutes = ["/test-form"];

  const url = new URL(`http://${request.headers.host}${request.raw.url}`);
  const pathname = url.pathname;
  if (publicRoutes.includes(pathname)) {
    return; // skip auth
  }

  // For everything else, require x-api-key
  const apiKeyHeader = request.headers["x-api-key"];
  if (!apiKeyHeader || apiKeyHeader !== process.env.API_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
});

// 6. Example route to test form data
fastify.post("/test-form", async (request, reply) => {
  return { received: request.body };
});

// 7. Register your custom outbound routes
registerOutboundRoutes(fastify);

// 8. Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
