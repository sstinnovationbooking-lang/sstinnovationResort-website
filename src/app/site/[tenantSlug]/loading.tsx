export default function TenantLoadingPage() {
  return (
    <main className="shell section page-loading" aria-busy="true" aria-live="polite">
      <div className="loading-block loading-title" />
      <div className="loading-block loading-text" />
      <div className="loading-grid">
        <div className="loading-card" />
        <div className="loading-card" />
        <div className="loading-card" />
      </div>
    </main>
  );
}
