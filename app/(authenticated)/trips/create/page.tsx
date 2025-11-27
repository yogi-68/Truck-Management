"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTripPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    truck_id: '',
    driver_id: '',
    route_id: '',
    from_location: '',
    to_location: '',
    starting_time: '',
    total_distance_km: '',
    diesel_liters: '0',
    diesel_cost: '0',
    toll_charges: '0',
    other_expenses: '0',
    driver_allowance: '0',
    notes: ''
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  async function fetchMasterData() {
    try {
      const [trucksRes, driversRes, routesRes] = await Promise.all([
        supabase.from('trucks').select('*').eq('status', 'active'),
        supabase.from('drivers').select('*').eq('status', 'active'),
        supabase.from('routes').select('*')
      ]);

      setTrucks(trucksRes.data || []);
      setDrivers(driversRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill location and distance when route is selected
    if (name === 'route_id' && value) {
      const selectedRoute = routes.find(r => r.id === value);
      if (selectedRoute) {
        setFormData(prev => ({
          ...prev,
          from_location: selectedRoute.from_location,
          to_location: selectedRoute.to_location,
          total_distance_km: selectedRoute.distance_km.toString()
        }));
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Generate trip_id (e.g., TRIP-20251128-0001)
      const tripId = `TRIP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
      
      const { error } = await supabase.from('trips').insert([{
        trip_id: tripId,
        truck_id: formData.truck_id,
        driver_id: formData.driver_id,
        route_id: formData.route_id,
        from_location: formData.from_location,
        to_location: formData.to_location,
        starting_time: formData.starting_time,
        total_distance_km: parseFloat(formData.total_distance_km),
        diesel_liters: parseFloat(formData.diesel_liters),
        diesel_cost: parseFloat(formData.diesel_cost),
        toll_charges: parseFloat(formData.toll_charges),
        other_expenses: parseFloat(formData.other_expenses),
        driver_allowance: parseFloat(formData.driver_allowance),
        notes: formData.notes || null,
        trip_status: 'running',
        created_by: userData.user?.id
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Trip created successfully",
      });

      router.push('/trips');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create trip",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/trips">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trips
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Truck *</label>
                <select
                  name="truck_id"
                  value={formData.truck_id}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Truck</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.lorry_number}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Driver *</label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.driver_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Route *</label>
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Route</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.from_location} → {route.to_location} ({route.distance_km} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Location *</label>
                <Input
                  name="from_location"
                  value={formData.from_location}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Location *</label>
                <Input
                  name="to_location"
                  value={formData.to_location}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Starting Time *</label>
                <Input
                  name="starting_time"
                  type="datetime-local"
                  value={formData.starting_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Distance (km) *</label>
                <Input
                  name="total_distance_km"
                  type="number"
                  step="0.01"
                  value={formData.total_distance_km}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Expenses</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diesel (Liters)</label>
                  <Input
                    name="diesel_liters"
                    type="number"
                    step="0.01"
                    value={formData.diesel_liters}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Diesel Cost (₹)</label>
                  <Input
                    name="diesel_cost"
                    type="number"
                    step="0.01"
                    value={formData.diesel_cost}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Toll Charges (₹)</label>
                  <Input
                    name="toll_charges"
                    type="number"
                    step="0.01"
                    value={formData.toll_charges}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Driver Allowance (₹)</label>
                  <Input
                    name="driver_allowance"
                    type="number"
                    step="0.01"
                    value={formData.driver_allowance}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Other Expenses (₹)</label>
                  <Input
                    name="other_expenses"
                    type="number"
                    step="0.01"
                    value={formData.other_expenses}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Trip'}
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
