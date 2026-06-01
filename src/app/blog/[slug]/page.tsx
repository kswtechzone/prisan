export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarDays, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBlogPost } from "@/lib/actions"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return {}
  return {
    title: post.metaTitle || `${post.title} — Prisan Beauty Blog`,
    description: post.metaDescription || post.excerpt || post.title,
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : undefined,
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post || !post.published) notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    author: { "@type": "Person", name: post.author },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.image || "/prisanbeautylogo.png",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen py-20 px-4">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-luxury-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {post.image && (
            <div className="aspect-[2/1] rounded-2xl overflow-hidden mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {post.author}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-6">
            {post.title}
          </h1>

          <div className="prose prose-gray max-w-none leading-relaxed">
            {post.content.split("\n").map((line, i) => {
              if (!line.trim()) return <br key={i} />
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-xl font-display font-semibold mt-8 mb-3">
                    {line.slice(3)}
                  </h2>
                )
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-lg font-display font-semibold mt-6 mb-2">
                    {line.slice(4)}
                  </h3>
                )
              }
              return (
                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                  {line}
                </p>
              )
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/booking">
              <Button size="lg">Book an Appointment</Button>
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}
