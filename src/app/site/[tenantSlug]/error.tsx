"use client";

interface TenantErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function TenantErrorPage({ error, reset }: TenantErrorPageProps) {
  return (
    <main className="shell section page-error" role="alert">
      <h1>We could not load this resort page.</h1>
      <p>{error.message || "Please try again in a moment."}</p>
      <button className="btn btn-primary" onClick={reset} type="button">
        Retry
      </button>
    </main>
  );
}
