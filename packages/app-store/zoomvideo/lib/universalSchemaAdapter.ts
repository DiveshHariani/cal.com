import type { OAuth2UniversalSchemaWithCalcomBackwardCompatibility } from "_auth/universalSchema";
import type { z } from "zod";

export const adapt = async (
  tokenResponse: z.infer<typeof OAuth2UniversalSchemaWithCalcomBackwardCompatibility>
) => {
  if (tokenResponse.expiry_date === undefined && typeof tokenResponse.expires_in === "number") {
    tokenResponse.expiry_date = Math.round(Date.now() + tokenResponse.expires_in * 1000);
  }
  return {
    ...tokenResponse,
  };
};