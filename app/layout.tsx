import { Nunito } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "@/components/shared/providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link data-rh="true" rel="icon" href="/logo.svg" />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <Providers>
          <NextTopLoader color="#996633" height={3} showSpinner={false} />{" "}
          {children}
        </Providers>
      </body>
    </html>
  );
}
