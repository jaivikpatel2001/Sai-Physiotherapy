import { Patient } from '../models/Patient.model';
import { Appointment } from '../models/Appointment.model';
import { Billing } from '../models/Billing.model';
import { padNumber, generatePatientIdPrefix, generateAppointmentIdPrefix, generateInvoicePrefix } from '@sai-physio/utils';

/**
 * Generates a unique Patient ID: SAI-2024-0001
 */
export const generatePatientId = async (): Promise<string> => {
  const prefix = generatePatientIdPrefix();
  const lastPatient = await Patient.findOne(
    { patientId: { $regex: `^${prefix}` } },
    { patientId: 1 },
    { sort: { patientId: -1 } }
  );

  let nextNum = 1;
  if (lastPatient?.patientId) {
    const parts = lastPatient.patientId.split('-');
    nextNum = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${padNumber(nextNum, 4)}`;
};

/**
 * Generates a unique Appointment ID: APT-2024-00001
 */
export const generateAppointmentId = async (): Promise<string> => {
  const prefix = generateAppointmentIdPrefix();
  const lastAppt = await Appointment.findOne(
    { appointmentId: { $regex: `^${prefix}` } },
    { appointmentId: 1 },
    { sort: { appointmentId: -1 } }
  );

  let nextNum = 1;
  if (lastAppt?.appointmentId) {
    const parts = lastAppt.appointmentId.split('-');
    nextNum = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${padNumber(nextNum, 5)}`;
};

/**
 * Generates a unique Invoice Number: INV-2024-00001
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  const prefix = generateInvoicePrefix();
  const lastBill = await Billing.findOne(
    { invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
  );

  let nextNum = 1;
  if (lastBill?.invoiceNumber) {
    const parts = lastBill.invoiceNumber.split('-');
    nextNum = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${padNumber(nextNum, 5)}`;
};
