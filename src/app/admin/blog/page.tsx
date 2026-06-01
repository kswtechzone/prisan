"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/actions"
import type { BlogPost } from "@prisma/client"

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    image: "",
    author: "Admin",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  })

  const load = async () => {
    setLoading(true)
    setPosts(await getBlogPosts())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", slug: "", content: "", excerpt: "", image: "", author: "Admin", metaTitle: "", metaDescription: "", metaKeywords: "" })
    setShowModal(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      image: post.image || "",
      author: post.author,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      metaKeywords: post.metaKeywords || "",
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const data = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      content: form.content,
      excerpt: form.excerpt || undefined,
      image: form.image || undefined,
      author: form.author,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      metaKeywords: form.metaKeywords || undefined,
    }
    if (editing) {
      await updateBlogPost(editing.id, data)
    } else {
      await createBlogPost({ ...data, published: false } as any)
    }
    setShowModal(false)
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return
    await deleteBlogPost(id)
    await load()
  }

  const handleTogglePublish = async (post: BlogPost) => {
    await updateBlogPost(post.id, { published: !post.published })
    await load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">Blog</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-start gap-4">
              {post.image && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 hidden sm:block">
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{post.title}</h3>
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      post.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  /blog/{post.slug} &middot; {new Date(post.createdAt).toLocaleDateString()}
                </p>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-1">{post.excerpt}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => openEdit(post)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-400 py-16">No blog posts yet.</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Post" : "New Post"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value
              setForm((f) => ({
                ...f,
                title,
                slug: editing ? f.slug : slugify(title),
              }))
            }}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <Input
            label="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <Input
            label="Featured Image URL"
            placeholder="/uploads/services/..."
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <Input
            label="Excerpt"
            placeholder="Brief summary for listing pages"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-luxury-charcoal mb-2">
              Content (Markdown / HTML)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[250px] font-mono"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              SEO Meta Tags
            </p>
            <Input
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            />
            <div className="mt-3">
              <Input
                label="Meta Description"
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <Input
                label="Meta Keywords"
                value={form.metaKeywords}
                onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
