// components/hero-preview.tsx
// No changes required in this file based on the latest request.
// It remains the same as the previous version.

"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, Info } from "lucide-react"; // Info can be removed if not used elsewhere
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMES, ThemeKey } from "@/lib/constants";
import type { PreviewResult } from "@/app/api/preview/route";
import { cn } from "@/lib/utils";

// Import the theme layout components
import { ModernLayout } from './themes/ModernLayout';
import { DrudgeLayout } from './themes/DrudgeLayout';
import { MatrixLayout } from './themes/MatrixLayout';
import { GhibliLayout } from './themes/GhibliLayout';

const themeKeys = ['modern', 'drudge', 'matrix', 'ghibli'] as ThemeKey[];

const themeLayoutMap: Record<ThemeKey, React.FC<{ mdxContent: string }>> = {
    modern: ModernLayout,
    drudge: DrudgeLayout,
    matrix: MatrixLayout,
    ghibli: GhibliLayout,
};

const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized) return "";
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }
    try {
        const urlObj = new URL(normalized);
        normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, "") + urlObj.search + urlObj.hash; // Ensure trailing slash removed from pathname only
        return normalized;
    } catch (e) {
        console.warn("Could not normalize URL, returning as is:", inputUrl);
        return inputUrl;
    }
};

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

  useEffect(() => {
    const handler = setTimeout(() => {
        const normalizedInputUrl = url ? normalizeUrl(url) : "";
        if ((normalizedInputUrl && normalizedInputUrl !== resultsUrl) || (url === "" && resultsUrl !== null)) {
            setPreviewResults({}); setFetchError(null); setMigrationError(null); setResultsUrl(null);
        }
    }, 300);
    return () => clearTimeout(handler);
  }, [url, resultsUrl]);

   useEffect(() => {
      if (Object.keys(previewResults).length === 0 && resultsUrl !== null) {
          setResultsUrl(null);
      }
  }, [previewResults, resultsUrl]);


  const loadPreviewForTheme = useCallback(async (themeToLoad: ThemeKey, targetUrl: string) => {
    if (previewResults[themeToLoad] && resultsUrl === targetUrl) {
        if (activeTheme !== themeToLoad) setActiveTheme(themeToLoad);
        if (currentTab !== "migrated") setCurrentTab("migrated");
        return;
    }

    setIsLoading(true); setFetchError(null);

    if (resultsUrl !== targetUrl) {
        setPreviewResults({});
        setResultsUrl(targetUrl);
    }

    try {
      const response = await fetch("/api/preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: themeToLoad }),
      });
      const responseBody = await response.json();
      if (!response.ok) throw new Error(responseBody.error || `HTTP error! Status: ${response.status}`);

      setPreviewResults(prev => ({ ...prev, [themeToLoad]: responseBody as PreviewResult }));
      setActiveTheme(themeToLoad);
      setCurrentTab("migrated");

    } catch (error: any) {
      console.error("[API Call] Fetch failed:", error);
      const errorMsg = `Preview generation failed: ${error.message || "Unknown error"}`;
      setFetchError(errorMsg);

      setPreviewResults(prev => ({ ...prev, [themeToLoad]: undefined }));

       const otherResultsExist = Object.entries(previewResults).some(
           ([key, value]) => key !== themeToLoad && value !== undefined
       );

       if (resultsUrl === targetUrl && !otherResultsExist) {
            setResultsUrl(null);
       }

    } finally {
      setIsLoading(false);
    }
  }, [previewResults, resultsUrl, activeTheme, currentTab]);


  const handleInitialPreview = () => {
     if (!url) { setFetchError("Please enter a WordPress URL."); return; }
     const targetUrl = normalizeUrl(url);
     if(targetUrl !== url) { setUrl(targetUrl); }
     loadPreviewForTheme(activeTheme, targetUrl);
   };

  const handleThemeSelectionChange = (newTheme: ThemeKey) => {
    if (isLoading || isMigrating || newTheme === activeTheme) return;

    setActiveTheme(newTheme);

    const urlForExistingResults = resultsUrl;
    if (urlForExistingResults) {
         loadPreviewForTheme(newTheme, urlForExistingResults);
    }
  };


  const handleMigrate = async () => {
      const migrateUrl = resultsUrl;
      if (!migrateUrl || !activeTheme || !previewResults[activeTheme]) {
        setMigrationError("Cannot migrate. Please generate a valid preview for the active theme first."); return;
      }
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

      } catch (error: any) { console.error("[Migrate] Migration/Download failed:", error); setMigrationError(`${error.message || "Unknown migration error"}`);
      } finally { setIsMigrating(false); }
  };

  const renderSkeleton = () => ( <div className="p-6 space-y-4 animate-pulse"> <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2" /> <Skeleton className="h-40 w-full" /> <Skeleton className="h-4 w-full mt-4" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" /> </div> );

  const renderPreviewArea = () => {
    const noDataLoadedYet = Object.keys(previewResults).length === 0 && resultsUrl === null;
    const firstResult = Object.values(previewResults).find(r => r !== undefined);
    const ActiveLayout = themeLayoutMap[activeTheme];
    const activePreviewData = previewResults[activeTheme];

    if (!url && !isLoading && !resultsUrl) {
        return (<div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50/50 rounded"><div className="text-center p-6"><Image src="/placeholder.svg" width={400} height={200} alt="WP Offramp Placeholder" className="mx-auto mb-4 rounded border opacity-50" priority /><p className="text-muted-foreground">Enter URL & Select Theme above.</p></div></div>);
    }
    if (url && !isLoading && !resultsUrl && !fetchError) {
        return (<div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50/50 rounded"><div className="text-center p-6"><p className="text-lg font-medium text-muted-foreground">Click "Generate Previews" to start.</p></div></div>);
    }
    if (fetchError && !isLoading && !resultsUrl) {
         return (<div className="p-4 md:p-6"><Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /> <AlertTitle>Preview Error</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert></div>);
    }
    if (isLoading && !resultsUrl) {
        return renderSkeleton();
    }
    if (!resultsUrl && !isLoading && !fetchError) {
         return <div className="p-6 text-center text-muted-foreground">Enter URL and generate preview.</div>;
    }

    return (
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between min-h-[50px]">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="original" disabled={!firstResult}>Original HTML</TabsTrigger>
                <TabsTrigger value="migrated" disabled={!activePreviewData}>Preview Theme</TabsTrigger>
            </TabsList>
            <div className="flex items-center text-sm text-muted-foreground h-5">
                {isLoading && resultsUrl && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Preview...</>}
            </div>
            {fetchError && !isLoading && resultsUrl && (<div className="w-full sm:w-auto text-xs text-red-600 flex items-center gap-1 pt-1 sm:pt-0"><AlertCircle className="h-3 w-3" /> Error loading preview.</div>)}
        </div>

        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {isLoading && !firstResult ? renderSkeleton() :
           !firstResult ? <div className="text-muted-foreground p-4">Original content could not be loaded.</div> : (
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{firstResult.title || 'Original Content'}</h2>
                 {firstResult.author && firstResult.date && (<div className="text-xs text-muted-foreground mb-4">By {firstResult.author} on {new Date(firstResult.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>)}
                 <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: firstResult.originalHtml || "<p>Original content not available.</p>" }}/>
              </>
          )}
        </TabsContent>

        <TabsContent value="migrated" className="p-4 md:p-6 overflow-auto border-t sm:border-t-0 rounded-b-md flex-grow bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="min-h-[300px] relative">
              {isLoading && resultsUrl && !activePreviewData ? renderSkeleton() :
               !activePreviewData ? (<div className="text-center py-10 text-muted-foreground">{fetchError ? `Error loading preview for ${THEMES[activeTheme].name}. Select another theme.` : `Preview for '${THEMES[activeTheme].name}' not loaded. Select its button above.`}</div>) :
               (<ActiveLayout mdxContent={activePreviewData.mdx || ""} />)
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
        <Card id="input-section" className="border-none shadow-none bg-transparent">
          <CardHeader className="pb-4 px-1 pt-0">
          </CardHeader>
          <CardContent className="space-y-4 px-1 pb-2">
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
            <div>
                <Label className="pb-2 block text-sm font-medium">Select Preview Theme</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {themeKeys.map((themeId) => (
                      <Button
                        key={`select-${themeId}`}
                        variant={'outline'}
                        size="default"
                        onClick={() => handleThemeSelectionChange(themeId)}
                        disabled={isLoading || isMigrating}
                        className={cn(
                            "h-10 px-3 justify-center border transition-all duration-150 ease-in-out",
                            themeButtonStyles[themeId],
                            activeTheme === themeId ? 'ring-2 ring-offset-2 ring-blue-600 shadow-md scale-105 font-semibold' : 'font-normal opacity-90 hover:opacity-100'
                        )}
                      >
                         {THEMES[themeId].name}
                      </Button>
                     ))}
                  </div>
            </div>
            <Button onClick={handleInitialPreview} disabled={!url || isLoading || isMigrating} className="w-full px-6" size="lg">
                {isLoading && !resultsUrl ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Initial Preview...</> ) : isLoading && resultsUrl ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading Theme...</> ) : ( resultsUrl ? "Regenerate Previews" : "Generate Previews" )}
            </Button>
             {fetchError && !resultsUrl && !isLoading && (<p className="text-sm text-red-600 pt-2 text-center">{fetchError}</p>)}
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
                    {renderPreviewArea()}
                </div>
            </div>
        </div>

      {/* Migration Card Section */}
      {resultsUrl && (
        <div className="w-full">
            {previewResults[activeTheme] ? (
                <Card>
                    <CardHeader className="pb-2">
                        <h3 className="text-lg font-medium">Migrate & Download</h3>
                        <p className="text-sm text-muted-foreground"> Generates a complete Next.js project for the <span className="font-medium">{THEMES[activeTheme].name}</span> theme. </p>
                    </CardHeader>
                    <CardContent>
                    {migrationError && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Migration Error</AlertTitle> <AlertDescription>{migrationError}</AlertDescription> </Alert> )}
                    <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoading || !previewResults[activeTheme]} className="w-full">
                        {isMigrating ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Migrating & Zipping...</> ) : ( <><Download className="mr-2 h-4 w-4" />Migrate & Download ZIP ({THEMES[activeTheme]?.name} Theme)</> )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center"> Free migration limited to one page per session (per browser, resets hourly). </p>
                    </CardContent>
                </Card>
            ) : (
                 <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted">Select a theme above to load its preview and enable migration for that style.</div>
            )}
        </div>
      )}

        {/* Removed: Info alert previously shown when url is empty */}

    </div>
  );
}