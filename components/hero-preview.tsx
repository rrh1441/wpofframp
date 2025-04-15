// components/hero-preview.tsx (Skeleton as default placeholder)
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image"; // Keep Image import for potential use elsewhere if needed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMES, ThemeKey } from "@/lib/constants";
import type { PreviewResult } from "@/app/api/preview/route";
import { cn } from "@/lib/utils";

// Import the theme layout components
import { ModernLayout } from './themes/ModernLayout';
import { MatrixLayout } from './themes/MatrixLayout';
import { GhibliLayout } from './themes/GhibliLayout';

const themeKeys = ['modern', 'matrix', 'ghibli'] as ThemeKey[];

const themeLayoutMap: Record<ThemeKey, React.FC<{ mdxContent: string }>> = {
    modern: ModernLayout,
    matrix: MatrixLayout,
    ghibli: GhibliLayout,
};

// Define Example Sites
const exampleSites = [
  { name: "Harvard Gazette", url: "https://news.harvard.edu/gazette/" },
  { name: "Minimalist Baker", url: "https://minimalistbaker.com/" },
];

const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized) return "";
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }
    try {
        const urlObj = new URL(normalized);
        normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, "") + urlObj.search + urlObj.hash;
        return normalized;
    } catch (e) {
        console.warn("Could not normalize URL, returning as is:", inputUrl);
        return inputUrl;
    }
};

const themeButtonStyles: Record<ThemeKey, string> = {
    modern: "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 font-sans",
    matrix: "bg-black hover:bg-gray-900 text-green-400 border-green-700 font-mono",
    ghibli: "bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300 font-serif",
};


export default function HeroPreview() {
  const [url, setUrl] = useState("");
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("modern");
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<{ [key in ThemeKey]?: PreviewResult }>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("migrated");
  const [resultsUrl, setResultsUrl] = useState<string | null>(null);
  const [failedThemes, setFailedThemes] = useState<Set<ThemeKey>>(new Set());


  useEffect(() => {
    const handler = setTimeout(() => {
        const normalizedInputUrl = url ? normalizeUrl(url) : "";
        if ((normalizedInputUrl && resultsUrl && normalizedInputUrl !== resultsUrl) || (url === "" && resultsUrl !== null)) {
            setPreviewResults({});
            setFetchError(null);
            setMigrationError(null);
            setResultsUrl(null);
            setFailedThemes(new Set());
        }
    }, 300);
    return () => clearTimeout(handler);
  }, [url, resultsUrl]);

  const fetchSingleThemePreview = async (targetUrl: string, themeKey: ThemeKey): Promise<PreviewResult> => {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: themeKey }),
      });
      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || `HTTP error fetching ${themeKey}! Status: ${response.status}`);
      }
      return responseBody as PreviewResult;
  }

  const fetchAllThemePreviews = useCallback(async (targetUrl: string) => {
    const normalizedTargetUrl = normalizeUrl(targetUrl);
    console.log(`[API Batch] Fetching previews for URL: ${normalizedTargetUrl}`);

    setIsLoading(true);
    setFetchError(null);
    setMigrationError(null);
    setFailedThemes(new Set());

    if (resultsUrl !== normalizedTargetUrl) {
        console.log(`[Cache] Clearing results for new URL ('${normalizedTargetUrl}' != '${resultsUrl}')`);
        setPreviewResults({});
    }
    setResultsUrl(normalizedTargetUrl);

    const promises = themeKeys.map(themeKey =>
      fetchSingleThemePreview(normalizedTargetUrl, themeKey)
        .then(data => ({ theme: themeKey, status: 'fulfilled', value: data }))
        .catch(error => ({ theme: themeKey, status: 'rejected', reason: error }))
    );

    const results = await Promise.all(promises);

    const newResults: { [key in ThemeKey]?: PreviewResult } = {};
    const currentFailedThemes = new Set<ThemeKey>();
    let firstError: string | null = null;
    let firstSuccessfulTheme: ThemeKey | null = null;

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        newResults[result.theme] = result.value;
        if (!firstSuccessfulTheme) firstSuccessfulTheme = result.theme;
      } else {
        console.error(`[API Batch] Fetch failed for theme ${result.theme}:`, result.reason);
        currentFailedThemes.add(result.theme);
        if (!firstError) firstError = result.reason instanceof Error ? result.reason.message : String(result.reason);
      }
    });

    setPreviewResults(newResults);
    setFailedThemes(currentFailedThemes);
    setFetchError(firstError);
    setActiveTheme(newResults.modern ? 'modern' : firstSuccessfulTheme || 'modern');
    setCurrentTab('migrated');
    setIsLoading(false);

    console.log(`[API Batch] Finished. Loaded: ${Object.keys(newResults).length}, Failed: ${currentFailedThemes.size}`);

  }, [resultsUrl]);


  const handleInitialPreview = () => {
     if (!url) { setFetchError("Please enter a WordPress URL."); return; }
     const targetUrl = normalizeUrl(url);
     console.log(`[UI Action] Generate Previews clicked for input URL: ${url} (Target: ${targetUrl})`);
     fetchAllThemePreviews(targetUrl);
   };

   const handleExampleClick = useCallback((exampleUrl: string) => {
     if (isLoading || isMigrating) return;
     const normalizedExampleUrl = normalizeUrl(exampleUrl);
     console.log(`[UI Action] Example button clicked: ${normalizedExampleUrl}`);
     setUrl(normalizedExampleUrl);
     fetchAllThemePreviews(normalizedExampleUrl);
   }, [isLoading, isMigrating, fetchAllThemePreviews]);


  const handleThemeSelectionChange = useCallback(async (newTheme: ThemeKey) => {
    if (isLoading || isMigrating || newTheme === activeTheme) return;

    if (previewResults[newTheme]) {
      console.log(`[UI Action] Switching to pre-loaded theme: ${newTheme}`);
      setActiveTheme(newTheme);
      return;
    }

    if (resultsUrl && failedThemes.has(newTheme)) {
        console.log(`[UI Action] Data for theme ${newTheme} missing. Attempting fallback fetch for URL: ${resultsUrl}`);
        setIsLoading(true);
        setFetchError(null);

        try {
            const resultData = await fetchSingleThemePreview(resultsUrl, newTheme);
            console.log(`[API Fallback] Success for theme: ${newTheme}.`);
            setPreviewResults(prev => ({ ...prev, [newTheme]: resultData }));
            setFailedThemes(prev => {
                const updated = new Set(prev);
                updated.delete(newTheme);
                return updated;
            });
            setActiveTheme(newTheme);
            setFetchError(null);
        } catch (error: any) {
            console.error(`[API Fallback] Fetch failed for theme ${newTheme}:`, error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            setFetchError(`Failed to load theme '${THEMES[newTheme]?.name || newTheme}': ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    } else if (resultsUrl) {
         console.warn(`Theme data for ${newTheme} not found, and it wasn't marked as failed. Cannot fetch.`);
         setFetchError(`Preview data for theme '${THEMES[newTheme]?.name || newTheme}' is unavailable.`);
    } else {
         console.warn(`Cannot fetch fallback for ${newTheme} as no resultsUrl is set.`);
    }
  }, [isLoading, isMigrating, activeTheme, previewResults, resultsUrl, failedThemes]);


  const handleMigrate = async () => {
      if (!resultsUrl || !activeTheme || !previewResults[activeTheme]) {
        setMigrationError("Cannot migrate. Please ensure the preview for the active theme has loaded successfully."); return;
      }
      console.log(`[Migrate] Starting migration for ${resultsUrl} with theme ${activeTheme}`);
      setIsMigrating(true); setMigrationError(null); setFetchError(null);

      try {
        // ... (migration fetch logic remains the same) ...
         const response = await fetch("/api/migrate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wpUrl: resultsUrl, theme: activeTheme }),
        });

        if (!response.ok) {
          let errorMsg = `Migration failed! Status: ${response.status}`;
          try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) { /* ignore parsing error */ }
          if (response.status === 429) { errorMsg = "Migration limit reached for this session (1 per hour). Please try again later."; }
          throw new Error(errorMsg);
        }
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/zip')) { throw new Error('Migration error: Server did not return a valid ZIP file.'); }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        const disposition = response.headers.get('Content-Disposition');
        let filename = `${activeTheme}_site.zip`;
        if (disposition && disposition.includes('filename=')) {
            const filenameRegex = /filename\*?=['"]?([^'";]+)['"]?(?:;|$)/;
            const matches = filenameRegex.exec(disposition);
            if (matches?.[1]) { filename = decodeURIComponent(matches[1].replace(/['"]/g, '')); }
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

      } catch (error: any) { console.error("[Migrate] Migration/Download failed:", error); setMigrationError(`${error.message || "Unknown migration error"}`);
      } finally { setIsMigrating(false); }
  };

  // --- Rendering Logic ---

  // Skeleton component remains the same
  const renderSkeleton = () => (
    <div className="p-6 space-y-4 animate-pulse">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-1/2" /> {/* Author/Date */}
        <Skeleton className="h-40 w-full" /> {/* Featured Image Placeholder? Or Text */}
        <Skeleton className="h-4 w-full mt-4" /> {/* Text */}
        <Skeleton className="h-4 w-full" /> {/* Text */}
        <Skeleton className="h-4 w-5/6" /> {/* Text */}
    </div>
   );

  // *** Updated renderPreviewArea Function ***
  const renderPreviewArea = () => {
    const hasAnyPreviewData = resultsUrl && Object.keys(previewResults).length > 0;
    const activePreviewData = previewResults[activeTheme];
    const firstLoadedResult = hasAnyPreviewData ? Object.values(previewResults).find(r => r !== undefined) : undefined;
    const ActiveLayout = themeLayoutMap[activeTheme];

    // --- Determine Placeholder / Loading / Error States ---

    // State 1: Error occurred during the *very first* fetch attempt (before resultsUrl was set)
    if (fetchError && !isLoading && !resultsUrl) {
         return (<div className="p-4 md:p-6"><Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /> <AlertTitle>Preview Error</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert></div>);
    }

    // State 2: Show Skeleton if EITHER
    //          a) No results URL has been established yet (initial state, before first fetch)
    //          b) We ARE currently loading data (either initial batch or fallback)
    if (!resultsUrl || isLoading) {
        return renderSkeleton();
    }

    // State 3: resultsUrl is set, loading is finished, BUT the batch fetch failed for ALL themes
    if(!isLoading && !hasAnyPreviewData && resultsUrl){
         return (<div className="p-4 md:p-6"><Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /> <AlertTitle>Loading Failed</AlertTitle><AlertDescription>{fetchError || "Could not load preview data for any theme."}</AlertDescription></Alert></div>);
    }

    // --- Render Tabs (We have resultsUrl, loading is finished, at least one theme loaded) ---
    return (
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between min-h-[50px]">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                {/* Disable tabs if no data for the specific tab */}
                <TabsTrigger value="original" disabled={!firstLoadedResult}>Original HTML</TabsTrigger>
                <TabsTrigger value="migrated" disabled={!activePreviewData}>Preview Theme</TabsTrigger>
            </TabsList>
             {/* Display specific error related to theme loading if applicable and not loading */}
            {fetchError && !isLoading && (<div className="w-full sm:w-auto text-xs text-red-600 flex items-center gap-1 pt-1 sm:pt-0"><AlertTriangle className="h-3 w-3" /> {fetchError}</div>)}
        </div>

        {/* Original HTML Tab */}
        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
           {!firstLoadedResult ? <div className="text-muted-foreground p-4">Original content could not be loaded.</div> : (
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{firstLoadedResult.title || 'Original Content'}</h2>
                 {firstLoadedResult.author && firstLoadedResult.date && (<div className="text-xs text-muted-foreground mb-4">By {firstLoadedResult.author} on {new Date(firstLoadedResult.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>)}
                 <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: firstLoadedResult.originalHtml || "<p>Original content not available.</p>" }}/>
              </>
          )}
        </TabsContent>

        {/* Migrated MDX Tab (Preview) */}
        <TabsContent value="migrated" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="min-h-[300px] relative">
               {!activePreviewData ? (
                  <div className="text-center py-10 text-muted-foreground">
                      {failedThemes.has(activeTheme)
                          ? `Preview for '${THEMES[activeTheme]?.name || activeTheme}' failed to load. Click its button to retry.`
                          : `Preview data for '${THEMES[activeTheme]?.name || activeTheme}' is unavailable. Select another theme.`
                      }
                 </div>
                ) : (
                 <ActiveLayout mdxContent={activePreviewData.mdx || ""} />
               )
              }
            </div>
        </TabsContent>
      </Tabs>
    );
  };

  // --- Main Component Return ---
  return (
    <div className="flex flex-col w-full space-y-6">

      {/* Top Section - Input & Initial Theme Selection */}
      <div className="w-full">
         {/* ... (Input Card structure remains the same) ... */}
         <Card id="input-section" className="border rounded-lg shadow-sm">
          <CardHeader className="pb-4 pt-5 px-5">
             <h3 className="text-lg font-medium">Enter URL or Try an Example</h3>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {/* URL Input */}
            <div>
                <Input
                    id="wordpress-url"
                    type="url"
                    placeholder="Enter Your URL Here (WordPress sites only)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 text-base sm:text-sm"
                    aria-label="WordPress Site URL"
                    disabled={isLoading || isMigrating}
                />
            </div>

             {/* Example Site Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {exampleSites.map((site) => (
                  <Button
                    key={site.name}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExampleClick(site.url)}
                    disabled={isLoading || isMigrating}
                    className="font-normal justify-center text-center h-9"
                  >
                     {isLoading && resultsUrl === normalizeUrl(site.url) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     {site.name}
                  </Button>
                ))}
              </div>

            {/* Initial Theme Selection Buttons */}
            <div>
                <Label className="pb-2 block text-sm font-medium">Select Preview Theme</Label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2"> {/* Now 3 columns */}
                    {themeKeys.map((themeId) => {
                         const hasFailed = resultsUrl && failedThemes.has(themeId);
                         const isLoaded = resultsUrl && !!previewResults[themeId];
                         const isDisabled = isLoading || isMigrating || (hasFailed && !isLoaded);

                         return (
                             <Button
                                key={`select-${themeId}`}
                                variant={'outline'}
                                size="default"
                                onClick={() => handleThemeSelectionChange(themeId)}
                                disabled={isDisabled}
                                className={cn(
                                    "h-10 px-3 justify-center border transition-all duration-150 ease-in-out relative",
                                    themeButtonStyles[themeId],
                                    activeTheme === themeId ? 'ring-2 ring-offset-2 ring-blue-600 shadow-md scale-105 font-semibold' : 'font-normal opacity-90 hover:opacity-100',
                                    hasFailed ? 'border-red-500 text-red-600 opacity-70 hover:opacity-80' : '',
                                    // Don't grey out based on !resultsUrl, rely on isLoading or failed status
                                    isDisabled && !isLoading ? 'cursor-not-allowed opacity-70' : '' // General disabled appearance if not loading
                                )}
                                title={hasFailed ? `Loading failed for ${THEMES[themeId]?.name || themeId}. Click to retry.` : `Select ${THEMES[themeId]?.name || themeId} Theme`}
                             >
                                 {THEMES[themeId]?.name || themeId}
                             </Button>
                         );
                    })}
                  </div>
            </div>

            {/* Generate Button */}
            <Button onClick={handleInitialPreview} disabled={!url || isLoading || isMigrating} className="w-full px-6" size="lg">
                 {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading All Previews...</> ) : ( resultsUrl && resultsUrl === normalizeUrl(url) ? "Regenerate All Previews" : "Generate All Previews" )}
            </Button>
             {fetchError && !isLoading && !resultsUrl && (<p className="text-sm text-red-600 pt-1 text-center">{fetchError}</p>)}

          </CardContent>
        </Card>
      </div>

       {/* Preview Window Section */}
        <div className="w-full">
            <div className="border rounded-lg overflow-hidden shadow-lg bg-background w-full">
                <div className="bg-muted border-b px-4 py-2 flex items-center text-xs">
                    <div className="flex space-x-1.5"> <div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div> <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div> <div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div> </div>
                    <div className="flex-1 text-center font-medium text-muted-foreground truncate px-4">{previewResults[activeTheme]?.title || "WP Offramp Preview"}</div>
                    <div className="w-10"></div>
                </div>
                <div className="min-h-[500px] overflow-hidden relative w-full">
                    {renderPreviewArea()} {/* Render logic updated inside */}
                </div>
            </div>
        </div>

      {/* Migration Card Section */}
      {resultsUrl && previewResults[activeTheme] && (
         // ... (Migration card structure remains the same) ...
        <div className="w-full">
           <Card>
               <CardHeader className="pb-2">
                   <h3 className="text-lg font-medium">Migrate & Download</h3>
                   <p className="text-sm text-muted-foreground"> Generates a complete Next.js project for the <span className="font-medium">{THEMES[activeTheme]?.name || activeTheme}</span> theme. </p>
               </CardHeader>
               <CardContent>
               {migrationError && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Migration Error</AlertTitle> <AlertDescription>{migrationError}</AlertDescription> </Alert> )}
               <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoading || !previewResults[activeTheme]} className="w-full">
                   {isMigrating ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Migrating & Zipping...</> ) : ( <><Download className="mr-2 h-4 w-4" />Migrate & Download ZIP ({THEMES[activeTheme]?.name || activeTheme} Theme)</> )}
               </Button>
               <p className="text-xs text-muted-foreground mt-2 text-center"> Free migration limited to one page per session (per browser, resets hourly). </p>
               </CardContent>
           </Card>
        </div>
      )}
      {resultsUrl && !previewResults[activeTheme] && !isLoading &&(
          <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted">
              {failedThemes.has(activeTheme)
                  ? `Preview for '${THEMES[activeTheme]?.name || activeTheme}' failed to load initially. Click its button above to retry.`
                  : `Preview data for '${THEMES[activeTheme]?.name || activeTheme}' is unavailable. Select another theme.`
              }
          </div>
      )}

    </div>
  );
}