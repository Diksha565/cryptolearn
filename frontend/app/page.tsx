import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Key,
  Zap,
  FileSignature,
  ImageIcon,
  Eye,
  ArrowRight,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const topics = [
  {
    id: "aes",
    title: "AES Encryption",
    description:
      "Learn Advanced Encryption Standard, the most widely used symmetric encryption algorithm.",
    icon: Shield,
    href: "/aes",
    difficulty: "Beginner",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "rsa",
    title: "RSA Algorithm",
    description:
      "Master the RSA public-key cryptosystem for secure data transmission.",
    icon: Key,
    href: "/rsa",
    difficulty: "Intermediate",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "ecc",
    title: "ECC Cryptography",
    description:
      "Explore Elliptic Curve Cryptography for efficient and secure encryption.",
    icon: Zap,
    href: "/ecc",
    difficulty: "Advanced",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "digital-signature",
    title: "Digital Signature",
    description:
      "Understand digital signatures for authentication and non-repudiation.",
    icon: FileSignature,
    href: "/digital-signature",
    difficulty: "Intermediate",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "watermarking",
    title: "Watermarking",
    description:
      "Learn digital watermarking techniques for copyright protection.",
    icon: ImageIcon,
    href: "/watermarking",
    difficulty: "Intermediate",
    color: "from-red-500 to-rose-500",
  },
  {
    id: "steganography",
    title: "Steganography",
    description:
      "Discover the art of hiding information within other non-secret data.",
    icon: Eye,
    href: "/steganography",
    difficulty: "Advanced",
    color: "from-indigo-500 to-purple-500",
  },
];

const stats = [
  { icon: BookOpen, label: "Interactive Lessons", value: "6" },
  { icon: Users, label: "Students Learning", value: "10K+" },
  { icon: Award, label: "Completion Rate", value: "94%" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">CryptoLearn</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="relative px-6 py-24 sm:px-12 lg:px-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Master{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cryptography
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-600 dark:text-gray-300 sm:text-2xl">
              Learn cryptographic algorithms through interactive examples,
              hands-on practice, and comprehensive explanations.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <Link href="#topics">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div id="topics" className="px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Cryptography Topics
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose a topic to start your cryptography journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link key={topic.id} href={topic.href}>
                  <Card className="crypto-card-hover h-full cursor-pointer border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div
                          className={`rounded-lg bg-gradient-to-r ${topic.color} p-3`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge
                          variant={
                            topic.difficulty === "Beginner"
                              ? "default"
                              : topic.difficulty === "Intermediate"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {topic.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {topic.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Start Learning
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              © 2025 CryptoLearn. Built for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
