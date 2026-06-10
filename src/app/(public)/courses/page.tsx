import { auth } from "@/lib/auth"
import { getActiveCourses } from "@/lib/actions"
import { CourseBookingForm } from "./course-booking-form"
import { GraduationCap, Calendar, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Training Courses | Prisan Beauty",
  description: "Enroll in professional beauty and makeup training courses at Prisan Beauty in Kathmandu.",
}

export default async function CoursesPage() {
  const session = await auth()
  const courses = await getActiveCourses()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-luxury-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-luxury-gold" />
          </div>
          <h1 className="text-4xl font-display font-bold text-luxury-charcoal mb-4">
            Training Courses
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Advance your skills with professional beauty and makeup training courses.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No training courses available at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const isFullyBooked = course.capacity > 0 && course.bookingCount >= course.capacity
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {course.image && (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-display font-semibold text-luxury-charcoal">{course.title}</h3>
                      {course.category && (
                        <span className="text-xs text-luxury-gold font-medium uppercase tracking-wide">{course.category}</span>
                      )}
                    </div>
                    {course.description && <p className="text-sm text-gray-600">{course.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                      )}
                      {course.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(course.startDate), "MMM d")}{course.endDate ? ` — ${format(new Date(course.endDate), "MMM d, yyyy")}` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {course.price > 0 ? (
                        <span className="text-lg font-bold text-luxury-gold">{formatPrice(course.price)}</span>
                      ) : (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      )}
                      {course.capacity > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          {course.capacity - course.bookingCount} spots left
                        </span>
                      )}
                    </div>
                    {session?.user ? (
                      <CourseBookingForm
                        courseId={course.id}
                        customerName={session.user.name || ""}
                        customerEmail={session.user.email || ""}
                        disabled={isFullyBooked}
                      />
                    ) : (
                      <a
                        href="/login"
                        className="block w-full text-center py-2.5 rounded-xl bg-luxury-gold text-white font-medium text-sm hover:bg-luxury-gold/90 transition-colors"
                      >
                        Sign in to Enroll
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
