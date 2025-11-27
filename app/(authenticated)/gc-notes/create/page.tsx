"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateGCNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    trip_id: '',
    consignor_name: '',
    consignor_address: '',
    consignor_phone: '',
    consignor_gstin: '',
    consignee_name: '',
    consignee_address: '',
    consignee_phone: '',
    consignee_gstin: '',
    number_of_articles: '',
    description_of_goods: '',
    weight_kg: '',
    freight_rate: '',
    freight_amount: '',
    hc_charge: '0',
    sc_charge: '0',
    payment_mode: 'cash',
    delivery_option: 'office',
    remarks: ''
  });

  useEffect(() => {
    fetchRunningTrips();
  }, []);

  async function fetchRunningTrips() {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trucks(lorry_number), drivers(driver_name)')
        .eq('trip_status', 'running')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate freight amount
    if (name === 'freight_rate' || name === 'weight_kg') {
      const rate = name === 'freight_rate' ? parseFloat(value) : parseFloat(formData.freight_rate);
      const weight = name === 'weight_kg' ? parseFloat(value) : parseFloat(formData.weight_kg);
      if (rate && weight) {
        setFormData(prev => ({
          ...prev,
          freight_amount: (rate * weight).toFixed(2)
        }));
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Generate gc_number (e.g., GC-20251128-0001)
      const gcNumber = `GC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
      
      const { error } = await supabase.from('gc_notes').insert([{
        gc_number: gcNumber,
        trip_id: formData.trip_id,
        consignor_name: formData.consignor_name,
        consignor_address: formData.consignor_address,
        consignor_phone: formData.consignor_phone,
        consignor_gstin: formData.consignor_gstin || null,
        consignee_name: formData.consignee_name,
        consignee_address: formData.consignee_address,
        consignee_phone: formData.consignee_phone,
        consignee_gstin: formData.consignee_gstin || null,
        number_of_articles: parseInt(formData.number_of_articles),
        description_of_goods: formData.description_of_goods,
        weight_kg: parseFloat(formData.weight_kg),
        freight_rate: parseFloat(formData.freight_rate),
        freight_amount: parseFloat(formData.freight_amount),
        hc_charge: parseFloat(formData.hc_charge),
        sc_charge: parseFloat(formData.sc_charge),
        payment_mode: formData.payment_mode,
        payment_status: formData.payment_mode === 'topay' ? 'topay' : 'pending',
        delivery_option: formData.delivery_option,
        remarks: formData.remarks || null,
        created_by: userData.user?.id
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "GC Note created successfully",
      });

      router.push('/gc-notes');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create GC note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/gc-notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to GC Notes
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New GC Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Trip *</label>
              <select
                name="trip_id"
                value={formData.trip_id}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Running Trip</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.trip_id} - {trip.trucks?.lorry_number} ({trip.from_location} → {trip.to_location})
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Consignor (Sender) Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    name="consignor_name"
                    value={formData.consignor_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    name="consignor_phone"
                    value={formData.consignor_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Address *</label>
                  <Input
                    name="consignor_address"
                    value={formData.consignor_address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN</label>
                  <Input
                    name="consignor_gstin"
                    value={formData.consignor_gstin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Consignee (Receiver) Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    name="consignee_name"
                    value={formData.consignee_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    name="consignee_phone"
                    value={formData.consignee_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Address *</label>
                  <Input
                    name="consignee_address"
                    value={formData.consignee_address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN</label>
                  <Input
                    name="consignee_gstin"
                    value={formData.consignee_gstin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Goods Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Articles *</label>
                  <Input
                    name="number_of_articles"
                    type="number"
                    value={formData.number_of_articles}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg) *</label>
                  <Input
                    name="weight_kg"
                    type="number"
                    step="0.01"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description of Goods *</label>
                  <Input
                    name="description_of_goods"
                    value={formData.description_of_goods}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Freight Charges</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Freight Rate (₹/kg) *</label>
                  <Input
                    name="freight_rate"
                    type="number"
                    step="0.01"
                    value={formData.freight_rate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Freight Amount (₹) *</label>
                  <Input
                    name="freight_amount"
                    type="number"
                    step="0.01"
                    value={formData.freight_amount}
                    onChange={handleChange}
                    required
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hamali Charge (₹)</label>
                  <Input
                    name="hc_charge"
                    type="number"
                    step="0.01"
                    value={formData.hc_charge}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Charge (₹)</label>
                  <Input
                    name="sc_charge"
                    type="number"
                    step="0.01"
                    value={formData.sc_charge}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment & Delivery</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Mode *</label>
                  <select
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="account">Account</option>
                    <option value="topay">ToPay</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Option *</label>
                  <select
                    name="delivery_option"
                    value={formData.delivery_option}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="office">Office Pickup</option>
                    <option value="door_delivery">Door Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create GC Note'}
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
