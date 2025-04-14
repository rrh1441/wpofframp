import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Rocket, Sparkles } from "lucide-react"
import ThemePreview from "@/components/theme-preview"
import HeroPreview from "@/components/hero-preview"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Image src="/offramp.svg" width={24} height={24} alt="Offramp logo" />
            <span>WP Offramp</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="#features">Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#themes">Themes</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#how-it-works">How It Works</Link>
              </Button>
              <Button asChild>
                <Link href="#top">Try Now</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section id="top" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            {/* Hero section - Stacked vertically instead of side-by-side */}
            <div className="flex flex-col items-center space-y-12">
              {/* Hero copy - Now on top */}
              <div className="flex flex-col justify-center space-y-6 text-center max-w-3xl mx-auto">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">
                    The Escape Hatch from WordPress
                  </h1>
                  <p className="text-muted-foreground md:text-lg">
                    Break free from bloat, performance bottlenecks, and endless updates.
                    <br className="hidden md:inline" />
                    No plugin chaos. No security holes. Clean, fast, and fully yours.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <a href="#features">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Preview - Now below the hero copy, full width */}
              <div className="w-full">
                <HeroPreview />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Migrate From WordPress?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experience the benefits of modern web development without the technical complexity.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <Card className="h-full">
                <CardHeader>
                  <Rocket className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Lightning-Fast Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Say goodbye to slow page loads. Your migrated site will load in milliseconds, not seconds, improving
                    user experience and SEO rankings.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader>
                  <Sparkles className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Enhanced Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    No more plugin vulnerabilities or constant security updates. Static sites are inherently more secure
                    with fewer attack vectors.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader>
                  <Image src="/offramp.svg" width={40} height={40} alt="Offramp icon" className="mb-2" />
                  <CardTitle>Lower Hosting Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Eliminate expensive WordPress hosting. Deploy to Vercel with generous free tiers and pay only for
                    what you need as you scale.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="themes" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Beautiful Themes For Your Content</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose from our professionally designed themes that make your content shine.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-4">
              <ThemePreview
                name="Modern"
                description="Clean, contemporary design focused on readability. Perfect for blogs and professional sites."
                imageSrc="/themes/modern.png"
              />
              <ThemePreview
                name="Drudge"
                description="Bold newspaper style with emphasis on headlines. Great for news sites and commentary."
                imageSrc="/themes/drudge.png"
              />
              <ThemePreview
                name="Matrix"
                description="Digital, tech-inspired theme with code aesthetics. Ideal for technical blogs."
                imageSrc="/themes/matrix.png"
              />
              <ThemePreview
                name="Ghibli"
                description="Serene, artistic design with soft colors. Perfect for creative portfolios and storytelling."
                imageSrc="/themes/ghibli.png"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Three simple steps to transform your WordPress site
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <CardTitle>Enter Your URL</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p>Paste your WordPress site URL and see an instant preview of how it will look after migration.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    2
                  </div>
                  <CardTitle>Choose a Theme</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p>Select from our beautiful themes to customize the look and feel of your new site.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    3
                  </div>
                  <CardTitle>Deploy Your Site</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p>Download your new Next.js project or deploy directly to Vercel with one click.</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center mt-8">
              <Button size="lg" asChild>
                <a href="#top">Try It Now</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} WP Offramp. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">Terms</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">Privacy</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">Contact</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}