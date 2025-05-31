"use client";

import dynamic from 'next/dynamic';

const IdeaDetailClient = dynamic(
  () => import('./idea-detail-client').then(mod => ({ default: mod.IdeaDetailClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
);

export default function IdeaDetailPage() {
  return <IdeaDetailClient />;
}