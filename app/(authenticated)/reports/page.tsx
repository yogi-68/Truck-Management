"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function generateDailyRevenueReport(format: 'pdf' | 'excel') {
    setLoading('daily');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch revenue data
      const { data: gcNotes, error: gcError } = await supabase
        .from('gc_notes')
        .select('*, trips(trip_id, trucks(lorry_number))')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (gcError) throw gcError;

      // Fetch expense data
      const { data: trips, error: tripError } = await supabase
        .from('trips')
        .select('*, trucks(lorry_number)')
        .gte('created_at', today.toISOString());

      if (tripError) throw tripError;

      const totalRevenue = gcNotes?.reduce((sum, note) => sum + (note.total_amount || 0), 0) || 0;
      const totalExpenses = trips?.reduce((sum, trip) => sum + (trip.total_trip_expense || 0), 0) || 0;
      const profit = totalRevenue - totalExpenses;

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Daily Revenue Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${today.toLocaleDateString('en-IN')}`, 14, 28);

        // Summary section
        doc.setFontSize(12);
        doc.text('Summary:', 14, 38);
        doc.setFontSize(10);
        doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`, 20, 45);
        doc.text(`Total Expenses: Rs. ${totalExpenses.toFixed(2)}`, 20, 52);
        doc.text(`Net Profit: Rs. ${profit.toFixed(2)}`, 20, 59);

        // GC Notes table
        const gcData = gcNotes?.map(note => [
          note.gc_number,
          note.trips?.trucks?.lorry_number || 'N/A',
          note.consignee_name,
          `Rs. ${(note.total_amount || 0).toFixed(2)}`,
          note.payment_status
        ]) || [];

        autoTable(doc, {
          head: [['GC Number', 'Truck', 'Consignee', 'Amount', 'Status']],
          body: gcData,
          startY: 68,
          theme: 'grid'
        });

        doc.save(`daily-revenue-${today.toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Daily Revenue Report'],
          [`Date: ${today.toLocaleDateString('en-IN')}`],
          [],
          ['Summary'],
          ['Total Revenue', totalRevenue],
          ['Total Expenses', totalExpenses],
          ['Net Profit', profit],
          [],
          ['GC Number', 'Truck', 'Consignee', 'Amount', 'Status'],
          ...(gcNotes?.map(note => [
            note.gc_number,
            note.trips?.trucks?.lorry_number || 'N/A',
            note.consignee_name,
            note.total_amount || 0,
            note.payment_status
          ]) || [])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Revenue');
        XLSX.writeFile(wb, `daily-revenue-${today.toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `Daily revenue report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function generateTripSummaryReport(format: 'pdf' | 'excel') {
    setLoading('trip');
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*, trucks(lorry_number), drivers(driver_name), routes(from_location, to_location)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Trip Summary Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);

        const tripData = trips?.map(trip => [
          trip.trip_id,
          trip.trucks?.lorry_number || 'N/A',
          trip.drivers?.driver_name || 'N/A',
          `${trip.routes?.from_location || ''} to ${trip.routes?.to_location || ''}`,
          `Rs. ${(trip.total_trip_expense || 0).toFixed(2)}`,
          trip.trip_status
        ]) || [];

        autoTable(doc, {
          head: [['Trip ID', 'Truck', 'Driver', 'Route', 'Expenses', 'Status']],
          body: tripData,
          startY: 35,
          theme: 'grid',
          styles: { fontSize: 8 }
        });

        doc.save(`trip-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Trip Summary Report'],
          [`Generated: ${new Date().toLocaleString('en-IN')}`],
          [],
          ['Trip ID', 'Truck', 'Driver', 'From', 'To', 'Expenses', 'Status'],
          ...(trips?.map(trip => [
            trip.trip_id,
            trip.trucks?.lorry_number || 'N/A',
            trip.drivers?.driver_name || 'N/A',
            trip.routes?.from_location || '',
            trip.routes?.to_location || '',
            trip.total_trip_expense || 0,
            trip.trip_status
          ]) || [])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Trip Summary');
        XLSX.writeFile(wb, `trip-summary-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `Trip summary report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function generateTopayReport(format: 'pdf' | 'excel') {
    setLoading('topay');
    try {
      const { data: gcNotes, error } = await supabase
        .from('gc_notes')
        .select('*, trips(trip_id, trucks(lorry_number))')
        .eq('payment_status', 'topay')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalTopay = gcNotes?.reduce((sum, note) => sum + (note.total_amount || 0), 0) || 0;

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Outstanding ToPay Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
        doc.text(`Total Outstanding: Rs. ${totalTopay.toFixed(2)}`, 14, 35);

        const topayData = gcNotes?.map(note => [
          note.gc_number,
          note.consignee_name,
          note.consignee_phone,
          `Rs. ${(note.total_amount || 0).toFixed(2)}`,
          new Date(note.created_at).toLocaleDateString('en-IN')
        ]) || [];

        autoTable(doc, {
          head: [['GC Number', 'Consignee', 'Phone', 'Amount', 'Date']],
          body: topayData,
          startY: 42,
          theme: 'grid'
        });

        doc.save(`topay-outstanding-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Outstanding ToPay Report'],
          [`Generated: ${new Date().toLocaleString('en-IN')}`],
          [`Total Outstanding: ${totalTopay}`],
          [],
          ['GC Number', 'Consignee', 'Phone', 'Amount', 'Date'],
          ...(gcNotes?.map(note => [
            note.gc_number,
            note.consignee_name,
            note.consignee_phone,
            note.total_amount || 0,
            new Date(note.created_at).toLocaleDateString('en-IN')
          ]) || [])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ToPay Outstanding');
        XLSX.writeFile(wb, `topay-outstanding-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `ToPay outstanding report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function generateDriverPerformanceReport(format: 'pdf' | 'excel') {
    setLoading('driver');
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*, drivers(driver_name), gc_notes(total_amount)')
        .order('driver_id');

      if (error) throw error;

      // Group by driver
      const driverStats = trips?.reduce((acc: any, trip) => {
        const driverName = trip.drivers?.driver_name || 'Unknown';
        if (!acc[driverName]) {
          acc[driverName] = { trips: 0, expenses: 0, revenue: 0 };
        }
        acc[driverName].trips += 1;
        acc[driverName].expenses += trip.total_trip_expense || 0;
        acc[driverName].revenue += trip.gc_notes?.reduce((sum: number, gc: any) => sum + (gc.total_amount || 0), 0) || 0;
        return acc;
      }, {});

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Driver Performance Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);

        const driverData = Object.entries(driverStats || {}).map(([name, stats]: [string, any]) => [
          name,
          stats.trips,
          `Rs. ${stats.expenses.toFixed(2)}`,
          `Rs. ${stats.revenue.toFixed(2)}`,
          `Rs. ${(stats.revenue - stats.expenses).toFixed(2)}`
        ]);

        autoTable(doc, {
          head: [['Driver', 'Trips', 'Expenses', 'Revenue', 'Net']],
          body: driverData,
          startY: 35,
          theme: 'grid'
        });

        doc.save(`driver-performance-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Driver Performance Report'],
          [`Generated: ${new Date().toLocaleString('en-IN')}`],
          [],
          ['Driver', 'Trips', 'Expenses', 'Revenue', 'Net Profit'],
          ...Object.entries(driverStats || {}).map(([name, stats]: [string, any]) => [
            name,
            stats.trips,
            stats.expenses,
            stats.revenue,
            stats.revenue - stats.expenses
          ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Driver Performance');
        XLSX.writeFile(wb, `driver-performance-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `Driver performance report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function generateTruckUtilizationReport(format: 'pdf' | 'excel') {
    setLoading('truck');
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*, trucks(lorry_number), gc_notes(total_amount)')
        .order('truck_id');

      if (error) throw error;

      // Group by truck
      const truckStats = trips?.reduce((acc: any, trip) => {
        const truckNumber = trip.trucks?.lorry_number || 'Unknown';
        if (!acc[truckNumber]) {
          acc[truckNumber] = { trips: 0, expenses: 0, revenue: 0 };
        }
        acc[truckNumber].trips += 1;
        acc[truckNumber].expenses += trip.total_trip_expense || 0;
        acc[truckNumber].revenue += trip.gc_notes?.reduce((sum: number, gc: any) => sum + (gc.total_amount || 0), 0) || 0;
        return acc;
      }, {});

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Truck Utilization Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);

        const truckData = Object.entries(truckStats || {}).map(([number, stats]: [string, any]) => [
          number,
          stats.trips,
          `Rs. ${stats.expenses.toFixed(2)}`,
          `Rs. ${stats.revenue.toFixed(2)}`,
          `Rs. ${(stats.revenue - stats.expenses).toFixed(2)}`
        ]);

        autoTable(doc, {
          head: [['Truck', 'Trips', 'Expenses', 'Revenue', 'Net']],
          body: truckData,
          startY: 35,
          theme: 'grid'
        });

        doc.save(`truck-utilization-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Truck Utilization Report'],
          [`Generated: ${new Date().toLocaleString('en-IN')}`],
          [],
          ['Truck', 'Trips', 'Expenses', 'Revenue', 'Net Profit'],
          ...Object.entries(truckStats || {}).map(([number, stats]: [string, any]) => [
            number,
            stats.trips,
            stats.expenses,
            stats.revenue,
            stats.revenue - stats.expenses
          ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Truck Utilization');
        XLSX.writeFile(wb, `truck-utilization-${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `Truck utilization report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function generateMonthlySummaryReport(format: 'pdf' | 'excel') {
    setLoading('monthly');
    try {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      // Fetch monthly data
      const { data: gcNotes, error: gcError } = await supabase
        .from('gc_notes')
        .select('*')
        .gte('created_at', firstDayOfMonth.toISOString());

      const { data: trips, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .gte('created_at', firstDayOfMonth.toISOString());

      if (gcError || tripError) throw gcError || tripError;

      const totalRevenue = gcNotes?.reduce((sum, note) => sum + (note.total_amount || 0), 0) || 0;
      const totalExpenses = trips?.reduce((sum, trip) => sum + (trip.total_trip_expense || 0), 0) || 0;
      const paidAmount = gcNotes?.filter(n => n.payment_status === 'paid').reduce((sum, note) => sum + (note.total_amount || 0), 0) || 0;
      const topayAmount = gcNotes?.filter(n => n.payment_status === 'topay').reduce((sum, note) => sum + (note.total_amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;

      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Monthly Summary Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Month: ${firstDayOfMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`, 14, 28);

        doc.setFontSize(12);
        doc.text('Financial Summary:', 14, 40);
        doc.setFontSize(10);
        doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`, 20, 48);
        doc.text(`Total Expenses: Rs. ${totalExpenses.toFixed(2)}`, 20, 55);
        doc.text(`Net Profit: Rs. ${netProfit.toFixed(2)}`, 20, 62);
        doc.text(`Paid Amount: Rs. ${paidAmount.toFixed(2)}`, 20, 69);
        doc.text(`Outstanding ToPay: Rs. ${topayAmount.toFixed(2)}`, 20, 76);

        doc.setFontSize(12);
        doc.text('Operations:', 14, 88);
        doc.setFontSize(10);
        doc.text(`Total Trips: ${trips?.length || 0}`, 20, 96);
        doc.text(`Total GC Notes: ${gcNotes?.length || 0}`, 20, 103);
        doc.text(`Running Trips: ${trips?.filter(t => t.trip_status === 'running').length || 0}`, 20, 110);
        doc.text(`Completed Trips: ${trips?.filter(t => t.trip_status === 'completed').length || 0}`, 20, 117);

        doc.save(`monthly-summary-${firstDayOfMonth.toISOString().split('T')[0]}.pdf`);
      } else {
        const wsData = [
          ['Monthly Summary Report'],
          [`Month: ${firstDayOfMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`],
          [],
          ['Financial Summary'],
          ['Total Revenue', totalRevenue],
          ['Total Expenses', totalExpenses],
          ['Net Profit', netProfit],
          ['Paid Amount', paidAmount],
          ['Outstanding ToPay', topayAmount],
          [],
          ['Operations Summary'],
          ['Total Trips', trips?.length || 0],
          ['Total GC Notes', gcNotes?.length || 0],
          ['Running Trips', trips?.filter(t => t.trip_status === 'running').length || 0],
          ['Completed Trips', trips?.filter(t => t.trip_status === 'completed').length || 0]
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Monthly Summary');
        XLSX.writeFile(wb, `monthly-summary-${firstDayOfMonth.toISOString().split('T')[0]}.xlsx`);
      }

      toast({
        title: "Report Generated",
        description: `Monthly summary report downloaded successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Daily Revenue Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View daily revenue, expenses, and profit/loss
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateDailyRevenueReport('pdf')}
                disabled={loading === 'daily'}
              >
                {loading === 'daily' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateDailyRevenueReport('excel')}
                disabled={loading === 'daily'}
              >
                {loading === 'daily' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Trip Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Complete trip details with expenses
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTripSummaryReport('pdf')}
                disabled={loading === 'trip'}
              >
                {loading === 'trip' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTripSummaryReport('excel')}
                disabled={loading === 'trip'}
              >
                {loading === 'trip' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Outstanding ToPay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              List of all pending ToPay payments
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTopayReport('pdf')}
                disabled={loading === 'topay'}
              >
                {loading === 'topay' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTopayReport('excel')}
                disabled={loading === 'topay'}
              >
                {loading === 'topay' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Driver Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Driver-wise trip and revenue analysis
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateDriverPerformanceReport('pdf')}
                disabled={loading === 'driver'}
              >
                {loading === 'driver' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateDriverPerformanceReport('excel')}
                disabled={loading === 'driver'}
              >
                {loading === 'driver' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Truck Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Truck usage and revenue analysis
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTruckUtilizationReport('pdf')}
                disabled={loading === 'truck'}
              >
                {loading === 'truck' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateTruckUtilizationReport('excel')}
                disabled={loading === 'truck'}
              >
                {loading === 'truck' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Complete monthly financial summary
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateMonthlySummaryReport('pdf')}
                disabled={loading === 'monthly'}
              >
                {loading === 'monthly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateMonthlySummaryReport('excel')}
                disabled={loading === 'monthly'}
              >
                {loading === 'monthly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
