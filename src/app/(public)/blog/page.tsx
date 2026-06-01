export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPublishedBlogPosts } from "@/lib/actions"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Blog — Prisan Beauty",
  description: "Beauty tips, trends, and insights from Prisan Beauty. Read about hair care, skincare, nails, and salon life in Kathmandu.",
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts()

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Prisan Beauty Blog",
    description: "Beauty tips and insights from Prisan Beauty salon in Kathmandu.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Image
                src="/prisanbeautylogo.png"
                alt="Prisan Beauty"
                width={64}
                height={64}
                className="rounded-2xl"
                unoptimized
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              Our Blog
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Beauty tips, trends, and stories from the Prisan Beauty team.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No posts yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-0">
                      {post.image && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                          <span>&middot;</span>
                          <span>{post.author}</span>
                        </div>
                        <h2 className="font-display font-semibold text-lg mb-2 group-hover:text-luxury-gold transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
