"use client";

export default function MetricsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-xl font-semibold text-cpbh-navy">
        Something went wrong loading this page
      </h2>
      <p className="text-sm text-cpbh-navy/65 mt-2 max-w-md">
        Stop any server on port 3002, then run{" "}
        <code className="font-mono text-xs bg-cpbh-mist px-1 rounded">
          npm run demo
        </code>{" "}
        (or{" "}
        <code className="font-mono text-xs bg-cpbh-mist px-1 rounded">
          npm run dev:clean
        </code>{" "}
        for dev). Hard refresh with Cmd+Shift+R.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-cpbh-navy text-white text-sm font-medium px-4 py-2 hover:bg-cpbh-deep"
      >
        Try again
      </button>
      {error.message ? (
        <p className="mt-4 text-xs text-red-800/80 max-w-lg font-mono break-words">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
