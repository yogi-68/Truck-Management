"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddDriverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: '',
    license_number: '',
    phone_number: '',
    address: '',
    license_expiry: '',
    date_of_birth: '',
    status: 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('drivers').insert([{
        driver_name: formData.driver_name,
        license_number: formData.license_number,
        phone_number: formData.phone_number,
        address: formData.address || null,
        license_expiry: formData.license_expiry || null,
        date_of_birth: formData.date_of_birth || null,
        status: formData.status
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Driver added successfully",
      });

      router.push('/master?tab=drivers');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add driver",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/master?tab=drivers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Master Data
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver Name *</label>
              <Input
                name="driver_name"
                value={formData.driver_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">License Number *</label>
              <Input
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                placeholder="TN0120230001234"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <Input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+919876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">License Expiry</label>
              <Input
                name="license_expiry"
                type="date"
                value={formData.license_expiry}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Driver'}
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
