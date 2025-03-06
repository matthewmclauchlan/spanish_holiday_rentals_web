'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import client from '../../lib/contentful';
import type { HelpArticle } from '../../lib/types';
import renderRichText from '../../lib/renderRichText';

export default function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await client.getEntries({
          content_type: 'helpArticle',
          'fields.slug': slug,
          limit: 1,
        });
        if (response.items && response.items.length > 0) {
          setArticle(response.items[0] as unknown as HelpArticle);
        } else {
          setError("No article found for the given slug.");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("An error occurred while fetching the article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p>Loading article...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Log article fields for debugging.
  console.log("Article fields:", article?.fields);

  const { title, content } = article!.fields;

  return (
    <div className="min-h-screen bg-white relative">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2">
          <Image src="/assets/icons/cross.png" alt="Back" width={24} height={24} />
        </button>

        <h1 className="text-3xl font-bold mb-4">{title || "Untitled Article"}</h1>
        <div className="prose max-w-none">
          {content ? renderRichText(content) : <p>No content available.</p>}
        </div>
      </div>
    </div>
  );
}
