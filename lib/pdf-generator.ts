import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { formatCurrency, formatDateTime } from './utils';

export interface GCNoteData {
  gc_number: string;
  date_time: string;
  trip_id: string;
  consignor_name: string;
  consignor_address: string;
  consignor_phone: string;
  consignor_gstin?: string;
  consignee_name: string;
  consignee_address: string;
  consignee_phone: string;
  consignee_gstin?: string;
  number_of_articles: number;
  description_of_goods: string;
  weight_kg: number;
  freight_rate: number;
  freight_amount: number;
  hc_charge: number;
  sc_charge: number;
  total_amount: number;
  payment_mode: string;
  delivery_option: string;
  remarks?: string;
}

export interface TripSheetData {
  trip_id: string;
  lorry_number: string;
  driver_name: string;
  license_number: string;
  phone_number: string;
  from_location: string;
  to_location: string;
  starting_time: string;
  ending_time?: string;
  total_distance_km: number;
  diesel_liters: number;
  diesel_cost: number;
  toll_charges: number;
  other_expenses: number;
  driver_allowance: number;
  total_trip_expense: number;
  total_revenue: number;
  trip_profit_loss: number;
  trip_status: string;
  gc_notes?: Array<{
    gc_number: string;
    consignee_name: string;
    total_amount: number;
  }>;
}

export async function generateGCNotePDF(gcNote: GCNoteData): Promise<void> {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GOODS CONSIGNMENT NOTE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Company Name', 105, 28, { align: 'center' });
  doc.text('Address, City, State - PIN', 105, 33, { align: 'center' });
  doc.text('Phone: +91-XXXXXXXXXX | Email: info@company.com', 105, 38, { align: 'center' });
  
  // GC Number and Date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`GC Number: ${gcNote.gc_number}`, 14, 50);
  doc.text(`Date: ${formatDateTime(gcNote.date_time)}`, 150, 50);
  
  // Generate QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(gcNote.gc_number);
    doc.addImage(qrDataUrl, 'PNG', 175, 55, 25, 25);
  } catch (error) {
    console.error('QR Code generation failed:', error);
  }
  
  // Consignor Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR (Sender)', 14, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${gcNote.consignor_name}`, 14, 68);
  doc.text(`Address: ${gcNote.consignor_address}`, 14, 74);
  doc.text(`Phone: ${gcNote.consignor_phone}`, 14, 80);
  if (gcNote.consignor_gstin) {
    doc.text(`GSTIN: ${gcNote.consignor_gstin}`, 14, 86);
  }
  
  // Consignee Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNEE (Receiver)', 14, 98);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${gcNote.consignee_name}`, 14, 106);
  doc.text(`Address: ${gcNote.consignee_address}`, 14, 112);
  doc.text(`Phone: ${gcNote.consignee_phone}`, 14, 118);
  if (gcNote.consignee_gstin) {
    doc.text(`GSTIN: ${gcNote.consignee_gstin}`, 14, 124);
  }
  
  // Goods Details Table
  autoTable(doc, {
    startY: 135,
    head: [['Description', 'Articles', 'Weight (kg)']],
    body: [
      [gcNote.description_of_goods, gcNote.number_of_articles.toString(), gcNote.weight_kg.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Freight Charges Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Particulars', 'Rate', 'Amount']],
    body: [
      ['Freight Charges', `₹${gcNote.freight_rate}/kg`, formatCurrency(gcNote.freight_amount)],
      ['H.C. Charges', '', formatCurrency(gcNote.hc_charge)],
      ['S.C. Charges', '', formatCurrency(gcNote.sc_charge)],
    ],
    foot: [['', 'Total Amount', formatCurrency(gcNote.total_amount)]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
  });
  
  // Payment and Delivery Info
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Mode: ${gcNote.payment_mode.toUpperCase()}`, 14, finalY);
  doc.text(`Delivery: ${gcNote.delivery_option === 'office' ? 'Office Pickup' : 'Door Delivery'}`, 14, finalY + 6);
  
  if (gcNote.remarks) {
    doc.text('Remarks:', 14, finalY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(gcNote.remarks, 14, finalY + 18);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Terms & Conditions: Goods are at owner\'s risk. Company not liable for loss/damage.', 105, 280, { align: 'center' });
  doc.text('This is a computer-generated document.', 105, 285, { align: 'center' });
  
  // Save PDF
  doc.save(`GC-Note-${gcNote.gc_number}.pdf`);
}

export async function generateTripSheetPDF(trip: TripSheetData): Promise<void> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRIP SHEET', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Company Name', 105, 28, { align: 'center' });
  
  // Trip ID and Status
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Trip ID: ${trip.trip_id}`, 14, 45);
  doc.text(`Status: ${trip.trip_status.toUpperCase()}`, 150, 45);
  
  // Vehicle and Driver Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE & DRIVER DETAILS', 14, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lorry Number: ${trip.lorry_number}`, 14, 63);
  doc.text(`Driver Name: ${trip.driver_name}`, 14, 69);
  doc.text(`License Number: ${trip.license_number}`, 14, 75);
  doc.text(`Phone: ${trip.phone_number}`, 14, 81);
  
  // Route Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ROUTE DETAILS', 14, 93);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`From: ${trip.from_location}`, 14, 101);
  doc.text(`To: ${trip.to_location}`, 14, 107);
  doc.text(`Distance: ${trip.total_distance_km} km`, 14, 113);
  doc.text(`Starting Time: ${formatDateTime(trip.starting_time)}`, 14, 119);
  if (trip.ending_time) {
    doc.text(`Ending Time: ${formatDateTime(trip.ending_time)}`, 14, 125);
  }
  
  // Expenses Table
  autoTable(doc, {
    startY: 135,
    head: [['Expense Type', 'Details', 'Amount']],
    body: [
      ['Diesel', `${trip.diesel_liters} liters`, formatCurrency(trip.diesel_cost)],
      ['Toll Charges', '', formatCurrency(trip.toll_charges)],
      ['Other Expenses', '', formatCurrency(trip.other_expenses)],
      ['Driver Allowance', '', formatCurrency(trip.driver_allowance)],
    ],
    foot: [['', 'Total Expenses', formatCurrency(trip.total_trip_expense)]],
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60] },
    footStyles: { fillColor: [192, 57, 43], fontStyle: 'bold' },
  });
  
  // GC Notes Table (if available)
  if (trip.gc_notes && trip.gc_notes.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['GC Number', 'Consignee', 'Amount']],
      body: trip.gc_notes.map(gc => [
        gc.gc_number,
        gc.consignee_name,
        formatCurrency(gc.total_amount),
      ]),
      foot: [['', 'Total Revenue', formatCurrency(trip.total_revenue)]],
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113] },
      footStyles: { fillColor: [39, 174, 96], fontStyle: 'bold' },
    });
  }
  
  // Profit/Loss Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const profitColor = trip.trip_profit_loss >= 0 ? [46, 204, 113] : [231, 76, 60];
  doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
  doc.text(`Trip ${trip.trip_profit_loss >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(Math.abs(trip.trip_profit_loss))}`, 14, finalY);
  
  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a system-generated trip sheet.', 105, 280, { align: 'center' });
  
  // Save PDF
  doc.save(`Trip-Sheet-${trip.trip_id}.pdf`);
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return '';
  }
}
