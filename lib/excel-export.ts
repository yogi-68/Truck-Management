import * as XLSX from 'xlsx';
import { formatCurrency, formatDateTime } from './utils';

export interface ExportGCNote {
  gc_number: string;
  date_time: string;
  consignor_name: string;
  consignee_name: string;
  description_of_goods: string;
  weight_kg: number;
  total_amount: number;
  payment_mode: string;
  payment_status: string;
  delivery_status: string;
}

export interface ExportTrip {
  trip_id: string;
  lorry_number: string;
  driver_name: string;
  from_location: string;
  to_location: string;
  starting_time: string;
  ending_time?: string;
  total_distance_km: number;
  total_trip_expense: number;
  total_revenue: number;
  trip_profit_loss: number;
  trip_status: string;
}

export function exportGCNotesToExcel(gcNotes: ExportGCNote[], filename: string = 'GC-Notes-Export') {
  // Prepare data for Excel
  const excelData = gcNotes.map(note => ({
    'GC Number': note.gc_number,
    'Date & Time': formatDateTime(note.date_time),
    'Consignor': note.consignor_name,
    'Consignee': note.consignee_name,
    'Description': note.description_of_goods,
    'Weight (kg)': note.weight_kg,
    'Amount': note.total_amount,
    'Payment Mode': note.payment_mode.toUpperCase(),
    'Payment Status': note.payment_status.toUpperCase(),
    'Delivery Status': note.delivery_status.toUpperCase(),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // GC Number
    { wch: 18 }, // Date & Time
    { wch: 25 }, // Consignor
    { wch: 25 }, // Consignee
    { wch: 30 }, // Description
    { wch: 12 }, // Weight
    { wch: 12 }, // Amount
    { wch: 12 }, // Payment Mode
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Delivery Status
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'GC Notes');

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportTripsToExcel(trips: ExportTrip[], filename: string = 'Trips-Export') {
  // Prepare data for Excel
  const excelData = trips.map(trip => ({
    'Trip ID': trip.trip_id,
    'Lorry Number': trip.lorry_number,
    'Driver': trip.driver_name,
    'From': trip.from_location,
    'To': trip.to_location,
    'Start Time': formatDateTime(trip.starting_time),
    'End Time': trip.ending_time ? formatDateTime(trip.ending_time) : 'In Progress',
    'Distance (km)': trip.total_distance_km,
    'Expenses': trip.total_trip_expense,
    'Revenue': trip.total_revenue,
    'Profit/Loss': trip.trip_profit_loss,
    'Status': trip.trip_status.toUpperCase(),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Trip ID
    { wch: 15 }, // Lorry Number
    { wch: 20 }, // Driver
    { wch: 15 }, // From
    { wch: 15 }, // To
    { wch: 18 }, // Start Time
    { wch: 18 }, // End Time
    { wch: 12 }, // Distance
    { wch: 12 }, // Expenses
    { wch: 12 }, // Revenue
    { wch: 12 }, // Profit/Loss
    { wch: 12 }, // Status
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Trips');

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportRevenueReportToExcel(
  data: Array<{
    date: string;
    trips: number;
    gc_notes: number;
    revenue: number;
    expenses: number;
    profit: number;
  }>,
  filename: string = 'Revenue-Report'
) {
  // Prepare data for Excel
  const excelData = data.map(row => ({
    'Date': row.date,
    'Trips': row.trips,
    'GC Notes': row.gc_notes,
    'Revenue': row.revenue,
    'Expenses': row.expenses,
    'Profit/Loss': row.profit,
  }));

  // Calculate totals
  const totals = {
    'Date': 'TOTAL',
    'Trips': data.reduce((sum, row) => sum + row.trips, 0),
    'GC Notes': data.reduce((sum, row) => sum + row.gc_notes, 0),
    'Revenue': data.reduce((sum, row) => sum + row.revenue, 0),
    'Expenses': data.reduce((sum, row) => sum + row.expenses, 0),
    'Profit/Loss': data.reduce((sum, row) => sum + row.profit, 0),
  };

  excelData.push(totals);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Date
    { wch: 10 }, // Trips
    { wch: 12 }, // GC Notes
    { wch: 15 }, // Revenue
    { wch: 15 }, // Expenses
    { wch: 15 }, // Profit/Loss
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Revenue Report');

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
