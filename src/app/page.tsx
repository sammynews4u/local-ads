import Link from 'next/link';
import { Megaphone, Users, DollarSign, Shield, BarChart3, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Megaphone className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold">Local Ad Network</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Connect Advertisers with
          <span className="text-blue-400 block mt-2">High-Quality Publishers</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          A powerful digital advertising network with CPC and lead tracking. 
          Run targeted campaigns, earn from quality traffic, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register?role=advertiser"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            Start as Advertiser <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/register?role=publisher"
            className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
          >
            Join as Publisher <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-blue-400">80%</p>
            <p className="text-gray-400 mt-2">Publisher Revenue Share</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-400">50+</p>
            <p className="text-gray-400 mt-2">Countries Supported</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-400">Real-time</p>
            <p className="text-gray-400 mt-2">Click Tracking</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-400">AI</p>
            <p className="text-gray-400 mt-2">Fraud Detection</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-800/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to run successful advertising campaigns or monetize your traffic
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <Globe className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Country-Based CPC</h3>
              <p className="text-gray-400">
                Set different CPC rates for each country. Target your campaigns precisely where they matter most.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <Shield className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Fraud Protection</h3>
              <p className="text-gray-400">
                Advanced fraud detection catches bots, repeated clicks, and suspicious traffic in real-time.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-400">
                Track clicks, conversions, and earnings in real-time with comprehensive dashboards.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <Users className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lead Tracking</h3>
              <p className="text-gray-400">
                Track leads from click to conversion with our easy-to-install tracking pixel.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <DollarSign className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Easy Payments</h3>
              <p className="text-gray-400">
                Secure wallet system with easy deposits and withdrawals. Multiple payment methods supported.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <Megaphone className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Video Ads Support</h3>
              <p className="text-gray-400">
                Upload video ads and reach your audience with engaging multimedia content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                For Advertisers
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Create campaigns targeting specific countries and niches</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Upload video ads or use banner images</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Set total and daily budgets to control spending</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Track conversions with easy pixel installation</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Detailed analytics with ROI metrics</p>
                </div>
              </div>
              <Link
                href="/register?role=advertiser"
                className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Advertising <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Campaign Reach</span>
                  <span className="text-white font-medium">50+ Countries</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Min. CPC</span>
                  <span className="text-white font-medium">$0.01</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Min. Budget</span>
                  <span className="text-white font-medium">$10</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Ad Types</span>
                  <span className="text-white font-medium">Video, Image, Banner</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Conversion Tracking</span>
                  <span className="text-green-400 font-medium">✓ Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Publishers */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gray-900 rounded-xl p-8 border border-gray-700">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Revenue Share</span>
                  <span className="text-green-400 font-bold text-xl">80%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Min. Payout</span>
                  <span className="text-white font-medium">$10</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Payment Methods</span>
                  <span className="text-white font-medium">PayPal, Bank, Crypto</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Payment Frequency</span>
                  <span className="text-white font-medium">Weekly</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Real-time Stats</span>
                  <span className="text-green-400 font-medium">✓ Yes</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                For Publishers
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Earn 80% of every click you generate</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Browse and select campaigns matching your niche</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Generate tracking links in seconds</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Bonus earnings on conversions</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">Fast and reliable payouts</p>
                </div>
              </div>
              <Link
                href="/register?role=publisher"
                className="mt-8 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Earning <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of advertisers and publishers already growing with Local Ad Network
          </p>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Megaphone className="h-6 w-6 text-blue-400" />
              <span className="font-bold">Local Ad Network</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Local Ad Network. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
