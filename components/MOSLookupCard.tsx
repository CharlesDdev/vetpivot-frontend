import { FormEvent, useEffect, useState } from 'react';
import { searchOnet } from '../services/onetService';

export default function MOSLookupCard() {
  const [keyword, setKeyword] = useState('infantry');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = async (byKeyword?: string) => {
    const target = (byKeyword ?? keyword).trim() || 'infantry';
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchOnet(target);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Failed to load O*NET data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults('infantry');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadResults(keyword);
  };

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-700 p-6 shadow-xl">
      <p className="text-xs uppercase tracking-widest text-gold-300/80 mb-2">Step 1 (Optional): Explore roles & keywords</p>
      <h2 className="text-2xl font-semibold text-white mb-2">Live O*NET Lookup</h2>
      <p className="text-sm text-slate-300 mb-4">
        Enter a MOS keyword to fetch results directly from O*NET Online.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
          placeholder="MOS keyword (e.g., infantry)"
        />
        <button
          type="submit"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-gold-400 disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Fetching...' : 'Search'}
        </button>
      </form>

      <div className="mt-4 min-h-[120px] text-sm text-slate-200">
        {isLoading && <p aria-live="polite">Loading latest O*NET results...</p>}
        {error && (
          <div className="rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100" role="alert">
            {error}
          </div>
        )}
        {!isLoading && !error && result && (
          <pre className="max-h-72 overflow-auto rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-xs leading-snug text-slate-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Data provided by{' '}
        <a
          href="https://www.onetonline.org/"
          target="_blank"
          rel="noreferrer"
          className="text-gold-300 hover:text-gold-200 underline"
        >
          O*NET Online
        </a>
        .
      </p>
    </div>
  );
}
