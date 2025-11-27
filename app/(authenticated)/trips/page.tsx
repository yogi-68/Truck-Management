"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trucks(lorry_number), drivers(driver_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function completeTrip(tripId: string) {
    if (!confirm('Mark this trip as completed?')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          trip_status: 'completed',
          ending_time: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip marked as completed",
      });
      fetchTrips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteTrip(tripId: string) {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
      fetchTrips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trip",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trip Management</h1>
        <Button asChild>
          <a href="/trips/create">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </a>
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No trips found</p>
          <Button asChild>
            <a href="/trips/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Trip
            </a>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip: any) => (
            <Card key={trip.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{trip.trip_id}</h3>
                  <p className="text-sm text-gray-600">
                    {trip.from_location} → {trip.to_location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Truck: {trip.trucks?.lorry_number} | Driver: {trip.drivers?.driver_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Distance: {trip.total_distance_km} km | Expense: ₹{trip.total_trip_expense?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trip.trip_status === 'running' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.trip_status}
                  </span>
                  <div className="flex gap-2">
                    {trip.trip_status === 'running' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeTrip(trip.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteTrip(trip.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
