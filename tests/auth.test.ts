import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../src/validators/auth.validator.ts";
import { createAnnouncementSchema } from "../src/validators/announcements.validator.ts";

describe("API input validation", () => {
  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse({ username: "ivan", email: "ivan@example.com", password: "secret1", name: "Іван" }).success).toBe(true);
  });

  it("rejects a login request without a password", () => {
    expect(loginSchema.safeParse({ username: "ivan" }).success).toBe(false);
  });

  it("coerces multipart announcement price and validates category", () => {
    const result = createAnnouncementSchema.safeParse({ title: "Продам велосипед", description: "Гірський велосипед у чудовому стані", price: "8500", category: "sale" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(8500);
  });
});
