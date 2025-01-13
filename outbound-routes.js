// outbound-routes.js
import { retellClient } from "./retellClient.js";

export function registerOutboundRoutes(fastify) {
  // Validate required env vars
  if (!process.env.RETELL_API_KEY || !process.env.RETELL_PHONE_NUMBER) {
    console.error("Missing RETELL_API_KEY or RETELL_PHONE_NUMBER in env");
    throw new Error("Please set them in your .env file");
  }

  /**
   * POST /outbound-call
   * Creates a new outbound call via Retell
   */
  fastify.post("/outbound-call", async (request, reply) => {
    try {
      const { to_number, metadata, override_agent_id, retell_llm_dynamic_variables } =
        request.body || {};

      if (!to_number) {
        return reply.code(400).send({ error: "Missing 'to_number' in request body" });
      }

      // Make the Retell call
      const retellResponse = await retellClient.post("/v2/create-phone-call", {
        body: {
          from_number: process.env.RETELL_PHONE_NUMBER, // Must be a Retell-managed number
          to_number,
          metadata: metadata || {},
          override_agent_id,
          retell_llm_dynamic_variables,
        },
      });

      console.log("retellResponse =>", retellResponse);

      // Send back the Retell response
      reply.send({
        success: true,
        message: "Retell call initiated successfully",
        callDetails: retellResponse,
      });
    } catch (error) {
      console.error("Error creating Retell call:", error);
      reply.code(500).send({
        success: false,
        error: error.message || "Unknown Retell call creation error",
      });
    }
  });

  /**
   * GET /call-status/:callId
   * Fetches the call info from Retell by calling GET /v2/get-call/:callId
   */
  fastify.get("/call-status/:callId", async (request, reply) => {
    try {
      const { callId } = request.params;

      if (!callId) {
        return reply.code(400).send({ error: "Missing 'callId' in URL" });
      }

      // GET call info from Retell using the correct endpoint:
      const retellResponse = await retellClient.get(`/v2/get-call/${callId}`);

      // Return the JSON (call_status, transcript, etc.)
      reply.send({
        success: true,
        callInfo: retellResponse,
      });
    } catch (error) {
      console.error("Error fetching call info:", error);
      reply.code(500).send({
        success: false,
        error: error.message || "Unknown error fetching call data",
      });
    }
  });
}
