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
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster richColors closeButton />
                </ThemeProvider>
            </body>
        </html>
    )
}
