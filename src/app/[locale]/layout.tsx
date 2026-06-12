import { Rubik } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/auth/AuthProvider";
import EnvConfigAlert from "@/components/EnvConfigAlert";
import Footer from "@/components/Footer";
import "../globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "700", "900"],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <body
        className={`${rubik.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <EnvConfigAlert />
          <AuthProvider locale={locale as "en" | "he"}>
            <div className="flex-grow flex flex-col pb-16 md:pb-0">
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
