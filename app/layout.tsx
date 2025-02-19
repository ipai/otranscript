import "./globals.css";
import "./styles/components.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body>{children}</body>
    </html>
  );
}
