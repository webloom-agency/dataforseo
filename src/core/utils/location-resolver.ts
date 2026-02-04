import { DataForSEOClient } from '../client/dataforseo.client.js';

interface LocationResult {
  location_code: number;
  location_name: string;
  location_code_parent: number | null;
  country_iso_code: string;
  location_type: string;
}

interface LocationCacheEntry {
  location_name: string;
  location_code: number;
  timestamp: number;
}

/**
 * LocationResolver - Resolves natural language location inputs to DataForSEO format
 * 
 * Converts inputs like "Brussels", "Bruxelles", "NYC" to full hierarchical format
 * like "Brussels,Brussels Capital,Belgium"
 */
export class LocationResolver {
  private static cache: Map<string, LocationCacheEntry> = new Map();
  private static CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Resolves a location string to DataForSEO's full location_name format
   * 
   * @param client - DataForSEOClient instance
   * @param locationInput - Natural language location (e.g., "Brussels", "NYC", "Paris")
   * @param searchEngine - Search engine for location lookup (default: 'google')
   * @returns Resolved location_name and location_code, or null if not found
   */
  static async resolve(
    client: DataForSEOClient,
    locationInput: string,
    searchEngine: string = 'google'
  ): Promise<{ location_name: string; location_code: number } | null> {
    // Normalize input for cache key
    const cacheKey = `${searchEngine}:${locationInput.toLowerCase().trim()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      console.error(`[LocationResolver] Cache hit for "${locationInput}" -> "${cached.location_name}"`);
      return { location_name: cached.location_name, location_code: cached.location_code };
    }

    try {
      // Query DataForSEO locations API
      const payload = {
        location_name: locationInput
      };

      console.error(`[LocationResolver] Querying locations API for "${locationInput}"`);
      
      const response: any = await client.makeRequest(
        `/v3/serp/${searchEngine}/locations`,
        'POST',
        [payload],
        true // Force full response to get complete data
      );

      if (response.status_code !== 20000 || !response.tasks?.[0]?.result) {
        console.error(`[LocationResolver] No results for "${locationInput}"`);
        return null;
      }

      const results: LocationResult[] = response.tasks[0].result;
      
      if (results.length === 0) {
        console.error(`[LocationResolver] Empty results for "${locationInput}"`);
        return null;
      }

      // Find best match - prefer exact matches and city-level locations
      const bestMatch = this.findBestMatch(results, locationInput);
      
      if (bestMatch) {
        // Cache the result
        this.cache.set(cacheKey, {
          location_name: bestMatch.location_name,
          location_code: bestMatch.location_code,
          timestamp: Date.now()
        });

        console.error(`[LocationResolver] Resolved "${locationInput}" -> "${bestMatch.location_name}" (code: ${bestMatch.location_code})`);
        return { location_name: bestMatch.location_name, location_code: bestMatch.location_code };
      }

      return null;
    } catch (error) {
      console.error(`[LocationResolver] Error resolving "${locationInput}":`, error);
      return null;
    }
  }

  /**
   * Find the best matching location from results
   * Priority: exact name match > city type > first result
   */
  private static findBestMatch(results: LocationResult[], input: string): LocationResult | null {
    const inputLower = input.toLowerCase().trim();
    
    // Priority 1: Exact match on the first part of location_name (city name)
    for (const loc of results) {
      const cityName = loc.location_name.split(',')[0].toLowerCase().trim();
      if (cityName === inputLower) {
        return loc;
      }
    }

    // Priority 2: City-type location that contains the input
    const cityTypes = ['City', 'Municipality', 'Borough', 'District'];
    for (const loc of results) {
      if (cityTypes.includes(loc.location_type)) {
        const cityName = loc.location_name.split(',')[0].toLowerCase().trim();
        if (cityName.includes(inputLower) || inputLower.includes(cityName)) {
          return loc;
        }
      }
    }

    // Priority 3: Any location containing the input in first part
    for (const loc of results) {
      const cityName = loc.location_name.split(',')[0].toLowerCase().trim();
      if (cityName.includes(inputLower) || inputLower.includes(cityName)) {
        return loc;
      }
    }

    // Fallback: First result
    return results[0] || null;
  }

  /**
   * Check if a location string is already in DataForSEO hierarchical format
   * (contains commas suggesting "City,Region,Country" format)
   */
  static isAlreadyFormatted(location: string): boolean {
    // If it contains a comma and has multiple parts, assume it's already formatted
    const parts = location.split(',').map(p => p.trim()).filter(p => p.length > 0);
    return parts.length >= 2;
  }

  /**
   * Clear the location cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}
