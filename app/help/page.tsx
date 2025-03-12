'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ContentfulArticle {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    slug: string;
    content: string;
    summary: string;
    publishDate: string;
  };
}

const HelpCenter = () => {
  const [articles, setArticles] = useState<ContentfulArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch(
          `https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries?access_token=${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}&content_type=helpArticle`
        );
        const data = await res.json();
        setArticles(data.items as ContentfulArticle[]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching help articles:', error);
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Help Center</h1>
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.sys.id}>
              <Link href={`/help/${article.fields.slug}`}>
                {article.fields.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HelpCenter;
