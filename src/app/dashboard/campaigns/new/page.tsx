'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { ArrowLeft, Plus, X, ImageIcon, Video, Target, DollarSign, Globe, Megaphone } from 'lucide-react';
import Link from 'next/link';

interface TargetCountry {
  country: string;
  cpc: number;
}

const NICHE_OPTIONS = [
  'Technology', 'Business', 'Finance', 'Health', 'Lifestyle',
  'Entertainment', 'Sports', 'Education', 'News', 'Travel',
  'Food', 'Fashion', 'Crypto', 'Gaming', 'Music',
  'Real Estate', 'Marketing', 'Automotive', 'Fitness', 'SaaS',
];

export default function NewCampaignPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    landingPageUrl: '',
    totalBudget: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    niches: [] as string[],
    // Ad creative
    adTitle: '',
    adDescription: '',
    videoUrl: '',
    imageUrl: '',
    ctaText: 'Learn More',
  });

  const [targeting, setTargeting] = useState<TargetCountry[]>([
    { country: 'US', cpc: 0.05 },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleNiche = (niche: string) => {
    if (formData.niches.includes(niche)) {
      setFormData({ ...formData, niches: formData.niches.filter(n => n !== niche) });
    } else {
      setFormData({ ...formData, niches: [...formData.niches, niche] });
    }
  };

  const addTargeting = () => {
    setTargeting([...targeting, { country: '', cpc: 0.05 }]);
  };

  const updateTargeting = (index: number, field: keyof TargetCountry, value: string | number) => {
    const updated = [...targeting];
    updated[index] = { ...updated[index], [field]: value };
    setTargeting(updated);
  };

  const removeTargeting = (index: number) => {
    setTargeting(targeting.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.title) return 'Campaign title is required';
    if (!formData.landingPageUrl) return 'Landing page URL is required';
    if (!formData.totalBudget || parseFloat(formData.totalBudget) < 10) return 'Total budget must be at least $10';
    if (!formData.dailyBudget || parseFloat(formData.dailyBudget) < 1) return 'Daily budget must be at least $1';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          landingPageUrl: formData.landingPageUrl,
          totalBudget: parseFloat(formData.totalBudget),
          dailyBudget: parseFloat(formData.dailyBudget),
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          niches: formData.niches,
          targeting: targeting.filter(t => t.country),
          ad: {
            title: formData.adTitle || formData.title,
            description: formData.adDescription || formData.description,
            videoUrl: formData.videoUrl || undefined,
            imageUrl: formData.imageUrl || undefined,
            ctaText: formData.ctaText,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create campaign');
        return;
      }

      window.location.href = '/dashboard/campaigns';
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600">
            {step === 1 ? 'Step 1: Campaign Details & Budget' : 'Step 2: Ad Creative & Media'}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
          <span className="text-sm font-medium hidden sm:block">Details & Budget</span>
        </div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
          <span className="text-sm font-medium hidden sm:block">Ad Creative</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ========== STEP 1: Campaign Details ========== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Campaign Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Summer Sale Promotion"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3} placeholder="Describe your campaign and what you're promoting..."
                />
              </div>
              <Input
                label="Landing Page URL *"
                name="landingPageUrl" type="url"
                value={formData.landingPageUrl} onChange={handleChange}
                placeholder="https://your-website.com/landing"
                helperText="Where users go after clicking your ad"
                required
              />
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Total Budget ($) *" name="totalBudget" type="number" step="0.01" min="10"
                  value={formData.totalBudget} onChange={handleChange} placeholder="100.00" required />
                <Input label="Daily Budget ($) *" name="dailyBudget" type="number" step="0.01" min="1"
                  value={formData.dailyBudget} onChange={handleChange} placeholder="10.00" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                <Input label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Country Targeting & CPC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targeting.map((target, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input placeholder="Country code (US, NG, CM...)"
                      value={target.country}
                      onChange={(e) => updateTargeting(index, 'country', e.target.value.toUpperCase())} />
                  </div>
                  <div className="w-32">
                    <Input type="number" step="0.01" min="0.01" placeholder="CPC ($)"
                      value={target.cpc}
                      onChange={(e) => updateTargeting(index, 'cpc', parseFloat(e.target.value))} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTargeting(index)}
                    disabled={targeting.length === 1}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTargeting}>
                <Plus className="h-4 w-4 mr-2" /> Add Country
              </Button>
            </CardContent>
          </Card>

          {/* Niches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-600" />
                Target Niches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">Select niches your campaign is relevant to</p>
              <div className="flex flex-wrap gap-2">
                {NICHE_OPTIONS.map((niche) => (
                  <button key={niche} type="button" onClick={() => toggleNiche(niche)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      formData.niches.includes(niche)
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {formData.niches.includes(niche) ? '✓ ' : '+ '}{niche}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/campaigns"><Button variant="outline">Cancel</Button></Link>
            <Button type="button" onClick={handleNext}>Continue to Ad Creative →</Button>
          </div>
        </div>
      )}

      {/* ========== STEP 2: Ad Creative ========== */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ad Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                Ad Copy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Ad Headline *"
                name="adTitle" value={formData.adTitle} onChange={handleChange}
                placeholder="Grab attention with a compelling headline"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Description</label>
                <textarea
                  name="adDescription" value={formData.adDescription} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3} placeholder="Describe your offer. What makes it special?"
                />
              </div>
              <Input
                label="Call-to-Action Button Text"
                name="ctaText" value={formData.ctaText} onChange={handleChange}
                placeholder="Learn More"
              />
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-600" />
                Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                label="Upload Banner Image"
                accept="image"
                value={formData.imageUrl}
                onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                onRemove={() => setFormData({ ...formData, imageUrl: '' })}
                helperText="Recommended: 1200x628px for best display. JPG, PNG, GIF, or WEBP."
              />

              {/* OR enter URL */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">or enter image URL</span>
                </div>
              </div>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/your-banner.jpg"
              />
            </CardContent>
          </Card>

          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-red-600" />
                Video Ad (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                label="Upload Video Ad"
                accept="video"
                value={formData.videoUrl}
                onUpload={(url) => setFormData({ ...formData, videoUrl: url })}
                onRemove={() => setFormData({ ...formData, videoUrl: '' })}
                helperText="MP4 or WEBM format. Max 50MB. Recommended length: 15-60 seconds."
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">or enter video URL</span>
                </div>
              </div>
              <Input
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://example.com/your-video.mp4"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {(formData.imageUrl || formData.adTitle) && (
            <Card>
              <CardHeader>
                <CardTitle>📱 Ad Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm mx-auto border rounded-xl overflow-hidden shadow-md bg-white">
                  {formData.imageUrl && (
                    <div className="aspect-video bg-gray-100">
                      <img src={formData.imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {formData.videoUrl && !formData.imageUrl && (
                    <div className="aspect-video bg-black">
                      <video src={formData.videoUrl} className="w-full h-full object-cover" controls muted />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{formData.adTitle || formData.title || 'Your Ad Headline'}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {formData.adDescription || formData.description || 'Your ad description will appear here'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">
                        {formData.landingPageUrl ? new URL(formData.landingPageUrl).hostname : 'yoursite.com'}
                      </span>
                      <span className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium">
                        {formData.ctaText || 'Learn More'}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-2 text-right">
                    <span className="text-[10px] text-gray-400">Sponsored</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
              ← Back to Details
            </Button>
            <Button type="submit" size="lg" loading={loading}>
              🚀 Create Campaign
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
