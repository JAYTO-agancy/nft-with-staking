import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/ui/kit/sonner";
import { Header } from "@/features/header";
import { Footer } from "@/features/footer";
import { getSiteTitle } from "@/shared/lib/seo";

const balooFont = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: getSiteTitle(),
  description: "NFT collection",
  openGraph: {
    images: "img/og_preview.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${balooFont.variable} ${balooFont.className} antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
