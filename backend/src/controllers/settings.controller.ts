import { Request, Response } from 'express';
import { ClinicSettings } from '../models/ClinicSettings.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

const DEFAULT_BUSINESS_HOURS = [
  { day: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
  { day: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
  { day: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
  { day: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
  { day: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
  { day: 'Saturday', openTime: '09:00', closeTime: '14:00', isClosed: false },
  { day: 'Sunday', openTime: '09:00', closeTime: '12:00', isClosed: true },
];

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  let settings = await ClinicSettings.findOne().populate('homepage.featuredServices', 'name slug').lean();

  if (!settings) {
    await ClinicSettings.create({ businessHours: DEFAULT_BUSINESS_HOURS });
    settings = await ClinicSettings.findOne().lean();
  }

  sendSuccess({ res, data: settings });
});

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  let settings = await ClinicSettings.findOne();

  if (!settings) {
    settings = await ClinicSettings.create({ ...req.body, businessHours: DEFAULT_BUSINESS_HOURS });
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  sendSuccess({ res, message: 'Settings updated successfully', data: settings });
});

export const updateHomepage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await ClinicSettings.findOneAndUpdate(
    {},
    { $set: { homepage: req.body } },
    { new: true, upsert: true }
  );
  sendSuccess({ res, message: 'Homepage settings updated', data: settings?.homepage });
});
