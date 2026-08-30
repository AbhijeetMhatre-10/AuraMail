import { EmailActivity, IEmailActivity } from '../models/EmailActivity.js';
import { DemoDataStore, DEMO_USER_ID } from './demoData.service.js';
import { isDbConnected } from '../config/db.js';

export class ActivityService {
  /**
   * Fetches user's email and AI activity log
   */
  static async getActivity(userId: string, limit = 50, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoActivities = DemoDataStore.getActivities();
      return demoActivities.slice(0, limit);
    }

    if (!isDbConnected()) {
      return [];
    }

    const activities = await EmailActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return activities;
  }
}
