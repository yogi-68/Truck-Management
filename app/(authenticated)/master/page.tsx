"use client"

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function TrucksTable() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrucks();
  }, []);

  async function fetchTrucks() {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setTrucks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTruck(id: string) {
    if (!confirm('Are you sure you want to delete this truck?')) return;

    try {
      const { error } = await supabase.from('trucks').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Truck deleted successfully" });
      fetchTrucks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  if (trucks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No trucks found. Add your first truck to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {trucks.map((truck) => (
        <Card key={truck.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold">{truck.lorry_number}</h3>
                <p className="text-sm text-gray-600">{truck.model}</p>
                <p className="text-xs text-gray-500">Capacity: {truck.capacity_kg} kg</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  truck.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {truck.status}
                </span>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteTruck(truck.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DriversTable() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteDriver(id: string) {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Driver deleted successfully" });
      fetchDrivers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  if (drivers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No drivers found. Add your first driver to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {drivers.map((driver) => (
        <Card key={driver.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold">{driver.driver_name}</h3>
                <p className="text-sm text-gray-600">License: {driver.license_number}</p>
                <p className="text-xs text-gray-500">Phone: {driver.phone_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {driver.status}
                </span>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteDriver(driver.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RoutesTable() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRoute(id: string) {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Route deleted successfully" });
      fetchRoutes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No routes found. Add your first route to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {routes.map((route) => (
        <Card key={route.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold">{route.from_location} → {route.to_location}</h3>
                <p className="text-sm text-gray-600">Distance: {route.distance_km} km</p>
                {route.estimated_hours && (
                  <p className="text-xs text-gray-500">Est. Time: {route.estimated_hours} hours</p>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteRoute(route.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">Phone: {user.phone_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MasterDataPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Master Data Management</h1>

      <Tabs defaultValue="trucks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trucks">Trucks</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="trucks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Trucks</h2>
            <Button asChild>
              <a href="/master/trucks/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Truck
              </a>
            </Button>
          </div>
          <TrucksTable />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Drivers</h2>
            <Button asChild>
              <a href="/master/drivers/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Driver
              </a>
            </Button>
          </div>
          <DriversTable />
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Routes</h2>
            <Button asChild>
              <a href="/master/routes/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Route
              </a>
            </Button>
          </div>
          <RoutesTable />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Users</h2>
            <p className="text-sm text-gray-500">Admin and Clerk user accounts</p>
          </div>
          <UsersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
