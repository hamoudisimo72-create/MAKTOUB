import '../src/index.css';

export const metadata = {
  title: 'MAKTOUB A&A',
  description: 'A luxury wedding invitation landing page built with Next.js',
  icons: {
    icon: '/assets/images/party.png',
    shortcut: '/assets/images/party.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
