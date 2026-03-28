"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mb-6">
        C
      </div>
      <h1 className="text-2xl font-bold mb-2">You&apos;re offline</h1>
      <p className="text-muted-foreground max-w-md">
        Craftwell needs an internet connection to load your protocols and data.
        Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
