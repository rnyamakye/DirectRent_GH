// Layout for all /auth/* pages.
// Intentionally omits <Footer> — auth pages (login, register,
// forgot-password, reset-password) shouldn't have site chrome in the way.
// The root layout's <Header> is still inherited via the body wrapper,
// so the header remains visible on all auth pages.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
