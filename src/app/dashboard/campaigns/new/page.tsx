'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface TargetCountry {
  country: string;
  cpc: number;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    landingPageUrl: '',
    totalBudget: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    niches: [] as string[],
    adTitle: '',
    adDescription: '',
    videoUrl: '',
    imageUrl: '',
    ctaText: 'Learn More',
  });

  const [targeting, setTargeting] = useState<TargetCountry[]>([
    { country: 'US', cpc: 0.05 },
  ]);

  const [newNiche, setNewNiche] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addNiche = () => {
    if (newNiche && !formData.niches.includes(newNiche)) {
      setFormData({ ...formData, niches: [...formData.niches, newNiche] });
      setNewNiche('');
    }
  };

  const removeNiche = (niche: string) => {
    setFormData({ ...formData, niches: formData.niches.filter(n => n !== niche) });
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
          ad: formData.adTitle ? {
            title: formData.adTitle,
            description: formData.adDescription,
            videoUrl: formData.videoUrl || undefined,
            imageUrl: formData.imageUrl || undefined,
            ctaText: formData.ctaText,
          } : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create campaign');
        return;
      }

      router.push('/dashboard/campaigns');
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
          <p className="text-gray-600">Set up your advertising campaign</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Campaign Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Sale Promotion"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your campaign..."
              />
            </div>
            <Input
              label="Landing Page URL"
              name="landingPageUrl"
              type="url"
              value={formData.landingPageUrl}
              onChange={handleChange}
              placeholder="https://your-website.com/landing"
              required
            />
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Budget ($)"
                name="totalBudget"
                type="number"
                step="0.01"
                min="10"
                value={formData.totalBudget}
                onChange={handleChange}
                placeholder="100.00"
                required
              />
              <Input
                label="Daily Budget ($)"
                name="dailyBudget"
                type="number"
                step="0.01"
                min="1"
                value={formData.dailyBudget}
                onChange={handleChange}
                placeholder="10.00"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date (Optional)"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
              <Input
                label="End Date (Optional)"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle>Country Targeting & CPC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {targeting.map((target, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Country code (e.g., US, NG, CM)"
                    value={target.country}
                    onChange={(e) => updateTargeting(index, 'country', e.target.value.toUpperCase())}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="CPC"
                    value={target.cpc}
                    onChange={(e) => updateTargeting(index, 'cpc', parseFloat(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTargeting(index)}
                  disabled={targeting.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTargeting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </Button>
          </CardContent>
        </Card>

        {/* Niches */}
        <Card>
          <CardHeader>
            <CardTitle>Target Niches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.niches.map((niche) => (
                <span
                  key={niche}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {niche}
                  <button type="button" onClick={() => removeNiche(niche)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a niche (e.g., Technology, Health)"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNiche())}
              />
              <Button type="button" variant="outline" onClick={addNiche}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ad Creative */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Creative (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Ad Title"
              name="adTitle"
              value={formData.adTitle}
              onChange={handleChange}
              placeholder="Compelling headline for your ad"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Description
              </label>
              <textarea
                name="adDescription"
                value={formData.adDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Short description of your offer..."
              />
            </div>
            <Input
              label="Video URL (Optional)"
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://example.com/video.mp4"
            />
            <Input
              label="Image URL (Optional)"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/banner.jpg"
            />
            <Input
              label="Call-to-Action Text"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              placeholder="Learn More"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading}>
            Create Campaign
          </Button>
        </div>
      </form>
    </div>
  );
}
