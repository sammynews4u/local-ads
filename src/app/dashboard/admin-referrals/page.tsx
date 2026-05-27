'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { Settings, Save, Users, Gift } from 'lucide-react';

interface Level {
  id?: string; level: number; commissionPercent: string; label: string; active: boolean;
}

const DEFAULT_LEVELS: Level[] = [
  { level: 1, commissionPercent: '10.00', label: 'Direct Referral', active: true },
  { level: 2, commissionPercent: '5.00', label: 'Level 2', active: true },
  { level: 3, commissionPercent: '3.00', label: 'Level 3', active: true },
  { level: 4, commissionPercent: '2.00', label: 'Level 4', active: true },
  { level: 5, commissionPercent: '1.50', label: 'Level 5', active: true },
  { level: 6, commissionPercent: '1.00', label: 'Level 6', active: true },
  { level: 7, commissionPercent: '0.75', label: 'Level 7', active: true },
  { level: 8, commissionPercent: '0.50', label: 'Level 8', active: true },
  { level: 9, commissionPercent: '0.25', label: 'Level 9', active: true },
  { level: 10, commissionPercent: '0.10', label: 'Level 10', active: true },
];

export default function AdminReferralsPage() {
  const [levels, setLevels] = useState<Level[]>(DEFAULT_LEVELS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/referral-levels')
      .then(r => r.json())
      .then(d => {
        if (d.levels && d.levels.length > 0) {
          // Merge with defaults for any missing levels
          const merged = DEFAULT_LEVELS.map(def => {
            const existing = d.levels.find((l: Level) => l.level === def.level);
            return existing || def;
          });
          setLevels(merged);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateLevel = (index: number, field: string, value: string | boolean) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    setLevels(updated);
  };

  const saveAll = async () => {
    setSaving(true); setSaved(false);
    try {
      for (const level of levels) {
        await fetch('/api/admin/referral-levels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: level.level,
            commissionPercent: parseFloat(level.commissionPercent),
            label: level.label,
            active: level.active,
          }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const totalCommission = levels.filter(l => l.active).reduce((s, l) => s + parseFloat(l.commissionPercent), 0);

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Program Settings</h1>
          <p className="text-gray-600">Configure commission rates for each referral level</p>
        </div>
        <Button onClick={saveAll} loading={saving}>
          {saved ? <><Save className="h-4 w-4 mr-2" /> Saved!</> : <><Save className="h-4 w-4 mr-2" /> Save All</>}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Levels</p>
                <p className="text-3xl font-bold">{levels.filter(l => l.active).length} / 10</p>
              </div>
              <Settings className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commission Pool</p>
                <p className="text-3xl font-bold text-purple-600">{totalCommission.toFixed(2)}%</p>
              </div>
              <Gift className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Depth</p>
                <p className="text-3xl font-bold">10 Levels</p>
              </div>
              <Users className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 px-2">
              <div className="col-span-1">Level</div>
              <div className="col-span-3">Label</div>
              <div className="col-span-3">Commission %</div>
              <div className="col-span-3">Visual</div>
              <div className="col-span-2">Active</div>
            </div>
            {levels.map((level, i) => (
              <div key={level.level} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg ${level.active ? 'bg-white border' : 'bg-gray-50 border border-dashed opacity-60'}`}>
                <div className="col-span-1">
                  <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">{level.level}</span>
                </div>
                <div className="col-span-3">
                  <input
                    value={level.label} onChange={e => updateLevel(i, 'label', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number" step="0.01" min="0" max="100"
                      value={level.commissionPercent} onChange={e => updateLevel(i, 'commissionPercent', e.target.value)}
                      className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(parseFloat(level.commissionPercent) * 5, 100)}%` }} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={level.active} onChange={e => updateLevel(i, 'active', e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">💡 How Referral Commissions Work</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• When User B (referred by User A) earns $1.00 from a click, User A gets Level 1 commission</li>
              <li>• When User C (referred by User B, who was referred by User A) earns, User A gets Level 2 commission and User B gets Level 1</li>
              <li>• This continues up to 10 levels deep</li>
              <li>• Total commission pool is currently <strong>{totalCommission.toFixed(2)}%</strong> of publisher earnings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
