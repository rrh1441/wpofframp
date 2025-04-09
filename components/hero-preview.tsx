"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, ExternalLink, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"

const THEMES = [
  {
    id: "clarity",
    name: "Clarity",
    description: "Minimalist design with focus on readability. Perfect for blogs and personal sites.",
  },
  {
    id: "momentum",
    name: "Momentum",
    description: "Bold and dynamic with vibrant accents. Ideal for businesses and startups.",
  },
  {
    id: "serenity",
    name: "Serenity",
    description: "Elegant and calm with soft color palette. Great for portfolios and creative work.",
  },
]

export default function HeroPreview() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("clarity")

  const handlePreview = () => {
    if (!url) return

    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setIsPreviewReady(true)
    }, 1500)
  }

  const handleMigrate = () => {
    setIsAuthOpen(true)
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthOpen(false)
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Preview Window */}
      <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="bg-gray-100 border-b px-4 py-2 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="mx-auto font-medium text-sm text-gray-500">{isPreviewReady ? url : "WordPress Preview"}</div>
        </div>
        <div className="h-[400px] overflow-hidden relative">
          {!isPreviewReady ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center p-6">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  width={400}
                  height={200}
                  alt="WordPress site preview"
                  className="mx-auto mb-4 rounded border"
                />
                <p className="text-muted-foreground">Enter your WordPress URL below to see a live preview</p>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <div className="text-center">
                <h3 className="font-medium">Transforming Your WordPress Content</h3>
                <p className="text-sm text-muted-foreground">This will only take a moment...</p>
              </div>
            </div>
          ) : isComplete ? (
            <div className="p-6 h-full overflow-auto">
              <Alert className="mb-4">
                <AlertTitle>Migration Complete!</AlertTitle>
                <AlertDescription>
                  Your WordPress content has been successfully transformed into a Next.js project with the{" "}
                  {THEMES.find((t) => t.id === selectedTheme)?.name} theme.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-4">
                <Button size="lg">
                  <Download className="mr-2 h-4 w-4" /> Download Project ZIP
                </Button>
                <Button variant="outline" size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" /> Deploy to Vercel
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="original" className="h-full">
              <div className="border-b px-6 py-2">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="original">Original WordPress</TabsTrigger>
                  <TabsTrigger value="migrated">Migrated Next.js</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="original" className="p-6 h-[350px] overflow-auto">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">WordPress Sample Post</h2>
                  <p>
                    This is how your content currently looks on WordPress. Notice the slower loading times and cluttered
                    interface.
                  </p>
                  <Image
                    src="/placeholder.svg?height=150&width=500"
                    width={500}
                    height={150}
                    alt="WordPress content sample"
                    className="rounded-md"
                  />
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit
                    arcu sed erat molestie vehicula.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">WordPress</span>
                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">Slow</span>
                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">Plugins</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="migrated" className="h-[350px] overflow-auto">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Select Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {THEMES.map((theme) => (
                        <Button
                          key={theme.id}
                          variant={selectedTheme === theme.id ? "default" : "outline"}
                          className="h-auto py-1 px-2 justify-start"
                          onClick={() => setSelectedTheme(theme.id)}
                        >
                          {theme.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`rounded-md border p-4 overflow-auto ${
                      selectedTheme === "clarity"
                        ? "bg-white"
                        : selectedTheme === "momentum"
                          ? "bg-gradient-to-r from-white to-blue-50"
                          : "bg-gradient-to-r from-white to-green-50"
                    }`}
                  >
                    <div
                      className={`space-y-4 ${
                        selectedTheme === "clarity"
                          ? "font-sans"
                          : selectedTheme === "momentum"
                            ? "font-sans"
                            : "font-serif"
                      }`}
                    >
                      <h2
                        className={`text-2xl font-bold ${
                          selectedTheme === "clarity"
                            ? "text-gray-900"
                            : selectedTheme === "momentum"
                              ? "text-blue-900"
                              : "text-green-900"
                        }`}
                      >
                        Next.js Transformed Post
                      </h2>
                      <p>
                        Here's how your content will look after migration with the{" "}
                        {THEMES.find((t) => t.id === selectedTheme)?.name} theme.
                      </p>
                      <Image
                        src="/placeholder.svg?height=150&width=500"
                        width={500}
                        height={150}
                        alt="Next.js content sample"
                        className="rounded-md"
                      />
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit
                        arcu sed erat molestie vehicula.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            selectedTheme === "clarity"
                              ? "bg-gray-100 text-gray-800"
                              : selectedTheme === "momentum"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          Next.js
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            selectedTheme === "clarity"
                              ? "bg-gray-100 text-gray-800"
                              : selectedTheme === "momentum"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          Fast
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            selectedTheme === "clarity"
                              ? "bg-gray-100 text-gray-800"
                              : selectedTheme === "momentum"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          Modern
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button size="lg" onClick={handleMigrate} className="w-full">
                    Migrate This Page (Free)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">Try Now: Enter your WordPress URL to see how it'll look</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              id="wordpress-url"
              placeholder="https://your-wordpress-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePreview} disabled={!url || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Preview"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up to Continue</DialogTitle>
            <DialogDescription>Create a free account to migrate your WordPress content to Next.js.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <DialogFooter>
              <Button type="submit">Create Account & Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
