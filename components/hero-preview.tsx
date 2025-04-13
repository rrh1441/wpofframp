// components/hero-preview.tsx
"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, etc.)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { THEMES, ThemeKey } from "@/lib/constants"; // Adjust path if needed
import type { PreviewData } from "@/app/api/preview/route"; // Adjust path if needed

const themeKeys = Object.keys(THEMES) as ThemeKey[];

export default function HeroPreview() {
  const [url, setUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("clarity"); // Default theme
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // --- Fetch Preview Data ---
  const handlePreview = useCallback(async (themeToUse?: ThemeKey) => {
    if (!url) {
        setPreviewError("Please enter a WordPress URL.");
        return;
    }
    let targetUrl = url;
     // Basic check if URL includes protocol, add https:// if not
     if (!/^https?:\/\//i.test(targetUrl)) {
       targetUrl = `https://${targetUrl}`;
       setUrl(targetUrl); // Update state with corrected URL
       console.log(`[Preview] Added https:// protocol to URL: ${targetUrl}`);
     }


    const currentTheme = themeToUse || selectedTheme;
    console.log(`[Preview] Fetching preview for ${targetUrl} with theme ${currentTheme}`);
    setIsLoadingPreview(true);
    setPreviewError(null);
    // Keep existing data while loading new theme for smoother UX? Or clear? Let's clear for now.
    setPreviewData(null);
    setMigrationError(null);

    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: currentTheme }),
      });

      const responseBody = await response.json(); // Read body once

      if (!response.ok) {
        console.error(`[Preview] API Error ${response.status}:`, responseBody);
        throw new Error(responseBody.error || `HTTP error! Status: ${response.status}`);
      }

      console.log("[Preview] API Success. Received preview data.");
      setPreviewData(responseBody as PreviewData); // Type assertion

    } catch (error: any) {
      console.error("[Preview] Fetch failed:", error);
      setPreviewError(`Preview failed: ${error.message || "Unknown error"}`);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [url, selectedTheme]); // Include dependencies

  // --- Handle Theme Change ---
  const handleThemeChange = (newTheme: ThemeKey) => {
    if (newTheme === selectedTheme || isLoadingPreview || isMigrating) return; // Prevent unnecessary calls
    console.log(`[Preview] Theme changed to: ${newTheme}`);
    setSelectedTheme(newTheme);
    // Re-fetch preview for the new theme only if a URL is valid
    if (url) {
      handlePreview(newTheme);
    }
  };

  // --- Trigger Migration & Download ---
  const handleMigrate = async () => {
     let targetUrl = url;
     if (!targetUrl || !selectedTheme) {
       setMigrationError("Cannot migrate without a valid URL and selected theme.");
       return;
     }
     // Ensure URL has protocol for migrate API as well
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
        // No need to setUrl here as preview should have corrected it
      }


    console.log(`[Migrate] Starting migration for ${targetUrl} with theme ${selectedTheme}`);
    setIsMigrating(true);
    setMigrationError(null);
    setPreviewError(null); // Clear preview error if migrating

    try {
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpUrl: targetUrl, theme: selectedTheme }),
      });

      if (!response.ok) {
          // Try to parse error JSON, otherwise use status text
          let errorMsg = `Migration failed! Status: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg; // Use specific error if available
              console.error(`[Migrate] API Error ${response.status}:`, errorData);
          } catch (e) {
              console.error(`[Migrate] API Error ${response.status}, could not parse JSON body.`);
          }
          // Handle specific errors like rate limiting (429)
          if (response.status === 429) {
             errorMsg = "Migration limit reached for this session (1 per hour). Please try again later.";
          }
          throw new Error(errorMsg);
      }

      // Check if the response is a ZIP file
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/zip')) {
          console.error("[Migrate] Error: Response was not a ZIP file. Content-Type:", contentType);
          throw new Error('Migration error: Server did not return a valid ZIP file.');
      }

      // Trigger ZIP download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      // Extract filename from header, provide fallback
      const disposition = response.headers.get('Content-Disposition');
      let filename = `${selectedTheme}_site.zip`; // Default
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename\*?=['"]?([^'";]+)['"]?(?:;|$)/; // Handles filename* too
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = decodeURIComponent(matches[1]); // Decode URI-encoded chars
            }
        }
      link.setAttribute('download', filename);
      console.log(`[Migrate] Triggering download for: ${filename}`);
      document.body.appendChild(link);
      link.click();
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log("[Migrate] Download initiated successfully.");
      // Optionally reset preview state after successful migration/download
      // setPreviewData(null);
      // setUrl(""); // Clear URL after success? Maybe not.

    } catch (error: any) {
      console.error("[Migrate] Migration/Download failed:", error);
      setMigrationError(`${error.message || "Unknown migration error"}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // --- Helper to Render Skeleton ---
  const renderSkeleton = () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <Skeleton className="h-4 w-1/2" /> {/* Meta */}
      <Skeleton className="h-40 w-full" /> {/* Image Placeholder */}
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );

  // --- Helper to Render Preview Area ---
  const renderPreviewArea = () => {
    // Show skeleton only on the very first load before any data/error
    if (isLoadingPreview && !previewData && !previewError) {
      return renderSkeleton();
    }

    // Show error if it exists and we're not actively loading
    if (previewError && !isLoadingPreview) {
        return (
             <Alert variant="destructive" className="m-4">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Preview Error</AlertTitle>
               <AlertDescription>{previewError} Please check the URL and ensure the WordPress REST API is publicly accessible and returns posts.</AlertDescription>
             </Alert>
        );
    }

    // Show initial placeholder if no data, no error, not loading
    if (!previewData && !isLoadingPreview && !previewError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50/50 rounded">
          <div className="text-center p-6">
            <Image
              src="/placeholder.svg" // Use your placeholder
              width={400}
              height={200}
              alt="WordPress site preview placeholder"
              className="mx-auto mb-4 rounded border opacity-50"
              priority
            />
            <p className="text-muted-foreground">
              Enter your WordPress Site URL above to generate a preview.
            </p>
          </div>
        </div>
      );
    }

    // --- Render the actual preview tabs ---
    // Use the existing previewData even while loading a new theme for better UX
    const currentPreviewContent = previewData;

    return (
      <Tabs defaultValue="migrated" className="h-full flex flex-col">
        {/* Tab Triggers & Loading Indicator */}
        <div className="border-b px-4 sm:px-6 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="original" disabled={isLoadingPreview || !currentPreviewContent}>Original HTML</TabsTrigger>
            <TabsTrigger value="migrated" disabled={isLoadingPreview || !currentPreviewContent}>Preview: {THEMES[selectedTheme]?.name}</TabsTrigger>
          </TabsList>
          {isLoadingPreview && (
                <div className="flex items-center text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Theme Preview...
                </div>
            )}
        </div>

        {/* Original HTML Tab Content */}
        <TabsContent value="original" className="p-4 md:p-6 overflow-auto border rounded-b-md flex-grow bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!currentPreviewContent ? renderSkeleton() : (
              <>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">{currentPreviewContent.title || 'Original Content'}</h2>
                {currentPreviewContent.author && currentPreviewContent.date && (
                  <div className="text-xs text-muted-foreground mb-4">
                    By {currentPreviewContent.author} on {new Date(currentPreviewContent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                 {/* WARNING: Rendering raw HTML is risky. Sanitize in production or use an iframe sandbox. */}
                <div
                    className="prose prose-sm sm:prose max-w-none" // Basic prose styling
                    dangerouslySetInnerHTML={{ __html: currentPreviewContent.originalHtml || "<p>Could not load original content.</p>" }}
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
                   variant={selectedTheme === themeId ? "secondary" : "outline"}
                   size="sm"
                   className={`h-auto py-1 px-2 justify-center text-xs sm:text-sm ${selectedTheme === themeId ? 'font-semibold ring-2 ring-primary ring-offset-1' : ''}`}
                   onClick={() => handleThemeChange(themeId)}
                   disabled={isLoadingPreview || isMigrating}
                 >
                   {THEMES[themeId].name}
                 </Button>
               ))}
             </div>
           </div>
           <hr className="my-4"/>
           {!currentPreviewContent ? renderSkeleton() : (
            <div className="prose prose-sm sm:prose max-w-none"> {/* Basic prose styling */}
                {/* Render the MDX using react-markdown */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {/* Remove frontmatter for rendering */}
                  {currentPreviewContent.mdx?.replace(/^---[\s\S]*?---/, '').trim() || "No transformed content loaded or transformation failed."}
                </ReactMarkdown>
                {/* Note: Custom MDX components (like <Callout>) won't render here without extra config for react-markdown */}
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
        {/* Window Header */}
        <div className="bg-muted border-b px-4 py-2 flex items-center text-xs">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div>
          </div>
          <div className="flex-1 text-center font-medium text-muted-foreground truncate px-4">
            {previewData?.title ? `Preview: ${previewData.title}` : "WP Offramp Preview"}
          </div>
           <div className="w-10"> {/* Spacer */}</div>
        </div>
        {/* Preview Content Area */}
        <div className="min-h-[480px] overflow-hidden relative">
          {renderPreviewArea()}
        </div>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">
            1. Enter your WordPress Site URL
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Input
              id="wordpress-url"
              type="url" // Use type="url" for basic browser validation
              placeholder="https://your-wordpress-site.com"
              value={url}
              onChange={(e) => {
                  setUrl(e.target.value);
                  // Clear errors when user types
                  if (previewError) setPreviewError(null);
                  if (migrationError) setMigrationError(null);
                }}
              className="flex-1 text-base sm:text-sm"
              aria-label="WordPress Site URL"
              disabled={isLoadingPreview || isMigrating}
            />
            <Button
                onClick={() => handlePreview()}
                disabled={!url || isLoadingPreview || isMigrating}
                className="w-full sm:w-auto px-6"
            >
              {isLoadingPreview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Generate Preview"
              )}
            </Button>
          </div>
           {/* Display fetch error below input if no preview data yet */}
            {previewError && !previewData && !isLoadingPreview && (
                 <p className="text-sm text-red-600 mt-2">{previewError}</p>
             )}
        </CardContent>
      </Card>

       {/* Migration Card - Only show if preview data exists */}
       {previewData && !previewError && (
            <Card>
                <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">2. Migrate & Download</h3>
                     <p className="text-sm text-muted-foreground">Generates a complete Next.js project for the selected theme.</p>
                </CardHeader>
                <CardContent>
                     {migrationError && (
                         <Alert variant="destructive" className="mb-4">
                         <AlertCircle className="h-4 w-4" />
                         <AlertTitle>Migration Error</AlertTitle>
                         <AlertDescription>{migrationError}</AlertDescription>
                         </Alert>
                     )}
                    <Button size="lg" onClick={handleMigrate} disabled={isMigrating || isLoadingPreview} className="w-full">
                        {isMigrating ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Migrating & Zipping... (this can take 20-30s)
                            </>
                        ) : (
                           <>
                            <Download className="mr-2 h-4 w-4" />
                            Migrate & Download ZIP ({THEMES[selectedTheme]?.name} Theme)
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
        {!url && !isLoadingPreview && !previewData && (
             <Alert className="mt-6 border-l-4 border-blue-500">
                <Info className="h-4 w-4"/>
               <AlertTitle>Enter a URL to Start</AlertTitle>
               <AlertDescription>Input your public WordPress site URL above to generate a preview and enable migration.</AlertDescription>
             </Alert>
        )}

    </div>
  );
}