import Image from "next/image"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface ThemePreviewProps {
  name: string
  description: string
  imageSrc: string
}

export default function ThemePreview({ name, description, imageSrc }: ThemePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={`${name} theme preview`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col space-y-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href="#top">
            <Eye className="mr-2 h-4 w-4" /> Preview This Theme
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
