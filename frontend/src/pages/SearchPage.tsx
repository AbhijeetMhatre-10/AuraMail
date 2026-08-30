import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/api/search.api';
import { SmartSearchPanel } from '../components/search/SmartSearchPanel';
import { EmailListItem } from '../components/email/EmailListItem';
import { EmailListSkeleton } from '../components/common/LoadingSkeletons';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlQuery = searchParams.get('q') || '';
  const isSmartMode = searchParams.get('smart') === 'true';

  const [activeQuery, setActiveQuery] = useState(urlQuery);
  const [smartResultData, setSmartResultData] = useState<any>(null);

  const {
    data: normalSearchData,
    isLoading: isNormalLoading,
    isError: isNormalError,
    error: normalError,
    refetch: refetchNormal,
  } = useQuery({
    queryKey: ['search', 'normal', activeQuery],
    queryFn: () => searchApi.search(activeQuery),
    enabled: Boolean(activeQuery && !isSmartMode),
  });

  const {
    data: smartSearchData,
    isLoading: isSmartLoading,
    isError: isSmartError,
    error: smartError,
    refetch: refetchSmart,
  } = useQuery({
    queryKey: ['search', 'smart', activeQuery],
    queryFn: () => searchApi.smartSearch(activeQuery),
    enabled: Boolean(activeQuery && isSmartMode),
  });

  useEffect(() => {
    if (urlQuery) {
      setActiveQuery(urlQuery);
    }
  }, [urlQuery]);

  const handleExecuteSearch = (newQuery: string) => {
    setActiveQuery(newQuery);
    setSearchParams({ q: newQuery, smart: 'true' });
  };

  const results = isSmartMode
    ? smartSearchData?.results || []
    : normalSearchData?.results || [];

  const isLoading = isSmartMode ? isSmartLoading : isNormalLoading;
  const isError = isSmartMode ? isSmartError : isNormalError;
  const errorMessage = ((isSmartMode ? smartError : normalError) as any)?.message;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Smart Search
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search with keywords or describe what you are looking for in natural language.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isSmartMode ? 'ai' : 'secondary'}
            size="sm"
            onClick={() => setSearchParams({ q: activeQuery, smart: 'true' })}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Smart AI Search
          </Button>

          <Button
            variant={!isSmartMode ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSearchParams({ q: activeQuery, smart: 'false' })}
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            Standard Search
          </Button>
        </div>
      </div>

      {/* Smart Search Prompt Box */}
      <SmartSearchPanel
        onExecuteSmartSearch={handleExecuteSearch}
        isLoading={isLoading}
        searchResult={isSmartMode ? smartSearchData : null}
      />

      {/* Results Container */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Search Results {results.length > 0 ? `(${results.length})` : ''}
          </h3>
          {activeQuery && (
            <span className="text-xs text-slate-500">
              Query: &ldquo;<span className="text-slate-300">{activeQuery}</span>&rdquo;
            </span>
          )}
        </div>

        {isLoading ? (
          <EmailListSkeleton count={6} />
        ) : isError ? (
          <ErrorState
            title="Search query failed"
            message={errorMessage || 'Could not complete search.'}
            onRetry={isSmartMode ? refetchSmart : refetchNormal}
          />
        ) : !activeQuery ? (
          <EmptyState
            icon={Search}
            title="Start Searching"
            description="Type a question or query above to search your inbox with Gemini AI intelligence."
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching emails found"
            description="Try rephrasing your search terms or asking Gemini with different keywords."
          />
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-850 shadow-xl">
            {results.map((email) => (
              <EmailListItem
                key={email.id || email._id}
                email={email}
                onSelect={() => navigate(`/email/${email.id || email._id || email.threadId}`)}
                onStarToggle={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
                onReadToggle={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
