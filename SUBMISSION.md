# Чекліст здачі

## До відправлення

1. Створіть `.env` із `.env.example` і вкажіть доступні `DATABASE_URL` та `JWT_SECRET`.
2. Додайте `ALLOWED_ORIGINS` і Cloudinary credentials до `.env` (див. `.env.example`).
3. Виконайте `npm ci`, `npm run prisma:generate`, `npm run prisma:migrate` і `npm test`. Міграція застосує обидві зміни схеми до PostgreSQL.
3. Завантажте в LMS файл `announcements-api-submission.zip` з кореня проєкту.
4. Додайте посилання на власний GitHub-репозиторій із вмістом цієї папки `hw`.

## Покриття критеріїв

- `prisma/schema.prisma` і `prisma/migrations/` містять три пов'язані моделі, початкову міграцію та `imageUrl` для фото.
- `src/controllers/auth.controller.ts` реалізує bcrypt, JWT, refresh-token rotation та безпечні відповіді.
- `src/middleware/` містить автентифікацію та три Zod middleware валідації.
- `app.ts` містить Helmet, CORS allow-list і pino HTTP-логування; auth router має rate limit 10 запитів за 15 хвилин.
- `src/controllers/announcements.controller.ts` реалізує публічний пошук/пагінацію, CRUD з ownership-перевіркою та безпечне завантаження фото до Cloudinary.
- `src/routes/` реєструє усі API-операції у OpenAPI, включно з multipart-запитами; Swagger доступний за `/api-docs`.
- `tests/auth.test.ts` містить три тести Vitest, що запускаються командою `npm test`.
