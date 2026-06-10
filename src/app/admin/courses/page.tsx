export const dynamic = "force-dynamic"

import { GraduationCap, Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCourses } from "@/lib/actions"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { CourseForm } from "./course-form"
import { DeleteCourseButton } from "./delete-button"
import { EnrollmentsModal } from "./enrollments-modal"

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Training Courses
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage professional beauty training courses.</p>
        </div>
        <CourseForm />
      </div>

      <div className="grid gap-4">
        {courses.map((course) => {
          const isFullyBooked = course.capacity > 0 && (course._count?.bookings ?? 0) >= course.capacity
          return (
            <Card key={course.id} className={!course.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      {course.category && (
                        <Badge className="bg-luxury-gold/10 text-luxury-gold capitalize text-xs shrink-0">
                          {course.category}
                        </Badge>
                      )}
                      {!course.isActive && (
                        <Badge className="bg-gray-100 text-gray-500 text-xs shrink-0">
                          Inactive
                        </Badge>
                      )}
                      {isFullyBooked && (
                        <Badge className="bg-red-100 text-red-600 text-xs shrink-0">
                          Full
                        </Badge>
                      )}
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{course.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      )}
                      {course.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(course.startDate), "MMM d")}
                          {course.endDate && ` — ${format(new Date(course.endDate), "MMM d, yyyy")}`}
                        </span>
                      )}
                      {course.capacity > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course._count?.bookings ?? 0}/{course.capacity} enrolled
                        </span>
                      )}
                      <span className="text-luxury-gold font-medium">
                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EnrollmentsModal
                      courseId={course.id}
                      courseTitle={course.title}
                      enrollmentCount={course._count?.bookings ?? 0}
                    />
                    <CourseForm course={course} />
                    <DeleteCourseButton id={course.id} title={course.title} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {courses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-400">
              No courses yet. Create your first training course.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
