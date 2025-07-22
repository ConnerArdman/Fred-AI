import { tool } from 'ai';
import { z } from 'zod';
import { google } from 'googleapis';
import { getGoogleAuth } from '../google';

// Define a Vercel AI SDK tool.
export const googleCalendarViewTool = tool({
  description: "Check a user's schedule between the given date times on their calendar",
  parameters: z.object({
    timeMin: z.string().datetime({ offset: true }).describe('Start time in ISO 8601 format in a valid zod datetime string'),
    timeMax: z.string().datetime({ offset: true }).describe('End time in ISO 8601 format in a valid zod datetime string'),
    timeZone: z.string().optional().describe('Time zone to use for the calendar'),
  }),

  execute: async ({ timeMin, timeMax, timeZone }) => {
    // Get Google OAuth client with access token via Auth0.
    const auth = await getGoogleAuth();
    const calender = google.calendar({ version: 'v3', auth });

    // Get calendar events for given query.
    const response = await calender.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      timeZone,
    });

    return {
      status: 'success',
      startDate: timeMin,
      endDate: timeMax,
      events: response?.data?.items,
    };
  },
});

export const googleCalendarAddEventTool = tool({
    description: "Add an event on the given date time to their calendar",
    parameters: z.object({
      timeStart: z.string().datetime({ offset: true }).describe('Start time in ISO 8601 format in a valid zod datetime string'),
      timeEnd: z.string().datetime({ offset: true }).describe('End time in ISO 8601 format in a valid zod datetime string'),
      timeZone: z.string().optional().describe('Time zone to use for the calendar'),
      summary: z.string().describe('Summary of the event'),
      description: z.string().describe('Description of the event'),
    }),
  
    execute: async ({ timeStart, timeEnd, timeZone, summary, description }) => {
      console.log("MAKING REQUEST: ",timeStart, timeEnd, timeZone, summary, description);

      // Get Google OAuth client with access token via Auth0.
      const auth = await getGoogleAuth();
      const calender = google.calendar({ version: 'v3', auth });
  
      // Get calendar events for given query.
      const response = await calender.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: summary,
          description: description,
          start: {
            dateTime: timeStart,
            timeZone: timeZone,
          },
          end: {
            dateTime: timeEnd,
            timeZone: timeZone,
          },
        },
      });
  
      return {
        status: 'success',
        timeStart: timeStart,
        timeEnd: timeEnd,
        timeZone: timeZone,
        summary: summary,
        description: description,
        event: response?.data,
      };
    },
  });