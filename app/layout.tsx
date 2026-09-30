import type { Metadata } from "next";
import "./globals.css";
import "quill/dist/quill.snow.css";
import { Toaster } from "sonner";
  
export const metadata: Metadata = {
  title: "Themiify",
  description:
    "We develop professional themes and custom websites for e-commerce platforms.",
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        dir="rtl"
        className="font-cairo antialiased mx-auto flex flex-col transition-colors duration-300 py-2"
        suppressHydrationWarning
      >
        {/* <ThemeProvider> */} 
          <Toaster position="top-right" expand gap={10} closeButton />
          <div className=" mx-auto w-[96%] ">
            {children}
          </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
