import NotificationManager from "@/components/Layout/NotificationManager";
import LucidChat from "@/components/Chat/LucidChat"; // Global Chat
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space",
    subsets: ["latin"],
});

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Lucid Aura∞ v6.6.16",
    icons: {
        icon: "/favicon.ico",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </head>
            <body
                className={`${spaceGrotesk.variable} ${manrope.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans`}
                suppressHydrationWarning
            >
                <NotificationManager />
                {children}
                <Script src="https://www.googletagmanager.com/gtag/js?id=G-376YYK5WW5" strategy="afterInteractive" />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-376YYK5WW5');
                    `}
                </Script>
                {/* GLOBAL CHATBOT */}
                <LucidChat />
            </body>
        </html>
    );
}
