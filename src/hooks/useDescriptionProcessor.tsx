import { useMemo } from 'react';

// Constants
const DESCRIPTION_MAX_LENGTH = 300;

interface ProcessedDescription {
  text: string;
  isTruncated: boolean;
  fullText: string;
}

/**
 * Custom hook to handle description text processing and truncation
 * Separates text processing logic from UI components
 */
export const useDescriptionProcessor = (description?: string): ProcessedDescription => {
  return useMemo(() => {
    if (!description || typeof description !== 'string') {
      return {
        text: 'No description available.',
        isTruncated: false,
        fullText: 'No description available.'
      };
    }

    const isTruncated = description.length > DESCRIPTION_MAX_LENGTH;
    
    return {
      text: isTruncated ? description.substring(0, DESCRIPTION_MAX_LENGTH) : description,
      isTruncated,
      fullText: description
    };
  }, [description]);
};