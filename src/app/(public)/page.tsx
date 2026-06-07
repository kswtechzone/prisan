import Link from "next/link"
import Image from "next/image"
import {
  Scissors,
  Eye,
  Heart,
  Shield,
  ArrowRight,
  Star,
  Sparkles,
  Gift,
  Phone,
  Calendar,
  Instagram,
  Facebook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SpinWheelDemo } from "@/components/spin-wheel-demo"
import { getActiveOffers, getServices } from "@/lib/actions"

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

export default async function HomePage() {
  const services = await getServices()
  const offers = await getActiveOffers()

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <a
          href="tel:+9779747226605"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600"
        >
          <Phone className="w-5 h-5 text-luxury-gold" />
          Call
        </a>
        <Link
          href="/booking"
          className="flex flex-col items-center gap-0.5 text-xs text-gray-600"
        >
          <Calendar className="w-5 h-5 text-luxury-gold" />
          Book Now
        </Link>
        <Link
          href="/spin"
          className="flex flex-col items-center gap-0.5 text-xs text-luxury-gold font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          Spin & Win
        </Link>
      </div>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-cream via-white to-luxury-champagne" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-luxury-gold/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6 animate-fade-in">
            <Image
              src="/prisanbeautylogo.png"
              alt="PB Logo"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
              unoptimized
            />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-luxury-charcoal mb-6 animate-slide-up">
            Where Elegance
            <br />
            <span className="text-luxury-gold">Meets Expertise</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up">
            Prisan Beauty — Kathmandu Valley&apos;s premier destination for
            professional nail art, bridal makeup, hair styling, and luxury
            beauty treatments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in mb-6">
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                Book Your Appointment
              </Button>
            </Link>
            <Link href="/spin">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Spin & Win Rewards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From bridal makeup to nail art — discover premium beauty services
              tailored for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Scissors className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <span className="text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      {service.category}
                    </span>
                    <h3 className="font-display font-semibold text-lg mt-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-semibold text-luxury-charcoal">
                        NPR {service.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {service.duration} min
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              Why Choose Prisan Beauty
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine artistry with premium care to deliver an unmatched
              beauty experience in Kathmandu Valley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-luxury-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-luxury-gold" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Spin & Win CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-luxury-gold/5 via-luxury-champagne to-luxury-gold/5">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-20 h-20 bg-luxury-gold rounded-2xl flex items-center justify-center shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-luxury-charcoal mb-4">
              Spin & Win
              <br />
              <span className="text-luxury-gold">Exclusive Rewards</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8">
              Try your luck and win beauty discounts, free services, bridal
              packages, and more! Every spin is a chance to save.
            </p>

            {offers.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                {offers
                  .filter((o) => o.rewardType !== "none")
                  .slice(0, 4)
                  .map((offer) => (
                    <span
                      key={offer.id}
                      className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-2 text-sm shadow-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: offer.color || "#8B5E3C" }}
                      />
                      {offer.title}
                    </span>
                  ))}
              </div>
            )}

            <Link href="/spin">
              <Button size="lg" className="text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Spin the Wheel
              </Button>
            </Link>
          </div>

          <div className="flex-shrink-0">
            <SpinWheelDemo offers={offers} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from our cherished clients in Kathmandu Valley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-luxury-gold text-luxury-gold"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="font-semibold text-sm">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Offers */}
      {offers.filter((o) => o.rewardType !== "none").length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
                Trending Offers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don&apos;t miss out on these exclusive deals!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers
                .filter((o) => o.rewardType !== "none")
                .slice(0, 6)
                .map((offer) => (
                  <Card
                    key={offer.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor:
                            (offer.color || "#8B5E3C") + "20",
                        }}
                      >
                        <Gift
                          className="w-7 h-7"
                          style={{ color: offer.color || "#8B5E3C" }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{offer.title}</h3>
                        <p className="text-sm text-gray-500">
                          {offer.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/rewards">
                <Button variant="outline" size="lg">
                  View All Rewards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 px-4 bg-luxury-charcoal text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-gray-300 mb-8">
            Book your appointment today and discover the Prisan Beauty
            difference. Kathmandu Valley&apos;s premier beauty destination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button
                size="lg"
                className="bg-luxury-gold text-luxury-charcoal hover:bg-luxury-gold/90 w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Now
              </Button>
            </Link>
            <a
              href="https://wa.me/9779747226605"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
          <div className="flex justify-center gap-6 mt-8">
            <a
              href="https://instagram.com/prisanbeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-luxury-gold transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://facebook.com/prisanbeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-luxury-gold transition-colors"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Spacer for mobile sticky bar */}
      <div className="h-16 md:hidden" />
    </>
  )
}
