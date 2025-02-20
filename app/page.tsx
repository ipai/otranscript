'use client';

import { FileUpload } from './components/FileUpload';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen w-full relative">
      <FileUpload />
      <Footer />
    </div>
  );
}
