import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { IBillingDocument } from '../models/Billing.model';

interface BillData {
  bill: IBillingDocument & {
    patient?: { patientId?: string; personalInfo?: { name?: string; phone?: string } };
    receivedBy?: { name?: string };
  };
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
}

export const generateInvoicePDF = (data: BillData, res: Response): void => {
  const { bill, clinicName = 'SAI Physiotherapy Spine Care & Paralysis Centre', clinicPhone = '+91 XXXXX XXXXX', clinicAddress = 'Ahmedabad, Gujarat, India' } = data;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="Invoice-${bill.invoiceNumber}.pdf"`);
  doc.pipe(res);

  // ─── Header ──────────────────────────────────────────────────────────────────
  doc.fillColor('#1B4F8A').rect(0, 0, 595, 90).fill();
  doc.fillColor('#FFFFFF')
    .fontSize(22).font('Helvetica-Bold').text(clinicName, 50, 25)
    .fontSize(11).font('Helvetica').text(clinicAddress, 50, 52)
    .text(`Phone: ${clinicPhone}`, 50, 67);

  doc.fillColor('#000000').moveDown(2);

  // ─── Invoice Info ─────────────────────────────────────────────────────────
  const infoY = 110;
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#1B4F8A').text('INVOICE', 50, infoY);
  doc.fontSize(11).font('Helvetica').fillColor('#333')
    .text(`Invoice #: ${bill.invoiceNumber}`, 50, infoY + 30)
    .text(`Date: ${bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN') : 'N/A'}`, 50, infoY + 46)
    .text(`Status: ${bill.paymentStatus.toUpperCase()}`, 50, infoY + 62);

  // Patient info (right side)
  const patient = bill.patient as BillData['bill']['patient'];
  doc.text('BILLED TO:', 350, infoY, { width: 200 })
    .font('Helvetica-Bold').text(patient?.personalInfo?.name || 'N/A', 350, infoY + 16)
    .font('Helvetica')
    .text(`ID: ${patient?.patientId || 'N/A'}`, 350, infoY + 32)
    .text(`Phone: ${patient?.personalInfo?.phone || 'N/A'}`, 350, infoY + 48);

  // ─── Items Table ──────────────────────────────────────────────────────────
  const tableY = infoY + 100;
  doc.fillColor('#1B4F8A').rect(50, tableY, 495, 24).fill();
  doc.fillColor('#FFF').fontSize(10).font('Helvetica-Bold')
    .text('Description', 55, tableY + 7)
    .text('Qty', 300, tableY + 7)
    .text('Unit Price', 350, tableY + 7)
    .text('Total', 460, tableY + 7);

  let rowY = tableY + 30;
  doc.fillColor('#333').font('Helvetica').fontSize(10);
  bill.items.forEach((item, i) => {
    if (i % 2 === 0) doc.fillColor('#f5f7fa').rect(50, rowY - 4, 495, 22).fill();
    doc.fillColor('#333')
      .text(item.description, 55, rowY, { width: 240 })
      .text(String(item.quantity), 300, rowY)
      .text(`Rs. ${item.unitPrice.toLocaleString('en-IN')}`, 350, rowY)
      .text(`Rs. ${item.total.toLocaleString('en-IN')}`, 460, rowY);
    rowY += 25;
  });

  // ─── Totals ───────────────────────────────────────────────────────────────
  rowY += 10;
  doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#E2E8F0').stroke();
  rowY += 10;

  const totals = [
    ['Subtotal', `Rs. ${bill.subtotal.toLocaleString('en-IN')}`],
    [`Discount (${bill.discountType === 'percentage' ? bill.discount + '%' : 'flat'})`, `- Rs. ${bill.discount.toLocaleString('en-IN')}`],
    ['Tax (GST)', `Rs. ${bill.tax.toLocaleString('en-IN')}`],
  ];

  totals.forEach(([label, value]) => {
    doc.text(label, 350, rowY).text(value, 460, rowY); rowY += 18;
  });

  doc.font('Helvetica-Bold').fontSize(13)
    .fillColor('#1B4F8A')
    .text('TOTAL AMOUNT', 350, rowY + 5)
    .text(`Rs. ${bill.totalAmount.toLocaleString('en-IN')}`, 460, rowY + 5);
  rowY += 28;

  doc.fillColor('#10B981').text('Amount Paid', 350, rowY)
    .text(`Rs. ${bill.amountPaid.toLocaleString('en-IN')}`, 460, rowY);
  rowY += 18;

  if (bill.balanceDue > 0) {
    doc.fillColor('#EF4444').text('Balance Due', 350, rowY)
      .text(`Rs. ${bill.balanceDue.toLocaleString('en-IN')}`, 460, rowY);
    rowY += 18;
  }

  // ─── Payment Info ─────────────────────────────────────────────────────────
  rowY += 20;
  doc.fillColor('#333').font('Helvetica').fontSize(10)
    .text(`Payment Method: ${bill.paymentMethod.replace('_', ' ').toUpperCase()}`, 50, rowY)
    .text(`Received By: ${(bill.receivedBy as BillData['bill']['receivedBy'])?.name || 'N/A'}`, 50, rowY + 16);

  // ─── Footer ───────────────────────────────────────────────────────────────
  doc.fillColor('#1B4F8A').rect(0, 760, 595, 82).fill();
  doc.fillColor('#FFF').fontSize(12).font('Helvetica-Bold')
    .text('Thank you for visiting SAI Physiotherapy!', 0, 775, { align: 'center' });
  doc.fontSize(10).font('Helvetica')
    .text('Your health is our priority. We wish you a speedy recovery.', 0, 795, { align: 'center' })
    .text(clinicAddress, 0, 813, { align: 'center' });

  doc.end();
};
