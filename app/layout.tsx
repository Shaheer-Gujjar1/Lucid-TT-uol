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
    title: {
        default: "UOL Timetable | Lucid Aura - University of Lahore Hub",
        template: "%s | Lucid Aura"
    },
    description: "The ultimate UOL Timetable utility for University of Lahore students. Access dynamic timetables, intelligent exam planning, seating plans, and academic analytics with a privacy-focused interface.",
    keywords: [
        "UOL Timetable",
        "University of Lahore Timetable",
        "UOL Student Portal",
        "Lucid Aura",
        "Lucid Aura UOL",
        "UOL Exam Seating Plan",
        "UOL GPA Calculator",
        "University of Lahore App",
        "UOL Academic Suite",
        "Student Timetable App",
        "UOL Events",
        "Timetable UOL"
    ],
    authors: [{ name: "Shaheer Ahmed" }],
    creator: "Shaheer Ahmed",
    publisher: "Lucid Dynamics",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://luciduol.netlify.app"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "UOL Timetable & Academic Suite | Lucid Aura",
        description: "The ultimate student companion for UOL. Timetables, exams, and GPA tracking with a magical, privacy-focused interface.",
        url: "https://luciduol.netlify.app",
        siteName: "Lucid Aura",
        images: [
            {
                url: "/logo-primary.png",
                width: 800,
                height: 600,
                alt: "Lucid Aura Logo - UOL Timetable App",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Lucid Aura | UOL Timetable & Academic Utility",
        description: "Intelligent university timetable & academic tools for University of Lahore students.",
        images: ["/logo-primary.png"],
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/logo-primary.png",
    },
    verification: {
        google: "googleb52533f87b53fe9c", // Already has html file, but good to have here
        other: {
            "msvalidate.01": ["BING_VERIFICATION_CODE_HERE"], // User should replace this
        },
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
        <html lang="en" suppressHydrationWarning>
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

                        // PWA Context Injection
                        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
                        if (isPWA) {
                            gtag('set', { 'app_context': 'pwa' });
                        }

                        gtag('config', 'G-376YYK5WW5');
                    `}
                </Script>
                {/* JSON-LD Structured Data */}
                <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Lucid Aura",
                        "alternateName": "Lucid Aura UOL",
                        "description": "The premier academic utility for University of Lahore students, providing dynamic timetables and exam schedules.",
                        "url": "https://luciduol.netlify.app",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "Web",
                        "author": {
                            "@type": "Person",
                            "name": "Shaheer Ahmed"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "PKR"
                        }
                    })}
                </Script>
                {/* GLOBAL CHATBOT */}
                <LucidChat />
            </body>
        </html>
    );
}
