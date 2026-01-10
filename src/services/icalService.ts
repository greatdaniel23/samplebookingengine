/**
 * 🔄 Automatic iCal Integration Service
 * 
 * Provides comprehensive iCal synchronization with external platforms
 * including Airbnb, Booking.com, and VRBO with automatic conflict detection
 * and real-time calendar updates.
 */

export interface ExternalBlock {
  id?: number;
  source: 'airbnb' | 'booking' | 'vrbo' | 'other';
  start_date: string;
  end_date: string;
  summary: string;
  created_at?: string;
  updated_at?: string;
}

export interface IcalSyncResult {
  success: boolean;
  events_processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  sync_timestamp: string;
  errors?: string[];
}

export interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: {
    date: string;
    source: string;
    summary: string;
  }[];
  blockedDates: string[];
  cannotOverride: boolean;
}

export interface PlatformConfig {
  name: string;
  url: string | null;
  enabled: boolean;
  interval: number; // milliseconds
  priority: number;
  color: string;
}

/**
 * Main iCal Service Class
 */
class IcalService {
  private baseUrl: string = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api';
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  // Platform configurations
  private platforms: Record<string, PlatformConfig> = {
    airbnb: {
      name: 'Airbnb',
      url: 'https://www.airbnb.com/calendar/ical/1157570755723100983.ics?s=1a128eefab2f47552020fb2a1b407b44',
      enabled: true,
      interval: 30 * 60 * 1000, // 30 minutes
      priority: 1,
      color: '#FF5A5F'
    },
    booking: {
      name: 'Booking.com',
      url: null, // Add when available
      enabled: false,
      interval: 60 * 60 * 1000, // 1 hour
      priority: 2,
      color: '#003580'
    },
    vrbo: {
      name: 'VRBO',
      url: null, // Add when available
      enabled: false,
      interval: 60 * 60 * 1000, // 1 hour
      priority: 3,
      color: '#FF6D40'
    }
  };

  /**
   * Initialize automatic synchronization for all enabled platforms
   */
  async initializeAutoSync(): Promise<void> {
    console.log('🔄 Initializing automatic iCal sync...');
    
    // Perform initial sync for all platforms
    await this.syncAllPlatforms();
    
    // Set up periodic sync intervals
    this.startPeriodicSync();
    
    console.log('✅ Automatic iCal sync initialized successfully');
  }

  /**
   * Start periodic synchronization for all enabled platforms
   */
  startPeriodicSync(): void {
    Object.entries(this.platforms).forEach(([platform, config]) => {
      if (config.enabled && config.url) {
        const intervalId = setInterval(async () => {
          await this.syncPlatform(platform);
        }, config.interval);
        
        this.syncIntervals.set(platform, intervalId);
        console.log(`⏰ Scheduled ${config.name} sync every ${config.interval / 60000} minutes`);
      }
    });
  }

  /**
   * Stop periodic synchronization
   */
  stopPeriodicSync(): void {
    this.syncIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.syncIntervals.clear();
    console.log('⏹️ Stopped all periodic sync intervals');
  }

  /**
   * Sync all enabled platforms
   */
  async syncAllPlatforms(): Promise<Record<string, IcalSyncResult>> {
    const results: Record<string, IcalSyncResult> = {};
    
    for (const [platform, config] of Object.entries(this.platforms)) {
      if (config.enabled && config.url) {
        try {
          results[platform] = await this.syncPlatform(platform);
        } catch (error) {
          console.error(`❌ Failed to sync ${config.name}:`, error);
          results[platform] = {
            success: false,
            events_processed: 0,
            inserted: 0,
            updated: 0,
            skipped: 0,
            sync_timestamp: new Date().toISOString(),
            errors: [error instanceof Error ? error.message : 'Unknown error']
          };
        }
      }
    }
    
    return results;
  }

  /**
   * Sync a specific platform
   */
  async syncPlatform(platform: string): Promise<IcalSyncResult> {
    const config = this.platforms[platform];
    
    if (!config || !config.enabled || !config.url) {
      throw new Error(`Platform ${platform} is not configured or enabled`);
    }

    console.log(`🔄 Syncing ${config.name}...`);
    
    try {
      const response = await fetch(`${this.baseUrl}/ical_import_airbnb.php?source=${encodeURIComponent(config.url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: IcalSyncResult = await response.json();
      result.sync_timestamp = new Date().toISOString();
      
      console.log(`✅ ${config.name} sync completed:`, {
        events_processed: result.events_processed,
        inserted: result.inserted,
        updated: result.updated,
        skipped: result.skipped
      });
      
      return result;
    } catch (error) {
      console.error(`❌ ${config.name} sync failed:`, error);
      throw error;
    }
  }

  /**
   * Import Airbnb calendar specifically
   */
  async importAirbnbCalendar(): Promise<IcalSyncResult> {
    return this.syncPlatform('airbnb');
  }

  /**
   * Get all external blocks from the database
   */
  async getExternalBlocks(startDate?: string, endDate?: string): Promise<ExternalBlock[]> {
    try {
      let url = `${this.baseUrl}/external_blocks.php`;
      
      if (startDate && endDate) {
        url += `?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If external_blocks endpoint doesn't exist, return empty array
        console.warn('External blocks endpoint not available, returning empty array');
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch external blocks:', error);
      return [];
    }
  }

  /**
   * Check for conflicts with external calendar blocks
   */
  async checkConflicts(checkIn: string, checkOut: string): Promise<ConflictDetection> {
    try {
      // Get external blocks for the date range
      const externalBlocks = await this.getExternalBlocks(checkIn, checkOut);
      
      // Generate all dates in the booking range
      const bookingDates = this.getDateRange(checkIn, checkOut);
      
      // Find conflicts
      const conflicts: ConflictDetection['conflicts'] = [];
      const blockedDates: string[] = [];
      
      externalBlocks.forEach(block => {
        const blockDates = this.getDateRange(block.start_date, block.end_date);
        
        blockDates.forEach(date => {
          if (bookingDates.includes(date)) {
            conflicts.push({
              date,
              source: block.source,
              summary: block.summary
            });
            
            if (!blockedDates.includes(date)) {
              blockedDates.push(date);
            }
          }
        });
      });
      
      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        blockedDates,
        cannotOverride: conflicts.length > 0 // External blocks cannot be overridden
      };
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return {
        hasConflicts: false,
        conflicts: [],
        blockedDates: [],
        cannotOverride: false
      };
    }
  }

  /**
   * Validate booking against external calendars
   */
  async validateBooking(checkIn: string, checkOut: string): Promise<{ valid: boolean; conflicts: ConflictDetection }> {
    const conflicts = await this.checkConflicts(checkIn, checkOut);
    
    return {
      valid: !conflicts.hasConflicts,
      conflicts
    };
  }

  /**
   * Get sync health monitoring data
   */
  getMonitoringData(): {
    lastSync: Record<string, string | null>;
    activePlatforms: string[];
    syncIntervals: Record<string, number>;
    enabledPlatforms: string[];
  } {
    const lastSync: Record<string, string | null> = {};
    const activePlatforms: string[] = [];
    const syncIntervals: Record<string, number> = {};
    const enabledPlatforms: string[] = [];
    
    Object.entries(this.platforms).forEach(([platform, config]) => {
      lastSync[platform] = null; // Would be retrieved from storage
      syncIntervals[platform] = config.interval;
      
      if (config.enabled) {
        enabledPlatforms.push(platform);
        
        if (this.syncIntervals.has(platform)) {
          activePlatforms.push(platform);
        }
      }
    });
    
    return {
      lastSync,
      activePlatforms,
      syncIntervals,
      enabledPlatforms
    };
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: string): PlatformConfig | null {
    return this.platforms[platform] || null;
  }

  /**
   * Update platform configuration
   */
  updatePlatformConfig(platform: string, updates: Partial<PlatformConfig>): void {
    if (this.platforms[platform]) {
      this.platforms[platform] = { ...this.platforms[platform], ...updates };
      
      // Restart sync if interval changed and platform is enabled
      if (updates.interval && this.platforms[platform].enabled) {
        if (this.syncIntervals.has(platform)) {
          clearInterval(this.syncIntervals.get(platform)!);
        }
        
        const intervalId = setInterval(async () => {
          await this.syncPlatform(platform);
        }, this.platforms[platform].interval);
        
        this.syncIntervals.set(platform, intervalId);
      }
    }
  }

  /**
   * Utility: Generate date range array
   */
  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Generate iCal export URL for external platforms
   */
  getExportUrl(): string {
    return `${this.baseUrl}/ical.php`;
  }

  /**
   * Test iCal URL validity
   */
  async testIcalUrl(url: string): Promise<{ valid: boolean; eventCount?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ical_proxy.php?source=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}` };
      }
      
      const data = await response.json();
      
      if (data.success) {
        return { valid: true, eventCount: data.event_count };
      } else {
        return { valid: false, error: data.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
}

// Create singleton instance
export const icalService = new IcalService();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  setTimeout(() => {
    icalService.initializeAutoSync().catch(error => {
      console.error('Failed to initialize automatic iCal sync:', error);
    });
  }, 1000); // Delay to ensure app is ready
}

export default icalService;