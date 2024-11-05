import localFont from "next/font/local";
import "./globals.css";
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Physio AI",
  description: "Physio AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="light" accentColor="blue" radius="medium">
          {children}
        </Theme>
      </body>
    </html>
  );
}