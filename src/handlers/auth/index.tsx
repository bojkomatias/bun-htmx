import { randomBytes } from "crypto";
import { user } from "@/db/schema/user";
import { and, eq } from "drizzle-orm";
import { Setup } from "../setup";
import { SignInForm } from "./components/form";

const hasher = new Bun.CryptoHasher("sha256");

const auth = (app: Setup) =>
  app.group("/auth", (app) =>
    app
      /** Get auth form */
      .get("/form", async ({ setCookie }) => {
        /** Implements double submit cookies method for protection against CSRF */
        hasher.update(randomBytes(100));
        const csrfToken = hasher.digest("base64");
        setCookie("csrfToken", csrfToken, {
          secure: true,
          sameSite: true,
        });

        return <SignInForm csrfToken={csrfToken} />;
      })
      .post(
        "/login",
        async ({ jwt, cookie, setCookie, body, set, store: { db } }) => {
          // Catch CSRF attack
          if (cookie.csrfToken !== body.csrfToken) return (set.status = 403);

          // Check if credentials match
          const [result] = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            })
            .from(user)
            .where(
              and(eq(user.email, body.email), eq(user.password, body.password)),
            )
            .limit(1);

          // Handle incorrect username or password
          if (!result) {
            set.status = 404;
            return (
              <div class="text-sm text-red-600">
                * Incorrect email or password
              </div>
            );
          }

          setCookie(
            "auth",
            await jwt.sign({
              id: String(result.id),
              name: result.name,
              email: result.email,
              role: result.role,
            }),
            {
              httpOnly: true,
              maxAge: 7 * 86400,
            },
          );

          return (set.redirect = "/dashboard");
        },
        { body: "auth" },
      )

      .post("/logout", ({ setCookie, set }) => {
        // Remove cookie not working
        setCookie("auth", "");
        return (set.redirect = "/");
      }),
  );

export default auth;