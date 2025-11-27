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

export default function AddTruckPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lorry_number: '',
    model: '',
    capacity_kg: '',
    registration_date: '',
    insurance_expiry: '',
    fitness_expiry: '',
    status: 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('trucks').insert([{
        lorry_number: formData.lorry_number,
        model: formData.model || null,
        capacity_kg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
        registration_date: formData.registration_date || null,
        insurance_expiry: formData.insurance_expiry || null,
        fitness_expiry: formData.fitness_expiry || null,
        status: formData.status
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Truck added successfully",
      });

      router.push('/master?tab=trucks');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add truck",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/master?tab=trucks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Master Data
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Truck</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lorry Number *</label>
              <Input
                name="lorry_number"
                value={formData.lorry_number}
                onChange={handleChange}
                placeholder="TN01AB1234"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Tata LPT 1616"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity (kg)</label>
              <Input
                name="capacity_kg"
                type="number"
                value={formData.capacity_kg}
                onChange={handleChange}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Date</label>
              <Input
                name="registration_date"
                type="date"
                value={formData.registration_date}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Insurance Expiry</label>
              <Input
                name="insurance_expiry"
                type="date"
                value={formData.insurance_expiry}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fitness Expiry</label>
              <Input
                name="fitness_expiry"
                type="date"
                value={formData.fitness_expiry}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Truck'}
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
