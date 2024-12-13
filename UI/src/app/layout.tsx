// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "LP Lock",
//   description: "Lock your LP tokens",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children}</body>
//     </html>
//   );
// }

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { ContextProvider } from "../context/ContextProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata: Metadata = {
  title: "Lp Lock",
  description: "LP Lock",
  icons: "/images/icon.png",
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#131313",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              borderRadius: "10px",
              background: "#0a4c8f",
              color: "#fff",
              fontFamily: "LilitaOne"
            },
            position: "top-center",
          }}
        />
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
