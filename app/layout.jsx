import "./globals.css";

export const metadata = {
  title: "AgriSync AI | Sindh Smart Agriculture & Field Intelligence",
  description:
    "AI-powered multilingual agricultural problem-solving platform tailored for Sindh, Pakistan (English, Urdu, Sindhi).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
