/**
 * Analytics service for tracking user interactions and enabling A/B testing
 */

// Types of events that can be tracked
export type AnalyticsEvent = 
  | { type: 'template_view'; templateId: string }
  | { type: 'template_select'; templateId: string }
  | { type: 'template_export'; templateId: string; format: string }
  | { type: 'template_customize'; templateId: string; property: string; value: string }
  | { type: 'resume_create'; templateId: string }
  | { type: 'resume_share'; resumeId: string }
  | { type: 'resume_view'; resumeId: string; source: 'direct' | 'shared' };

// Interface for event tracking
export interface AnalyticsService {
  trackEvent: (event: AnalyticsEvent) => void;
  getTemplateStats: (templateId: string) => Promise<TemplateStats>;
}

// Template statistics type
export interface TemplateStats {
  views: number;
  selections: number;
  exports: number;
  createdResumes: number;
}

/**
 * In-memory implementation for development/testing
 */
class LocalAnalyticsService implements AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private templateStats: Record<string, TemplateStats> = {};

  constructor() {
    // Load any saved stats from localStorage
    try {
      const savedStats = localStorage.getItem('template_stats');
      if (savedStats) {
        this.templateStats = JSON.parse(savedStats);
      }
    } catch (e) {
      console.error('Failed to load template stats:', e);
    }
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEvent): void {
    // Add timestamp
    const eventWithTimestamp = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    // Store event
    this.events.push(event);
    
    // Update template stats if applicable
    if ('templateId' in event) {
      const { templateId } = event;
      
      if (!this.templateStats[templateId]) {
        this.templateStats[templateId] = {
          views: 0,
          selections: 0,
          exports: 0,
          createdResumes: 0
        };
      }
      
      const stats = this.templateStats[templateId];
      
      switch (event.type) {
        case 'template_view':
          stats.views++;
          break;
        case 'template_select':
          stats.selections++;
          break;
        case 'template_export':
          stats.exports++;
          break;
        case 'resume_create':
          stats.createdResumes++;
          break;
      }
      
      // Save updated stats to localStorage
      localStorage.setItem('template_stats', JSON.stringify(this.templateStats));
    }
    
    // Log event (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', eventWithTimestamp);
    }
  }

  /**
   * Get statistics for a specific template
   */
  async getTemplateStats(templateId: string): Promise<TemplateStats> {
    // Return stats for the template or default empty stats
    return this.templateStats[templateId] || {
      views: 0,
      selections: 0,
      exports: 0,
      createdResumes: 0
    };
  }
}

/**
 * Create and export the analytics service
 * 
 * In a production app, this would be replaced with a proper analytics service
 * like Google Analytics, Segment, or a custom backend implementation
 */
export const analytics: AnalyticsService = new LocalAnalyticsService(); 