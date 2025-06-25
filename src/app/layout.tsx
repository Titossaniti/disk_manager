import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import {ReactNode} from "react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: 'Disk Manager',
    manifest: '/site.webmanifest',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png'
    }
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="color-scheme" content="light dark"/>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
                }}
            />
            <title>Disk Manager</title>
        </head>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors closeButton position="top-right"/>
        </ThemeProvider>
        </body>
        </html>
    )
}
