/**
 * 🏠 Home Route
 * Landing page with hero and quick search
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Cloud,
  Droplets,
  Globe,
  Search,
  Thermometer,
  TrendingUp,
  Wind,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Container } from '@/components/layout'
import { CitySearch } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Weather Vibes - Historical Weather Patterns Explorer',
      },
      {
        name: 'description',
        content:
          'Explore historical weather patterns from 1940 to present. Compare climate trends across cities and years with interactive charts and data visualization.',
      },
    ],
  }),
  component: HomeComponent,
})

// 🎯 Feature cards data
const features = [
  {
    icon: Calendar,
    title: 'Historical Archive',
    description:
      'Access weather data from 1940 to present using ERA5 reanalysis data.',
  },
  {
    icon: BarChart3,
    title: 'Interactive Charts',
    description:
      'Visualize temperature, precipitation, and wind patterns with customizable charts.',
  },
  {
    icon: TrendingUp,
    title: 'Year Comparison',
    description:
      'Compare weather patterns across multiple years to spot climate trends.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description:
      'Explore weather data for any location worldwide with city search.',
  },
]

// 🌡️ Sample cities for quick access
const popularCities = [
  { name: 'New York', country: 'US' },
  { name: 'London', country: 'UK' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Paris', country: 'France' },
  { name: 'Singapore', country: 'Singapore' },
]

function HomeComponent() {
  return (
    <div className="flex flex-col">
      {/* 🦸 Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* 🎨 Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-amber-50/30 dark:from-sky-950/20 dark:via-background dark:to-amber-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.1),transparent_50%)]" />

        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* 🏷️ Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5">
                <Cloud className="mr-2 h-4 w-4" />
                Historical Weather Data from 1940
              </Badge>
            </motion.div>

            {/* 📝 Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Explore{' '}
              <span className="bg-gradient-to-r from-sky-500 to-amber-500 bg-clip-text text-transparent">
                Weather Patterns
              </span>{' '}
              Through Time
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover historical weather trends, compare climate data across
              years, and visualize temperature and precipitation patterns for
              any city worldwide.
            </p>

            {/* 🔍 Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto mb-8"
            >
              <CitySearch
                placeholder="Search for a city..."
                size="lg"
                navigateToExplore
                autoFocus
              />
            </motion.div>

            {/* 🔗 Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Link to="/explore">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Explore Data
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Compare Years
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* 📊 Features Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Powerful Weather Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to explore and understand historical weather
              patterns and climate trends.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 🌍 Popular Cities Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Explore Popular Cities</h2>
            <p className="text-muted-foreground">
              Start exploring weather patterns in these popular destinations
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularCities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to="/explore" search={{ q: city.name }}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-amber-400 flex items-center justify-center text-white font-semibold">
                          {city.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {city.country}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 📈 Data Stats Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Thermometer className="h-6 w-6 text-red-500" />
                <span className="text-4xl font-bold">80+</span>
              </div>
              <p className="text-muted-foreground">Years of Data</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplets className="h-6 w-6 text-sky-500" />
                <span className="text-4xl font-bold">15+</span>
              </div>
              <p className="text-muted-foreground">Weather Variables</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wind className="h-6 w-6 text-emerald-500" />
                <span className="text-4xl font-bold">∞</span>
              </div>
              <p className="text-muted-foreground">Locations Worldwide</p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 🚀 CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-sky-500 to-sky-600">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Explore Weather History?
            </h2>
            <p className="text-sky-100 mb-8 max-w-xl mx-auto">
              Start analyzing historical weather patterns and discover climate
              trends for any location in the world.
            </p>
            <Link to="/explore">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-sky-600"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
