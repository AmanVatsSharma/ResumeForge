import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  X, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  MessageSquare,
  Palette,
  Globe,
  Lock,
  FileText,
  Download,
  Brain,
  Target,
  Clock,
  Award,
  ArrowRight,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Pricing tiers with detailed features
const pricingTiers = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: [
      { name: "2 resume generations", included: true },
      { name: "Basic AI assistance", included: true },
      { name: "3 professional templates", included: true },
      { name: "PDF export", included: true },
      { name: "Community support", included: true },
      { name: "Advanced AI with GPT-4", included: false },
      { name: "All premium templates", included: false },
      { name: "Multiple export formats", included: false },
      { name: "ATS optimization", included: false },
      { name: "Priority support", included: false },
      { name: "Resume analytics", included: false },
      { name: "Team collaboration", included: false },
      { name: "Bulk operations", included: false },
      { name: "White-labeling", included: false },
      { name: "SSO integration", included: false },
      { name: "Advanced analytics", included: false },
      { name: "API access", included: false },
      { name: "Dedicated support", included: false }
    ],
    cta: "Get Started Free",
    popular: false,
    icon: <FileText className="h-8 w-8 text-gray-600" />
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 290 },
    description: "For professionals who want more",
    features: [
      { name: "Unlimited resumes", included: true },
      { name: "Advanced AI with GPT-4", included: true },
      { name: "All premium templates", included: true },
      { name: "Multiple export formats", included: true },
      { name: "ATS optimization", included: true },
      { name: "Priority support", included: true },
      { name: "Resume analytics", included: true },
      { name: "Team collaboration", included: false },
      { name: "Bulk operations", included: false },
      { name: "White-labeling", included: false },
      { name: "SSO integration", included: false },
      { name: "Advanced analytics", included: false },
      { name: "API access", included: false },
      { name: "Dedicated support", included: false }
    ],
    cta: "Start Pro Trial",
    popular: true,
    icon: <Zap className="h-8 w-8 text-purple-600" />
  },
  {
    name: "Enterprise",
    price: { monthly: 99, yearly: 990 },
    description: "For teams and organizations",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Team collaboration", included: true },
      { name: "Bulk operations", included: true },
      { name: "White-labeling", included: true },
      { name: "SSO integration", included: true },
      { name: "Advanced analytics", included: true },
      { name: "API access", included: true },
      { name: "Dedicated support", included: true }
    ],
    cta: "Contact Sales",
    popular: false,
    icon: <Shield className="h-8 w-8 text-blue-600" />
  }
];

// Feature categories for better organization
const featureCategories = [
  {
    name: "AI & Generation",
    icon: <Brain className="h-5 w-5" />,
    features: [
      "2 resume generations",
      "Basic AI assistance", 
      "Advanced AI with GPT-4",
      "Unlimited resumes"
    ]
  },
  {
    name: "Templates & Design",
    icon: <Palette className="h-5 w-5" />,
    features: [
      "3 professional templates",
      "All premium templates",
      "Multiple export formats",
      "PDF export"
    ]
  },
  {
    name: "Optimization & Analytics",
    icon: <Target className="h-5 w-5" />,
    features: [
      "ATS optimization",
      "Resume analytics",
      "Advanced analytics",
      "Performance insights"
    ]
  },
  {
    name: "Collaboration & Team",
    icon: <Users className="h-5 w-5" />,
    features: [
      "Team collaboration",
      "Bulk operations",
      "White-labeling",
      "SSO integration"
    ]
  },
  {
    name: "Support & Integration",
    icon: <MessageSquare className="h-5 w-5" />,
    features: [
      "Community support",
      "Priority support",
      "Dedicated support",
      "API access"
    ]
  }
];

// FAQ data
const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise customers, we can arrange invoicing."
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes! Pro comes with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial period."
  },
  {
    question: "What's included in Enterprise support?",
    answer: "Enterprise customers get dedicated account management, priority support with 2-hour response time, custom integrations, and white-labeling options."
  },
  {
    question: "Can I export my data?",
    answer: "Absolutely. You can export all your resume data in multiple formats including PDF, Word, and JSON. We believe in data portability."
  },
  {
    question: "Do you offer discounts for annual plans?",
    answer: "Yes! Annual plans come with 2 months free, which is a 17% discount compared to monthly billing."
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="relative z-10 border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ResumeAI Pro
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Sparkles className="mr-1 h-3 w-3" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core AI-powered resume creation features.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <Label htmlFor="billing-toggle" className="text-lg">Monthly</Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className="text-lg">
                Yearly
                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Save 17%
                </Badge>
              </Label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${tier.popular ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      {tier.icon}
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${isYearly ? tier.price.yearly : tier.price.monthly}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{tier.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                          <span className={`${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${tier.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/auth">{tier.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {featureCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-4">
                      {category.icon}
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 dark:text-gray-400">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of professionals who've landed their dream jobs with ResumeAI Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth">
                  <Star className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ResumeAI Pro</span>
              </div>
              <p className="text-gray-400">
                The future of resume creation is here. AI-powered, enterprise-ready, and designed for success.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
                <li><Link href="/generator" className="hover:text-white">AI Generator</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ResumeAI Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}