"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Truck, CheckCircle, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function GCNotesPage() {
  const [gcNotes, setGcNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGCNotes();
  }, []);

  async function fetchGCNotes() {
    try {
      const { data, error } = await supabase
        .from('gc_notes')
        .select('*, trips(trip_id, from_location, to_location)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGcNotes(data || []);
    } catch (error) {
      console.error('Error fetching GC notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateDeliveryStatus(gcId: string, status: string) {
    try {
      const { error } = await supabase
        .from('gc_notes')
        .update({ delivery_status: status })
        .eq('id', gcId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Delivery status updated to ${status}`,
      });
      fetchGCNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function updatePaymentStatus(gcId: string, status: string) {
    try {
      const { error } = await supabase
        .from('gc_notes')
        .update({ payment_status: status })
        .eq('id', gcId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment status updated to ${status}`,
      });
      fetchGCNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteGCNote(gcId: string) {
    if (!confirm('Are you sure you want to delete this GC Note? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('gc_notes')
        .delete()
        .eq('id', gcId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "GC Note deleted successfully",
      });
      fetchGCNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete GC Note",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading GC Notes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">GC Notes (Goods Consignment)</h1>
        <Button asChild>
          <a href="/gc-notes/create">
            <Plus className="mr-2 h-4 w-4" />
            New GC Note
          </a>
        </Button>
      </div>

      {gcNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No GC notes found</p>
          <Button asChild>
            <a href="/gc-notes/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First GC Note
            </a>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {gcNotes.map((gc: any) => (
            <Card key={gc.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{gc.gc_number}</h3>
                  <p className="text-sm text-gray-600">
                    From: {gc.consignor_name} → To: {gc.consignee_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Trip: {gc.trips?.trip_id} | Articles: {gc.number_of_articles} | Weight: {gc.weight_kg} kg
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    Amount: ₹{gc.total_amount?.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      gc.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : gc.payment_status === 'topay'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gc.payment_status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      gc.delivery_status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : gc.delivery_status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gc.delivery_status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {gc.delivery_status !== 'delivered' && (
                      <>
                        {gc.delivery_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDeliveryStatus(gc.id, 'in_transit')}
                          >
                            <Truck className="mr-1 h-3 w-3" />
                            In Transit
                          </Button>
                        )}
                        {gc.delivery_status === 'in_transit' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDeliveryStatus(gc.id, 'delivered')}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Delivered
                          </Button>
                        )}
                      </>
                    )}
                    {gc.payment_status !== 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50"
                        onClick={() => updatePaymentStatus(gc.id, 'paid')}
                      >
                        <DollarSign className="mr-1 h-3 w-3" />
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteGCNote(gc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
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
