// src/app/api/citation/sourcey/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CitationData {
  title: string;
  url: string;
  author?: string;
  date?: string;
  citation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid URL. Must be a valid HTTP/HTTPS URL.' },
        { status: 400 }
      );
    }

    // In production, this would fetch the page and extract metadata
    // For now, simulate with a deterministic fallback
    const simulatedMetadata: CitationData = {
      title: 'Startup Credits & Agent Readiness Documentation',
      url,
      author: 'Auscaster Team',
      date: new Date().toISOString().split('T')[0],
      citation: `Auscaster Team. "${'Startup Credits & Agent Readiness Documentation'}". ${new Date().getFullYear()}. Accessed ${new Date().toLocaleDateString()}. <${url}>.`
    };

    return NextResponse.json(simulatedMetadata, { status: 200 });
  } catch (error) {
    console.error('Citation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate citation' },
      { status: 500 }
    );
  }
}

// src/components/CitationGenerator.tsx
'use client';

import { useState } from 'react';

export default function CitationGenerator() {
  const [url, setUrl] = useState('');
  const [citation, setCitation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCitation(null);

    try {
      const response = await fetch('/api/citation/sourcey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate citation');
      }

      setCitation(data.citation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (citation) {
      navigator.clipboard.writeText(citation);
      alert('Citation copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Generate Sourcey Citation
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Enter a URL that ranks for startup-credits, agent-readiness, or docs-tooling queries to generate a citation.
      </p>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/docs"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Citation'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {citation && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Generated Citation:
          </h3>
          <div className="relative">
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {citation}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}