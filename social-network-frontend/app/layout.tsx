import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google';
import './globals.css'
import { Providers } from './providers';
const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'شبکه اجتماعی',
  description: 'به اشتراک‌گذاری لحظات',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" >
      <body className={vazir.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}