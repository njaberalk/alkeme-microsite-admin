import './globals.css';

export const metadata = {
  title: 'ALKEME Microsite Admin',
  description: 'Visual editor for ALKEME insurance microsites',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-stone text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
