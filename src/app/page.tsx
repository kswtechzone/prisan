import Link from "next/link"
import Image from "next/image"
import { Scissors, Eye, Heart, Shield, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Scissors,
    title: "Expert Stylists",
    description: "Talented professionals dedicated to your unique style",
  },
  {
    icon: Eye,
    title: "Premium Products",
    description: "Only the finest beauty products for exceptional results",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Tailored treatments designed just for you",
  },
  {
    icon: Shield,
    title: "Hygiene First",
    description: "Sterile tools and sanitized stations for your safety",
  },
]

const testimonials = [
  {
    name: "Sarah M.",
    text: "The best salon experience I've ever had. The attention to detail is incredible.",
    rating: 5,
  },
  {
    name: "Jessica K.",
    text: "I've never felt more pampered. The ambiance and service are world-class.",
    rating: 5,
  },
  {
    name: "Amanda L.",
    text: "My go-to salon for every occasion. Always leave feeling beautiful.",
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-cream via-white to-luxury-champagne" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-luxury-gold/10 via-transparent to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6 animate-fade-in">
            <Image src="/pblogo.png" alt="PB Logo" width={72} height={72} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-luxury-charcoal mb-6 animate-slide-up">
            Where Elegance
            <br />
            <span className="text-luxury-gold">Meets Expertise</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
            Experience luxury beauty treatments crafted to enhance your natural
            radiance. Your journey to timeless beauty begins here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                Book Your Appointment
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine artistry with premium care to deliver an unmatched
              beauty experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-luxury-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-luxury-gold" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from our cherished clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-luxury-gold text-luxury-gold" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="font-semibold text-sm">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-gray-600 mb-8">
            Book your appointment today and discover the Prisan Beauty difference.
          </p>
          <Link href="/booking">
            <Button size="lg">
              Schedule Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
