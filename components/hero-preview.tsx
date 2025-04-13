// components/hero-preview.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMES, ThemeKey } from "@/lib/constants"; // Adjust path if needed
import type { PreviewResult } from "@/app/api/preview/route"; // Adjust path if needed

const themeKeys = Object.keys(THEMES) as ThemeKey[];

export default function HeroPreview() {
  const [url, setUrl] = useState("");
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("clarity");
  const [isLoading, setIsLoading] = useState(false); // Single loading state
  const [previewResults, setPreviewResults] = useState<{ [key in ThemeKey]?: PreviewResult }>({});
  const [fetchError, setFetchError] = useState<string | null>(null); // For fetch/API errors
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("migrated"); // Default to migrated preview

  // Track which URL the current results are for
  const [resultsUrl, setResultsUrl] = useState<string | null>(null);

  // Effect to clear results when URL changes
  useEffect(() => {
    setPreviewResults({});
    setFetchError(null);
    setMigrationError(null);
    setResultsUrl(null);
  }, [url]);


  // --- Fetch Preview Data (modified for caching) ---
  const loadPreviewForTheme = useCallback(async (themeToLoad: ThemeKey, targetUrl: string) => {
    // Don't fetch if data for this theme already exists for the current URL
    if (previewResults[themeToLoad] && resultsUrl === targetUrl) {
      console.log(`[Preview] Using cached data for theme: ${themeToLoad}`);
      setActiveTheme(themeToLoad); // Ensure the theme becomes active
      return;
    }

    console.log(`[Preview] Fetching preview for ${targetUrl} with theme ${themeToLoad}`);
    setIsLoading(true); // Use single loading state
    setFetchError(null);
    setMigrationError(null);

    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: themeToLoad }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        console.error(`[Preview] API Error ${response.status}:`, responseBody);
        throw new Error(responseBody.error || `HTTP error! Status: ${response.status}`);
      }

      console.log(`[Preview] API Success for theme: ${themeToLoad}`);
      // Store result keyed by theme and update the resultsUrl
      setPreviewResults(prev => ({ ...prev, [themeToLoad]: responseBody as PreviewResult }));
      setResultsUrl(targetUrl); // Mark results as valid for this URL
      setActiveTheme(themeToLoad); // Set the newly loaded theme as active

    } catch (error: any) {
      console.error("[Preview] Fetch failed:", error);
      setFetchError(`Preview failed for ${THEMES[themeToLoad].name} theme: ${error.message || "Unknown error"}`);
      // Don't clear *all* results on single theme fail, maybe show error for just that theme?
      // For simplicity now, clear all if first fetch fails
      if (Object.keys(previewResults).length === 0) {
          setPreviewResults({});
          setResultsUrl(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [previewResults, resultsUrl]); // Dependencies for the callback


  // --- Handle Initial Preview Button Click ---
   const handleInitialPreview = () => {
     if (!url) {
       setFetchError("Please enter a WordPress URL.");
       return;
     }
     let targetUrl = url;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
        setUrl(targetUrl); // Update state with corrected URL
      }

     // Reset state for new URL
     setPreviewResults({});
     setFetchError(null);
     setMigrationError(null);
     setResultsUrl(null); // Invalidate old results

     // Fetch data for the initially selected theme
     loadPreviewForTheme(activeTheme, targetUrl);
   };


  // --- Handle Theme Tab Click ---
  const handleThemeTabChange = (newTheme: ThemeKey) => {
    if (isLoading || isMigrating || newTheme === activeTheme) return; // Prevent changes while busy or if same theme

    // If we have results for the *current* URL but not for the *new* theme, fetch it
    if (resultsUrl === url && !previewResults[newTheme]) {
      loadPreviewForTheme(newTheme, url);
    } else {
       // Otherwise, just switch the active theme (data is cached or URL changed)
       setActiveTheme(newTheme);
    }
  };

  // --- Trigger Migration & Download ---
  const handleMigrate = async () => {
    let targetUrl = url; // Use the validated/corrected URL
    if (!targetUrl || !activeTheme || !previewResults[activeTheme]) { // Ensure we have data for the active theme
      setMigrationError("Cannot migrate. Please generate a valid preview first.");
      return;
    }

    console.log(`[Migrate] Starting migration for ${targetUrl} with theme ${activeTheme}`);
    setIsMigrating(true);
    setMigrationError(null);
    setFetchError(null); // Clear other errors

    try {
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: activeTheme }),
      });

      if (!response.ok) {
        let errorMsg = `Migration failed! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
            console.error(`[Migrate] API Error ${response.status}:`, errorData);
        } catch (e) { console.error(`[Migrate] API Error ${response.status}.`); }
        if (response.status === 429) {
           errorMsg = "Migration limit reached for this session (1 per hour). Please try again later.";
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/zip')) {
        console.error("[Migrate] Error: Response was not a ZIP file. Content-Type:", contentType);
        throw new Error('Migration error: Server did not return a valid ZIP file.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const disposition = response.headers.get('Content-Disposition');
      let filename = `${activeTheme}_site.zip`;
      if (disposition && disposition.includes('filename=')) {
          const filenameRegex = /filename\*?=['"]?([^'";]+)['"]?(?:;|$)/;
          const matches = filenameRegex.exec(disposition);
          if (matches?.[1]) {
              filename = decodeURIComponent(matches[1]);
          }
      }
      link.setAttribute('download', filename);
      console.log(`[Migrate] Triggering download for: ${filename}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      console.log("[Migrate] Download initiated successfully.");

    } catch (error: any) {
      console.error("[Migrate] Migration/Download failed:", error);
      setMigrationError(`${error.message || "Unknown migration error"}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // --- Render Skeleton ---
  const renderSkeleton = () => (
    <div className="p-6 space-y-4 animate-pulse">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <Skeleton className="h-4 w-1/2" /> {/* Meta */}
      <Skeleton className="h-40 w-full" /> {/* Image Placeholder */}
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );

  // --- Render Main Preview Area ---
  const renderPreviewArea = () => {
    const noDataLoadedYet = Object.keys(previewResults).length === 0 && resultsUrl === null;

    // Initial state before any fetch attempt
    if (noDataLoadedYet && !isLoading && !fetchError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50/50 rounded">
          <div className="text-center p-6">
             <Image
              src="/placeholder.svg"
              width={400} height={200}
              alt="WP Offramp Placeholder"
              className="mx-auto mb-4 rounded border opacity-50"
              priority />
            <p className="text-muted-foreground">Enter your WordPress Site URL above to generate previews.</p>
          </div>
        </div>
      );
    }

     // Global Fetch/API Error State
     if (fetchError && !isLoading) {
      return (
           <Alert variant="destructive" className="m-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Preview Error</AlertTitle>
             <AlertDescription>{fetchError} Please check the URL and ensure the WordPress REST API is publicly accessible and returns posts.</AlertDescription>
           </Alert>
      );
    }

    // Loading state (show skeleton)
    if (isLoading && noDataLoadedYet) {
        return renderSkeleton();
    }

    // --- Render Tabs if we have *any* data or are loading subsequent themes ---
    const firstResult = Object.values(previewResults)[0]; // Get data for original tab
    const activePreview = previewResults[activeTheme];

    return (
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        {/* Tab Triggers & Loading Indicator */}
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="original" disabled={isLoading || !firstResult}>Original HTML</TabsTrigger>
            <TabsTrigger value="migrated" disabled={isLoading || !firstResult}>Preview Theme</TabsTrigger>
          </TabsList>
          {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Preview...
                </div>
            )}
        </div>

        {/* Original HTML Tab Content */}
        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!firstResult ? renderSkeleton() : ( // Show skeleton if first result isn't loaded
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{firstResult.title || 'Original Content'}</h2>
                {firstResult.author && firstResult.date && (
                  <div className="text-xs text-muted-foreground mb-4">
                    By {firstResult.author} on {new Date(firstResult.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                <div
                    className="prose prose-sm sm:prose max-w-none"
                    // WARNING: Renders raw HTML. Consider sanitizing or using an iframe in production.
                    dangerouslySetInnerHTML={{ __html: firstResult.originalHtml || "<p>Could not load original content.</p>" }}
                />
              </>
          )}
        </TabsContent>

        {/* Migrated MDX Tab Content */}
        <TabsContent value="migrated" className="p-4 md:p-6 overflow-auto border rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
           <div className="space-y-2 mb-4">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Theme</Label>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
               {themeKeys.map((themeId) => (
                 <Button
                   key={themeId}
                   variant={activeTheme === themeId ? "secondary" : "outline"}
                   size="sm"
                   className={`h-auto py-1 px-2 justify-center text-xs sm:text-sm ${activeTheme === themeId ? 'font-semibold ring-2 ring-primary ring-offset-1' : ''}`}
                   onClick={() => handleThemeTabChange(themeId)} // Use dedicated handler
                   disabled={isLoading || isMigrating}
                 >
                   {THEMES[themeId].name}
                 </Button>
               ))}
             </div>
           </div>
           <hr className="my-4"/>
           {/* Show skeleton for the active theme ONLY if it's loading AND not yet loaded */}
           {isLoading && !activePreview ? renderSkeleton() : !activePreview ? (
                <div className="text-center py-10 text-muted-foreground">Select a theme or generate preview first.</div>
             ) : (
            <div className="prose prose-sm sm:prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activePreview.mdx?.replace(/^---[\s\S]*?---/, '').trim() || "Content for this theme not loaded or transformation failed."}
                </ReactMarkdown>
                 <p className="mt-4 text-xs italic text-muted-foreground">Note: Preview uses basic Markdown rendering. Custom components & advanced styles may differ in the final site.</p>
            </div>
            )}
        </TabsContent>
      </Tabs>
    );
  };


  return (
    <div className="space-y-6">
      {/* Preview Window */}
      <div className="border rounded-lg overflow-hidden shadow-lg bg-background">
        <div className="bg-muted border-b px-4 py-2 flex items-center text-xs">
           <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div>
          </div>
          <div className="flex-1 text-center font-medium text-muted-foreground truncate px-4">
            {/* Use title from the first available preview result */}
            {Object.values(previewResults)[0]?.title ? `Preview: ${Object.values(previewResults)[0]?.title}` : "WP Offramp Preview"}
          </div>
           <div className="w-10"> {/* Spacer */}</div>
        </div>
        <div className="min-h-[500px] overflow-hidden relative"> {/* Increased height */}
          {renderPreviewArea()}
        </div>
      </div>

      {/* Input Card */}
      <Card id="input-section">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">
            1. Enter your WordPress Site URL
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Input
              id="wordpress-url"
              type="url"
              placeholder="https://your-wordpress-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 text-base sm:text-sm"
              aria-label="WordPress Site URL"
              disabled={isLoading || isMigrating}
            />
            <Button
                onClick={handleInitialPreview} // Use dedicated handler for button click
                disabled={!url || isLoading || isMigrating}
                className="w-full sm:w-auto px-6"
            >
              {isLoading && !previewResults[activeTheme] ? ( // Show loading only if fetching initial/new theme
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Generate Previews"
              )}
            </Button>
          </div>
           {/* Display fetch error below input if it occurred during initial fetch */}
            {fetchError && Object.keys(previewResults).length === 0 && !isLoading && (
                 <p className="text-sm text-red-600 mt-2">{fetchError}</p>
             )}
        </CardContent>
      </Card>

       {/* Migration Card - Only show if we have *some* valid preview data */}
       {resultsUrl === url && Object.keys(previewResults).length > 0 && (
            <Card>
                <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">2. Migrate & Download</h3>
                     <p className="text-sm text-muted-foreground">Generates a complete Next.js project for the <span className="font-medium">{THEMES[activeTheme].name}</span> theme.</p>
                </CardHeader>
                <CardContent>
                     {migrationError && (
                         <Alert variant="destructive" className="mb-4">
                         <AlertCircle className="h-4 w-4" />
                         <AlertTitle>Migration Error</AlertTitle>
                         <AlertDescription>{migrationError}</AlertDescription>
                         </Alert>
                     )}
                     {/* Disable if the active theme's data isn't actually loaded */}
                    <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoading || !previewResults[activeTheme]} className="w-full">
                        {isMigrating ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Migrating & Zipping... (this can take ~30s)
                            </>
                        ) : (
                           <>
                            <Download className="mr-2 h-4 w-4" />
                            Migrate & Download ZIP ({THEMES[activeTheme]?.name} Theme)
                           </>
                        )}
                    </Button>
                     <p className="text-xs text-muted-foreground mt-2 text-center">
                        Free migration limited to one page per session (per browser, resets hourly).
                     </p>
                </CardContent>
            </Card>
        )}
        {/* Info alert if waiting for input */}
        {!url && !isLoading && Object.keys(previewResults).length === 0 && (
             <Alert className="mt-6 border-l-primary border-l-4" role="status">
                <Info className="h-4 w-4"/>
               <AlertTitle>Enter a URL to Start</AlertTitle>
               <AlertDescription>Input your public WordPress site URL above to generate previews and enable migration.</AlertDescription>
             </Alert>
        )}

    </div>
  );
}