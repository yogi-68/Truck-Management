"use client"

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddRoutePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    distance_km: '',
    estimated_hours: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('routes').insert([{
        from_location: formData.from_location,
        to_location: formData.to_location,
        distance_km: parseFloat(formData.distance_km),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Route added successfully",
      });

      router.push('/master?tab=routes');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/master?tab=routes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Master Data
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Route</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Location *</label>
              <Input
                name="from_location"
                value={formData.from_location}
                onChange={handleChange}
                placeholder="Chennai"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Location *</label>
              <Input
                name="to_location"
                value={formData.to_location}
                onChange={handleChange}
                placeholder="Bengaluru"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Distance (km) *</label>
              <Input
                name="distance_km"
                type="number"
                step="0.01"
                value={formData.distance_km}
                onChange={handleChange}
                placeholder="345"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                name="estimated_hours"
                type="number"
                step="0.1"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="6.5"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Route'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
