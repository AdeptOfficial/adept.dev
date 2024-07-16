import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    absolute: "",
    default: "Learning Nextjs - AdeptProductions",
    template: "%s - AdeptProductions"
  },
  description: "Locked In",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{
          backgroundColor: "lightblue",
          padding: "1rem"
        }}>
            <p>This is a header</p>
        </header>
        {children}
        <footer className='fixed bottom-0 w-full' style={{
          backgroundColor: "lightgreen",
          padding: "1rem",
        }}>
            <p>This is a footer</p>

        </footer>


      </body>
    </html>
  );
}
