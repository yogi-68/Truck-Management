"use client"

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, FileText, DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  tripsToday: number;
  gcNotesToday: number;
  revenueToday: number;
  revenueMonth: number;
  expensesMonth: number;
  pendingDeliveries: number;
  topayAmount: number;
  runningTrips: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    tripsToday: 0,
    gcNotesToday: 0,
    revenueToday: 0,
    revenueMonth: 0,
    expensesMonth: 0,
    pendingDeliveries: 0,
    topayAmount: 0,
    runningTrips: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthISO = firstDayOfMonth.toISOString();

      // Execute all queries in parallel for faster loading
      const [
        { count: tripsToday },
        { count: gcNotesToday },
        { data: revenueData },
        { data: revenueMonthData },
        { data: expensesData },
        { count: pendingDeliveries },
        { data: topayData },
        { count: runningTrips }
      ] = await Promise.all([
        // Trips today
        supabase.from('trips').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        
        // GC Notes today
        supabase.from('gc_notes').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        
        // Revenue today
        supabase.from('gc_notes').select('total_amount').gte('created_at', todayISO).eq('payment_status', 'paid'),
        
        // Revenue this month
        supabase.from('gc_notes').select('total_amount').gte('created_at', monthISO).eq('payment_status', 'paid'),
        
        // Expenses this month
        supabase.from('trips').select('total_trip_expense').gte('created_at', monthISO),
        
        // Pending deliveries
        supabase.from('gc_notes').select('*', { count: 'exact', head: true }).eq('delivery_status', 'pending'),
        
        // ToPay amount
        supabase.from('gc_notes').select('total_amount').eq('payment_status', 'topay'),
        
        // Running trips
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('trip_status', 'running')
      ]);

      const revenueToday = revenueData?.reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0) || 0;
      const revenueMonth = revenueMonthData?.reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0) || 0;
      const expensesMonth = expensesData?.reduce((sum: number, item: any) => sum + (item.total_trip_expense || 0), 0) || 0;
      const topayAmount = topayData?.reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0) || 0;

      setStats({
        tripsToday: tripsToday || 0,
        gcNotesToday: gcNotesToday || 0,
        revenueToday,
        revenueMonth,
        expensesMonth,
        pendingDeliveries: pendingDeliveries || 0,
        topayAmount,
        runningTrips: runningTrips || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const netProfit = stats.revenueMonth - stats.expensesMonth;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trips Today</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tripsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.runningTrips} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GC Notes Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gcNotesToday}</div>
            <p className="text-xs text-muted-foreground">
              Consignments created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</div>
            <p className="text-xs text-muted-foreground">
              Payments collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenueMonth)}</div>
            <p className="text-xs text-muted-foreground">
              This month's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expensesMonth)}</div>
            <p className="text-xs text-muted-foreground">
              Total trip expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding ToPay</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.topayAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Pending collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/trips/create" className="block p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">Create New Trip</div>
              <div className="text-sm text-muted-foreground">Start a new trip sheet</div>
            </a>
            <a href="/gc-notes/create" className="block p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">Create GC Note</div>
              <div className="text-sm text-muted-foreground">Add new consignment</div>
            </a>
            <a href="/reports" className="block p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">View Reports</div>
              <div className="text-sm text-muted-foreground">Generate and download reports</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Trips</span>
              <span className="font-semibold">{stats.runningTrips}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Deliveries</span>
              <span className="font-semibold">{stats.pendingDeliveries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Outstanding Amount</span>
              <span className="font-semibold text-orange-600">{formatCurrency(stats.topayAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Profit (Month)</span>
              <span className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
