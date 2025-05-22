
export function VerificationUserTemplate(code: string): string {
  return `
    <div>
      <p>Код подтверждения: <strong>${code}</strong></p>
      <p>
        <a href="http://localhost:3000/api/auth/verify?code=${code}">
          Подтвердите регистрацию
        </a>
      </p>
    </div>
  `;
}
