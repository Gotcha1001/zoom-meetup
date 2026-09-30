import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);

    switch (evt.type) {
      case "user.created": {
        const data = evt.data;
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name}`;
        const image = data.image_url || "";
        const plan = "free";

        await sql`
        INSERT INTO users (id, name, email, image, plan)
        VALUES (${userId}, ${name}, ${primaryEmail}, ${image}, ${plan})
        ON CONFLICT (id) DO UPDATE SET
        id = EXCLUDED.id,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        plan = EXCLUDED.plan,
        updated_at = NOW()`;
        break;
      }

      case "user.updated": {
        const data = evt.data;
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name}`;
        const image = data.image_url || "";

        await sql`
        INSERT INTO users (id, name, email, image)
        VALUES (${userId}, ${name}, ${primaryEmail}, ${image})
        ON CONFLICT (id) DO UPDATE SET
        id = EXCLUDED.id,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        updated_at = NOW()`;
        break;
      }

      case "user.deleted": {
        const data = evt.data;
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }

      default:
        console.log(`Unhandled Clerk webhook event type: ${evt.type}`);
    }

    return res.status(200).json({ success: true, eventType: evt.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error verifying Clerk webhook:", message);
    return res
      .status(400)
      .json({ error: "Webhook verification failed: " + message });
  }
};
