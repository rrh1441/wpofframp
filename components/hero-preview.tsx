// components/hero-preview.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMES, ThemeKey } from "@/lib/constants"; // Use updated constants
import CSSDebugger from '@/components/CSSDebugger';
import type { PreviewResult } from "@/app/api/preview/route"; // Use updated type

// Import the new theme layout components
import { ModernLayout } from './themes/ModernLayout';
import { DrudgeLayout } from './themes/DrudgeLayout';
import { MatrixLayout } from './themes/MatrixLayout';
import { GhibliLayout } from './themes/GhibliLayout';

// Define the theme keys we are using
const themeKeys = ['modern', 'drudge', 'matrix', 'ghibli'] as ThemeKey[];

// Mapping themes to their layout components
const themeLayoutMap: Record<ThemeKey, React.FC<{ mdxContent: string }>> = {
    modern: ModernLayout,
    drudge: DrudgeLayout,
    matrix: MatrixLayout,
    ghibli: GhibliLayout,
    // Add momentum/serenity here if you keep them in constants.ts
    // momentum: ModernLayout, // Placeholder
    // serenity: ModernLayout, // Placeholder
};


export default function HeroPreview() {
  const [url, setUrl] = useState("");
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("modern"); // Default to modern
  const [isLoading, setIsLoading] = useState(false); // Single loading state
  // State to cache results: keys are theme names, values are PreviewResult objects
  const [previewResults, setPreviewResults] = useState<{ [key in ThemeKey]?: PreviewResult }>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("migrated"); // Start on migrated tab
  const [resultsUrl, setResultsUrl] = useState<string | null>(null); // Track URL for cache validity

  // Clear results when URL changes significantly
  useEffect(() => {
    setPreviewResults({});
    setFetchError(null);
    setMigrationError(null);
    setResultsUrl(null);
    // Optionally reset active theme if desired when URL clears
    // setActiveTheme("modern");
  }, [url]);


  // Fetches preview data ONLY if not already cached for the current URL and theme
  const loadPreviewForTheme = useCallback(async (themeToLoad: ThemeKey, targetUrl: string) => {
    // Check cache first
    if (previewResults[themeToLoad] && resultsUrl === targetUrl) {
      console.log(`[Preview] Using cached data for theme: ${themeToLoad}`);
      setActiveTheme(themeToLoad); // Ensure active theme is updated even if cached
      return; // Already loaded for this URL
    }

    console.log(`[Preview] Fetching preview for ${targetUrl} with theme ${themeToLoad}`);
    setIsLoading(true);
    setFetchError(null); // Clear previous errors before new fetch
    setMigrationError(null);

    // If it's the very first fetch for this URL, clear all old results
    if (resultsUrl !== targetUrl) {
        setPreviewResults({});
        setResultsUrl(null);
    }

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

      console.log(`[Preview] API Success for theme: ${themeToLoad}. Caching result.`);
      // Update cache with the new result, keyed by its theme
      setPreviewResults(prev => ({ ...prev, [themeToLoad]: responseBody as PreviewResult }));
      setResultsUrl(targetUrl); // Mark cache as valid for this URL
      setActiveTheme(themeToLoad); // Switch active theme to the newly loaded one
      setCurrentTab("migrated"); // Switch to migrated tab automatically

    } catch (error: any) {
      console.error("[Preview] Fetch failed:", error);
      setFetchError(`Preview generation failed: ${error.message || "Unknown error"}`);
      // Clear cache if the first fetch for this URL fails completely
       if (resultsUrl !== targetUrl) {
         setPreviewResults({});
         setResultsUrl(null);
       }
    } finally {
      setIsLoading(false);
    }
  }, [previewResults, resultsUrl]); // Dependencies for the callback


  // Handles the main "Generate Previews" button click
   const handleInitialPreview = () => {
     if (!url) {
       setFetchError("Please enter a WordPress URL.");
       return;
     }
     let targetUrl = url;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
        setUrl(targetUrl); // Update state visually
      }

     // Fetch the currently selected activeTheme's data
     loadPreviewForTheme(activeTheme, targetUrl);
   };

  // Handles clicking a theme button *within* the preview section
  const handleThemeSelectionChange = (newTheme: ThemeKey) => {
    if (isLoading || isMigrating || newTheme === activeTheme) return;

    // If we have results for the current URL, check cache for the new theme
    if (resultsUrl === url) {
        if (!previewResults[newTheme]) {
            // Data for this theme not cached for this URL, fetch it
            loadPreviewForTheme(newTheme, url);
        } else {
            // Data is cached, just switch active theme
            console.log(`[Preview] Switching to cached theme: ${newTheme}`);
            setActiveTheme(newTheme);
        }
    } else {
        // URL has changed since results were loaded, need to re-fetch
        // (Should ideally be triggered by handleInitialPreview, but handle defensively)
        loadPreviewForTheme(newTheme, url);
    }
  };

  // --- Trigger Migration & Download (No changes needed here) ---
  const handleMigrate = async () => {
     let targetUrl = url;
     if (!targetUrl || !activeTheme || !previewResults[activeTheme]) {
       setMigrationError("Cannot migrate. Please generate a valid preview first.");
       return;
     }
      if (!/^https?:\/\//i.test(targetUrl)) { targetUrl = `https://${targetUrl}`; }

    console.log(`[Migrate] Starting migration for ${targetUrl} with theme ${activeTheme}`);
    setIsMigrating(true);
    setMigrationError(null); setFetchError(null);

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
        if (response.status === 429) { errorMsg = "Migration limit reached for this session (1 per hour). Please try again later."; }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/zip')) {
        console.error("[Migrate] Error: Response was not a ZIP file.", contentType);
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
            if (matches?.[1]) { filename = decodeURIComponent(matches[1]); }
        }
      link.setAttribute('download', filename);
      console.log(`[Migrate] Triggering download for: ${filename}`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
      <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-full mt-4" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" />
    </div>
  );

  // --- Render Main Preview Area ---
  const renderPreviewArea = () => {
    const noDataLoadedYet = Object.keys(previewResults).length === 0 && resultsUrl === null;
    const firstResult = Object.values(previewResults)[0]; // Used for Original HTML tab
    const ActiveLayout = themeLayoutMap[activeTheme]; // Get the component for the active theme
    const activePreviewData = previewResults[activeTheme]; // Get data for the active theme

    // Initial state
    if (noDataLoadedYet && !isLoading && !fetchError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50/50 rounded">
            <div className="text-center p-6">
                <Image src="/placeholder.svg" width={400} height={200} alt="WP Offramp Placeholder" className="mx-auto mb-4 rounded border opacity-50" priority />
                <p className="text-muted-foreground">Enter your WordPress Site URL above to generate previews.</p>
            </div>
        </div>);
    }

     // Global Fetch/API Error State
     if (fetchError && !isLoading) {
      return (<Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" /> <AlertTitle>Preview Error</AlertTitle>
                <AlertDescription>{fetchError} Please check the URL and ensure the WordPress REST API is publicly accessible and returns posts.</AlertDescription>
             </Alert>);
    }

    // Loading state (show skeleton only if NO data at all is loaded yet)
    if (isLoading && noDataLoadedYet) {
        return renderSkeleton();
    }

    // --- Render Tabs (Show even if loading subsequent themes) ---
    return (
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="original" disabled={!firstResult}>Original HTML</TabsTrigger>
            <TabsTrigger value="migrated" disabled={!firstResult}>Preview Theme</TabsTrigger>
          </TabsList>
          {isLoading && <div className="flex items-center text-sm text-muted-foreground animate-pulse"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Preview...</div>}
        </div>

        {/* Original HTML Tab */}
        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!firstResult ? renderSkeleton() : (
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{firstResult.title || 'Original Content'}</h2>
                {firstResult.author && firstResult.date && (<div className="text-xs text-muted-foreground mb-4">By {firstResult.author} on {new Date(firstResult.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>)}
                <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: firstResult.originalHtml || "<p>Original content not available.</p>" }}/>
              </>
          )}
        </TabsContent>

        {/* Migrated MDX Tab */}
        <TabsContent value="migrated" className="p-4 md:p-6 overflow-auto border rounded-b-md flex-grow bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
           {/* Theme Selection Buttons */}
           <div className="space-y-2 mb-4">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Theme</Label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2"> {/* Adjusted grid */}
               {themeKeys.map((themeId) => (
                 <Button key={themeId} variant={activeTheme === themeId ? "secondary" : "outline"} size="sm"
                   className={`h-auto py-1 px-2 justify-center text-xs sm:text-sm ${activeTheme === themeId ? 'font-semibold ring-2 ring-primary ring-offset-1' : ''}`}
                   onClick={() => handleThemeSelectionChange(themeId)} disabled={isLoading || isMigrating}>
                   {THEMES[themeId].name}
                 </Button>
               ))}
             </div>
           </div>
           <hr className="my-4"/>
           
           {/* Render Active Theme Layout */}
           <div className="min-h-[200px] relative"> {/* Min height to prevent collapse */}
             {isLoading && !activePreviewData ? (
                renderSkeleton()
             ) : !activePreviewData ? (
                <div className="text-center py-10 text-muted-foreground">Generate preview to see content for the '{THEMES[activeTheme].name}' theme.</div>
             ) : (
                <>
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-black/10 px-2 py-1 mb-2 text-xs rounded">
                      <div>Theme: {activeTheme} | MDX Length: {activePreviewData.mdx?.length || 0} chars</div>
                    </div>
                  )}
                
                  {/* Render the specific layout component for the active theme */}
                  <ActiveLayout 
                    mdxContent={activePreviewData.mdx?.replace(/^---[\s\S]*?---/, '').trim() || ""} 
                  />
                </>
             )}
           </div>
        </TabsContent>
      </Tabs>
    );
  };

  // --- Main Component Return ---
  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card id="input-section">
         <CardHeader className="pb-3"> <h3 className="text-lg font-medium">1. Enter WordPress Site URL</h3> </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Input id="wordpress-url" type="url" placeholder="https://your-wordpress-site.com" value={url}
              onChange={(e) => setUrl(e.target.value)} className="flex-1 text-base sm:text-sm" aria-label="WordPress Site URL" disabled={isLoading || isMigrating} />
            <Button onClick={handleInitialPreview} disabled={!url || isLoading || isMigrating} className="w-full sm:w-auto px-6">
              {isLoading && Object.keys(previewResults).length === 0 ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>) : ("Generate Previews")}
            </Button>
          </div>
           {fetchError && Object.keys(previewResults).length === 0 && !isLoading && (<p className="text-sm text-red-600 mt-2">{fetchError}</p>)}
        </CardContent>
      </Card>

      {/* Preview Window */}
      <div className="border rounded-lg overflow-hidden shadow-lg bg-background">
        <div className="bg-muted border-b px-4 py-2 flex items-center text-xs">
           <div className="flex space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div></div>
           <div className="flex-1 text-center font-medium text-muted-foreground truncate px-4">{Object.values(previewResults)[0]?.title ? `Preview: ${Object.values(previewResults)[0]?.title}` : "WP Offramp Preview"}</div>
           <div className="w-10"></div>
        </div>
        <div className="min-h-[500px] overflow-hidden relative">{renderPreviewArea()}</div>
      </div>


       {/* Migration Card - Show only if we have valid results for the current URL */}
       {resultsUrl === url && Object.keys(previewResults).length > 0 && (
            <Card>
                <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">2. Migrate & Download</h3>
                     <p className="text-sm text-muted-foreground">Generates a complete Next.js project for the <span className="font-medium">{THEMES[activeTheme].name}</span> theme.</p>
                </CardHeader>
                <CardContent>
                     {migrationError && (<Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /> <AlertTitle>Migration Error</AlertTitle><AlertDescription>{migrationError}</AlertDescription></Alert>)}
                     <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoading || !previewResults[activeTheme]} className="w-full">
                        {isMigrating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Migrating & Zipping... (this can take ~30s)</>) : (<><Download className="mr-2 h-4 w-4" />Migrate & Download ZIP ({THEMES[activeTheme]?.name} Theme)</>)}
                     </Button>
                     <p className="text-xs text-muted-foreground mt-2 text-center">Free migration limited to one page per session (per browser, resets hourly).</p>
                </CardContent>
            </Card>
        )}
        {/* Info alert if waiting for input */}
        {!url && !isLoading && Object.keys(previewResults).length === 0 && (
             <Alert className="mt-6 border-l-primary border-l-4" role="status">
                <Info className="h-4 w-4"/> <AlertTitle>Enter a URL to Start</AlertTitle>
                <AlertDescription>Input your public WordPress site URL above to generate previews and enable migration.</AlertDescription>
             </Alert>
        )}

    </div>
  );
}