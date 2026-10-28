import { Router } from "express";
import { registry } from "../openapi.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { validateBody } from "../middleware/validate.ts";
import { login, logout, me, refresh, register } from "../controllers/auth.controller.ts";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../validators/auth.validator.ts";
import { authRateLimiter } from "../middleware/rate-limit.ts";

const router = Router();

router.use(authRateLimiter);

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", authenticate, validateBody(logoutSchema), logout);
router.get("/me", authenticate, me);

registry.registerPath({ method: "post", path: "/auth/register", summary: "Register a user", request: { body: { content: { "application/json": { schema: registerSchema } } } }, responses: { 201: { description: "Registered" }, 409: { description: "Username or email already taken" } } });
registry.registerPath({ method: "post", path: "/auth/login", summary: "Log in", request: { body: { content: { "application/json": { schema: loginSchema } } } }, responses: { 200: { description: "Authenticated" }, 401: { description: "Invalid credentials" } } });
registry.registerPath({ method: "post", path: "/auth/refresh", summary: "Rotate tokens", request: { body: { content: { "application/json": { schema: refreshSchema } } } }, responses: { 200: { description: "Tokens refreshed" }, 401: { description: "Invalid refresh token" } } });
registry.registerPath({ method: "post", path: "/auth/logout", summary: "Log out", security: [{ bearerAuth: [] }], request: { body: { content: { "application/json": { schema: logoutSchema } } } }, responses: { 204: { description: "Logged out" } } });
registry.registerPath({ method: "get", path: "/auth/me", summary: "Get current user", security: [{ bearerAuth: [] }], responses: { 200: { description: "Current user" } } });

export default router;
