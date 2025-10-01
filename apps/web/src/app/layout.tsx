import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MediaStreamProvider } from '@/lib/MediaStreamContext';

export const metadata: Metadata = {
  title: 'Gemini Robotics Live',
  description: 'Real-time spatial reasoning with Gemini ER and Live API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <MediaStreamProvider>
            {children}
          </MediaStreamProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}