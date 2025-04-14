// components/hero-preview.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown"; // Ensure this is installed
import remarkGfm from "remark-gfm"; // Ensure this is installed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMES, ThemeKey } from "@/lib/constants";
import type { PreviewResult } from "@/app/api/preview/route"; // Adjust path if needed
import { cn } from "@/lib/utils";

// Import the theme layout components
import { ModernLayout } from './themes/ModernLayout';
import { DrudgeLayout } from './themes/DrudgeLayout';
import { MatrixLayout } from './themes/MatrixLayout';
import { GhibliLayout } from './themes/GhibliLayout'; // Ensure this exists

// Define the theme keys we are using
const themeKeys = ['modern', 'drudge', 'matrix', 'ghibli'] as ThemeKey[];

// Mapping themes to their layout components
const themeLayoutMap: Record<ThemeKey, React.FC<{ mdxContent: string }>> = {
    modern: ModernLayout,
    drudge: DrudgeLayout,
    matrix: MatrixLayout,
    ghibli: GhibliLayout, // Make sure this component is created
};

// Helper to normalize URL
const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized) return "";
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }
    try {
        const urlObj = new URL(normalized);
        normalized = urlObj.origin + urlObj.pathname + urlObj.search + urlObj.hash;
        if(normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        // Keep www if present, don't force remove/add it
        return normalized;
    } catch (e) {
        console.warn("Could not normalize URL, returning as is:", inputUrl);
        return inputUrl;
    }
};


// --- Style mapping for theme buttons ---
const themeButtonStyles: Record<ThemeKey, string> = {
    modern: "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 font-sans",
    drudge: "bg-white hover:bg-gray-100 text-black border-gray-400 font-serif uppercase tracking-wide",
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

  // Effect to clear results when URL input changes
  useEffect(() => {
    const handler = setTimeout(() => {
        const normalizedInputUrl = url ? normalizeUrl(url) : "";
        if ((normalizedInputUrl && normalizedInputUrl !== resultsUrl) || (url === "" && resultsUrl !== null)) {
            setPreviewResults({}); setFetchError(null); setMigrationError(null); setResultsUrl(null);
        }
    }, 300);
    return () => clearTimeout(handler);
  }, [url]); // Removed resultsUrl from dependency array to avoid loop

   // Effect to ensure resultsUrl is cleared if results become empty
   useEffect(() => {
      if (Object.keys(previewResults).length === 0 && resultsUrl !== null) {
          setResultsUrl(null);
      }
  }, [previewResults]); // Only depends on previewResults


  // Fetches preview data ONLY if not already cached for the target URL and theme
  const loadPreviewForTheme = useCallback(async (themeToLoad: ThemeKey, targetUrl: string) => {
    if (previewResults[themeToLoad] && resultsUrl === targetUrl) {
        console.log(`[Cache] Using cached data for theme: ${themeToLoad} and URL: ${targetUrl}`);
        if (activeTheme !== themeToLoad) setActiveTheme(themeToLoad);
        if (currentTab !== "migrated") setCurrentTab("migrated");
        return;
    }

    console.log(`[API Call] Fetching preview for URL: ${targetUrl} with theme: ${themeToLoad}`);
    setIsLoading(true); setFetchError(null);

    if (resultsUrl !== targetUrl) {
        console.log(`[Cache] Fetching for new URL ('${targetUrl}' != '${resultsUrl}'). Clearing ALL cached results.`);
        setPreviewResults({});
        setResultsUrl(targetUrl); // Set the *new* target URL immediately
    }

    try {
      const response = await fetch("/api/preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: themeToLoad }),
      });
      const responseBody = await response.json();
      if (!response.ok) throw new Error(responseBody.error || `HTTP error! Status: ${response.status}`);

      console.log(`[API Call] Success for theme: ${themeToLoad}. Caching result for URL: ${targetUrl}`);
      setPreviewResults(prev => ({ ...prev, [themeToLoad]: responseBody as PreviewResult }));
      setActiveTheme(themeToLoad);
      setCurrentTab("migrated");

    } catch (error: any) {
      console.error("[API Call] Fetch failed:", error);
      setFetchError(`Preview generation failed: ${error.message || "Unknown error"}`);
      const resultsExistForTarget = Object.values(previewResults).some(r => r !== undefined);
      if (resultsUrl === targetUrl && !resultsExistForTarget) { setResultsUrl(null); }
      setPreviewResults(prev => ({ ...prev, [themeToLoad]: undefined }));
    } finally {
      setIsLoading(false);
    }
  }, [previewResults, resultsUrl, activeTheme, currentTab]); // Added missing dependencies


  // Handles the main "Generate Previews" button click
  const handleInitialPreview = () => {
     if (!url) { setFetchError("Please enter a WordPress URL."); return; }
     const targetUrl = normalizeUrl(url);
     if(targetUrl !== url) { setUrl(targetUrl); }
     console.log(`[UI Action] Generate Previews clicked for URL: ${targetUrl} with selected theme: ${activeTheme}`);
     loadPreviewForTheme(activeTheme, targetUrl);
   };

  // Handles clicking a theme button *within* the preview section
  const handleThemeSelectionChange = (newTheme: ThemeKey) => {
    console.log(`[UI Action] Theme button clicked in preview: ${newTheme}. Current active: ${activeTheme}`);
    if (isLoading || isMigrating || newTheme === activeTheme) return;

    const urlForExistingResults = resultsUrl;
    if (!urlForExistingResults) {
        if (url) {
             const normalizedInputUrl = normalizeUrl(url);
             console.log(`[UI Action] No resultsUrl, triggering initial fetch for theme ${newTheme} and url ${normalizedInputUrl}`);
             loadPreviewForTheme(newTheme, normalizedInputUrl);
        } else { setFetchError("Cannot change theme without a URL."); }
        return;
    }

    if (previewResults[newTheme]) {
        console.log(`[Cache] Switching to cached theme: ${newTheme} for URL: ${urlForExistingResults}`);
        setActiveTheme(newTheme);
         if (currentTab !== "migrated") setCurrentTab("migrated");
    } else {
        console.log(`[Cache] Cache miss for theme: ${newTheme} and URL: ${urlForExistingResults}. Fetching...`);
        loadPreviewForTheme(newTheme, urlForExistingResults);
    }
  };


  // Trigger Migration & Download
  const handleMigrate = async () => {
      const migrateUrl = resultsUrl;
      if (!migrateUrl || !activeTheme || !previewResults[activeTheme]) {
        setMigrationError("Cannot migrate. Please generate a valid preview for the active theme first."); return;
      }
      console.log(`[Migrate] Starting migration for ${migrateUrl} with theme ${activeTheme}`);
      setIsMigrating(true); setMigrationError(null); setFetchError(null);

      try {
        const response = await fetch("/api/migrate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wpUrl: migrateUrl, theme: activeTheme }),
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
        console.log("[Migrate] Download initiated successfully.");

      } catch (error: any) { console.error("[Migrate] Migration/Download failed:", error); setMigrationError(`${error.message || "Unknown migration error"}`);
      } finally { setIsMigrating(false); }
  };

  // Render Skeleton
  const renderSkeleton = () => ( <div className="p-6 space-y-4 animate-pulse"> <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2" /> <Skeleton className="h-40 w-full" /> <Skeleton className="h-4 w-full mt-4" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" /> </div> );

  // Render Preview Area Logic
  const renderPreviewArea = () => {
    const noDataLoadedYet = Object.keys(previewResults).length === 0 && resultsUrl === null;
    const firstResult = Object.values(previewResults).find(r => r !== undefined);
    const ActiveLayout = themeLayoutMap[activeTheme];
    const activePreviewData = previewResults[activeTheme];

    if (noDataLoadedYet && !isLoading && !fetchError) { return (<div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50/50 rounded"><div className="text-center p-6"><Image src="/placeholder.svg" width={400} height={200} alt="WP Offramp Placeholder" className="mx-auto mb-4 rounded border opacity-50" priority /><p className="text-muted-foreground">Enter URL & Select Theme above.</p></div></div>); }
    if (fetchError && !isLoading && noDataLoadedYet) { return (<Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /> <AlertTitle>Preview Error</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>); }
    if (isLoading && noDataLoadedYet) { return renderSkeleton(); }
    if (!firstResult && !isLoading) { return <div className="p-6 text-center text-muted-foreground">Could not load initial preview data. Please try again or check the URL.</div>; }

    return (
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between min-h-[50px]">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="original" disabled={!firstResult}>Original HTML</TabsTrigger>
                <TabsTrigger value="migrated" disabled={!firstResult}>Preview Theme</TabsTrigger>
            </TabsList>
            <div className="flex items-center text-sm text-muted-foreground h-5">{isLoading && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Preview...</>}</div>
            {fetchError && !isLoading && !noDataLoadedYet && (<div className="w-full sm:w-auto text-xs text-red-600 flex items-center gap-1 pt-1 sm:pt-0"><AlertCircle className="h-3 w-3" /> Error loading preview.</div>)}
        </div>

        {/* Original HTML Tab */}
        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!firstResult ? renderSkeleton() : (
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{firstResult.title || 'Original Content'}</h2>
                 {firstResult.author && firstResult.date && (<div className="text-xs text-muted-foreground mb-4">By {firstResult.author} on {new Date(firstResult.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>)}
                 <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: firstResult.originalHtml || "<p>Original content not available.</p>" }}/>
              </>
          )}
        </TabsContent>

        {/* Migrated MDX Tab */}
        <TabsContent value="migrated" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="space-y-2 mb-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Preview Theme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               {themeKeys.map((themeId) => (<Button key={themeId} variant={'outline'} size="sm" onClick={() => handleThemeSelectionChange(themeId)} disabled={isLoading || isMigrating || !resultsUrl} className={cn("h-auto py-1.5 px-2.5 justify-center text-xs sm:text-sm border transition-all duration-150 ease-in-out", themeButtonStyles[themeId], activeTheme === themeId ? 'ring-2 ring-offset-1 ring-blue-500 font-semibold shadow-md scale-105' : 'ring-0 opacity-90 hover:opacity-100', !previewResults[themeId] && resultsUrl ? 'opacity-60' : '')} title={!previewResults[themeId] && resultsUrl ? `Load ${THEMES[themeId].name} Preview` : `Switch to ${THEMES[themeId].name}`}> {THEMES[themeId].name} </Button>))}
             </div>
            </div>
            <hr className="my-4"/>
            <div className="min-h-[300px] relative">
              {isLoading && !activePreviewData ? (renderSkeleton()) :
               !activePreviewData ? (<div className="text-center py-10 text-muted-foreground">{resultsUrl ? (fetchError ? `Error loading preview for ${THEMES[activeTheme].name}.` : `Preview for '${THEMES[activeTheme].name}' not loaded. Click its button.`) : 'Generate preview first.'}</div>) :
               // ** FIXED JSX HERE **
               (<ActiveLayout mdxContent={activePreviewData.mdx || ""} />)
              }
            </div>
        </TabsContent>
      </Tabs>
    );
  };

  // --- Main Component Return ---
  return (
    <div className="flex flex-col w-full space-y-6"> {/* Added space-y-6 */}

      {/* Top Section - Input & Initial Theme Selection */}
      <div className="max-w-3xl mx-auto w-full">
        <Card id="input-section">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-medium">1. Configure & Generate Preview</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL Input */}
            <div>
                <Label htmlFor="wordpress-url" className="pb-1.5 block text-sm font-medium">WordPress Site URL</Label>
                <Input id="wordpress-url" type="url" placeholder="https://your-wordpress-site.com" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 text-base sm:text-sm" aria-label="WordPress Site URL" disabled={isLoading || isMigrating} />
            </div>
            {/* Initial Styled Theme Selection Buttons */}
            <div>
                <Label className="pb-2 block text-sm font-medium">Select Initial Theme</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {themeKeys.map((themeId) => (<Button key={`select-${themeId}`} variant={'outline'} size="default" onClick={() => !isLoading && !isMigrating && setActiveTheme(themeId)} disabled={isLoading || isMigrating} className={cn("h-10 px-3 justify-center border transition-all duration-150 ease-in-out", themeButtonStyles[themeId], activeTheme === themeId ? 'ring-2 ring-offset-2 ring-blue-600 shadow-md scale-105 font-semibold' : 'font-normal opacity-90 hover:opacity-100')}> {THEMES[themeId].name} </Button>))}
                  </div>
            </div>
            {/* Generate Button */}
            <Button onClick={handleInitialPreview} disabled={!url || isLoading || isMigrating} className="w-full px-6" size="lg">
                {isLoading && !resultsUrl ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Initial Preview...</> ) : isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> ) : ( resultsUrl ? "Regenerate Previews" : "Generate Previews" )}
            </Button>
            {/* Fetch Error Display */}
            {fetchError && !resultsUrl && !isLoading && (<p className="text-sm text-red-600 pt-2">{fetchError}</p>)}
          </CardContent>
        </Card>
      </div>

       {/* Preview Window Section - Now Rendered Conditionally */}
        <div className="w-full">
            <div className="border rounded-lg overflow-hidden shadow-lg bg-background w-full">
                <div className="bg-muted border-b px-4 py-2 flex items-center text-xs">
                    <div className="flex space-x-1.5"> <div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div> <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div> <div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div> </div>
                    <div className="flex-1 text-center font-medium text-muted-foreground truncate px-4">{Object.values(previewResults).find(r=>r)?.title || "WP Offramp Preview"}</div>
                    <div className="w-10"></div>
                </div>
                <div className="min-h-[500px] overflow-hidden relative w-full">
                    {renderPreviewArea()} {/* This function handles all states including initial placeholder */}
                </div>
            </div>
        </div>

      {/* Migration Card Section - Conditional */}
      {resultsUrl && Object.keys(previewResults).length > 0 && ( // Only show if we have some valid results for the current URL
        <div className="max-w-3xl mx-auto w-full">
            {previewResults[activeTheme] ? ( // Check if data for the *active* theme exists before showing card
                <Card>
                    <CardHeader className="pb-2"> <h3 className="text-lg font-medium">2. Migrate & Download</h3> <p className="text-sm text-muted-foreground"> Generates a complete Next.js project for the <span className="font-medium">{THEMES[activeTheme].name}</span> theme. </p> </CardHeader>
                    <CardContent>
                    {migrationError && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Migration Error</AlertTitle> <AlertDescription>{migrationError}</AlertDescription> </Alert> )}
                    <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoading || !previewResults[activeTheme]} className="w-full">
                        {isMigrating ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Migrating & Zipping...</> ) : ( <><Download className="mr-2 h-4 w-4" />Migrate & Download ZIP ({THEMES[activeTheme]?.name} Theme)</> )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center"> Free migration limited to one page per session (per browser, resets hourly). </p>
                    </CardContent>
                </Card>
            ) : (
                 // Optional: Show a placeholder if resultsUrl is set but the active theme data is missing (e.g., failed load)
                 <div className="text-center text-muted-foreground p-4">Select a successfully loaded theme preview above to enable migration.</div>
            )}
        </div>
      )}

        {/* Info alert if waiting for input - Adjusted condition */}
        {!url && !isLoading && Object.keys(previewResults).length === 0 && !resultsUrl && (
             <div className="max-w-3xl mx-auto w-full">
                 <Alert className="mt-6 border-l-primary border-l-4" role="status">
                    <Info className="h-4 w-4"/> <AlertTitle>Enter a URL to Start</AlertTitle>
                    <AlertDescription>Input your public WordPress site URL above and select a theme to generate previews and enable migration.</AlertDescription>
                 </Alert>
             </div>
        )}

    </div>
  );
}