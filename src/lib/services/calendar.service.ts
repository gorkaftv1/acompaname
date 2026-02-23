import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addDays,
  subDays,
  isToday,
  isFuture,
  isPast,
  differenceInDays,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/types';

/**
 * CalendarService - Real Calendar Service using date-fns
 * 
 * ✅ This is a REAL service (not mocked) that uses actual date calculations.
 * 
 * Provides calendar utilities and event management using date-fns
 * with Spanish locale support for the AcompañaMe app.
 * 
 * All date operations are real-time and use actual date logic.
 */
export class CalendarService {
  /**
   * Get all days in a specific month
   * 
   * @param date - Any date within the desired month
   * @returns Array of Date objects for each day in the month
   * 
   * @example
   * ```ts
   * const days = CalendarService.getDaysInMonth(new Date(2026, 1, 1));
   * console.log(`February 2026 has ${days.length} days`);
   * ```
   */
  static getDaysInMonth(date: Date): Date[] {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return eachDayOfInterval({ start, end });
  }

  /**
   * Format a date in Spanish
   * 
   * @param date - Date to format
   * @param formatStr - Format string (default: 'PPP' = long date)
   * @returns Formatted date string in Spanish
   * 
   * @example
   * ```ts
   * const formatted = CalendarService.formatDate(new Date(), 'PPP');
   * // Returns: "11 de febrero de 2026"
   * ```
   */
  static formatDate(date: Date, formatStr: string = 'PPP'): string {
    return format(date, formatStr, { locale: es });
  }

  /**
   * Get events for a specific date
   * 
   * @param date - Date to check
   * @param allEvents - Array of all calendar events
   * @returns Array of events that occur on the specified date
   * 
   * @example
   * ```ts
   * const events = CalendarService.getEventsForDate(
   *   new Date(),
   *   allCalendarEvents
   * );
   * console.log(`${events.length} events today`);
   * ```
   */
  static getEventsForDate(
    date: Date,
    allEvents: CalendarEvent[]
  ): CalendarEvent[] {
    return allEvents.filter((event) => isSameDay(event.date, date));
  }

  /**
   * Get upcoming events (next 7 days)
   * 
   * @param allEvents - Array of all calendar events
   * @returns Array of up to 5 upcoming events, sorted by date
   * 
   * @example
   * ```ts
   * const upcoming = CalendarService.getUpcomingEvents(allCalendarEvents);
   * upcoming.forEach(event => {
   *   console.log(`${event.title} - ${event.date}`);
   * });
   * ```
   */
  static getUpcomingEvents(allEvents: CalendarEvent[]): CalendarEvent[] {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return allEvents
      .filter((event) => {
        const eventDate = event.date;
        return (
          (isSameDay(eventDate, today) || isFuture(eventDate)) &&
          eventDate <= nextWeek
        );
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }

  /**
   * Check if a date is today
   * 
   * @param date - Date to check
   * @returns True if date is today
   * 
   * @example
   * ```ts
   * if (CalendarService.isToday(someDate)) {
   *   console.log('This is today!');
   * }
   * ```
   */
  static isToday(date: Date): boolean {
    return isToday(date);
  }

  /**
   * Check if a date is in the past (excluding today)
   * 
   * @param date - Date to check
   * @returns True if date is before today
   * 
   * @example
   * ```ts
   * if (CalendarService.isPast(someDate)) {
   *   console.log('This date has passed');
   * }
   * ```
   */
  static isPast(date: Date): boolean {
    return isPast(date) && !isToday(date);
  }

  /**
   * Get weekday name in Spanish
   * 
   * @param date - Date to get weekday from
   * @returns Weekday name in Spanish (e.g., "lunes", "martes")
   * 
   * @example
   * ```ts
   * const dayName = CalendarService.getWeekDayName(new Date());
   * console.log(`Hoy es ${dayName}`);
   * ```
   */
  static getWeekDayName(date: Date): string {
    return format(date, 'EEEE', { locale: es });
  }

  /**
   * Get relative time description in Spanish
   * 
   * @param date - Date to compare with today
   * @returns Relative time string in Spanish
   * 
   * @example
   * ```ts
   * const relative = CalendarService.getRelativeTime(tomorrow);
   * // Returns: "Mañana"
   * 
   * const relative2 = CalendarService.getRelativeTime(inThreeDays);
   * // Returns: "En 3 días"
   * ```
   */
  static getRelativeTime(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = differenceInDays(targetDate, today);

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Mañana';
    } else if (diffDays === -1) {
      return 'Ayer';
    } else if (diffDays > 1) {
      return `En ${diffDays} días`;
    } else {
      return `Hace ${Math.abs(diffDays)} días`;
    }
  }

  /**
   * Check if a date is in the future
   * 
   * @param date - Date to check
   * @returns True if date is after today
   * 
   * @example
   * ```ts
   * if (CalendarService.isFuture(eventDate)) {
   *   console.log('This event is upcoming');
   * }
   * ```
   */
  static isFuture(date: Date): boolean {
    return isFuture(date);
  }
}
