import type { Metadata } from "next";
import { IM_Fell_DW_Pica, EB_Garamond } from "next/font/google";
import Topbar from "@/components/layout/Topbar";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/data/current-user";
import "./globals.css";

const imFell = IM_Fell_DW_Pica({
  variable: "--font-im-fell",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TALC — Tatinghem Arts Loisirs Culture",
  description:
    "Le site de l'association TALC : actualités, activités, feed communautaire et adhésion.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="fr"
      className={`${imFell.variable} ${ebGaramond.variable} antialiased`}
    >
      <body>
        <Topbar />
        <Nav user={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
