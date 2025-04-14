// components/theme-preview.tsx
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ThemePreviewProps {
  name: string;
  description: string;
  imageSrc: string;
}

export default function ThemePreview({ name, description, imageSrc }: ThemePreviewProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-40 w-full">
        <Image
          src={imageSrc}
          alt={`${name} theme preview`}
          fill
          style={{ objectFit: "cover" }}
          className="transition-all hover:scale-105"
        />
      </div>
      <CardContent className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}