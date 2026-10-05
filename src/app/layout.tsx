import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PurpleLabs",
  description: "TODO, notes et budget",
  applicationName: "PurpleLabs",
  appleWebApp: { capable: true, title: "PurpleLabs", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Backdrop />
        {children}
      </body>
    </html>
  );
}

/** Fond noir avec quelques halos discrets (violets très atténués, un neutre) pour faire ressortir l'effet verre. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-700/15 blur-[130px]" />
      <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-white/[0.04] blur-[140px]" />
      <div className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-violet-900/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.035),transparent_60%)]" />
    </div>
  );
}
