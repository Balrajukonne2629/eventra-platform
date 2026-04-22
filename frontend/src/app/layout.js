import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eventra | Manage Events Seamlessly",
  description: "Create and manage events effortlessly with Eventra.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
