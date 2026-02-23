import type { Metadata } from "next";
import { InitAuth } from "@/components/InitAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AcompañaMe - Apoyo para Cuidadores",
  description: "Apoyo emocional con IA para personas que cuidan a alguien con enfermedad mental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <InitAuth />
        {children}
      </body>
    </html>
  );
}
