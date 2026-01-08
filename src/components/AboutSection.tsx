import React from 'react';
import { Amenities } from "@/components/Amenities";

interface ProcessedDescription {
  text: string;
  isTruncated: boolean;
  fullText: string;
}

interface AboutSectionProps {
  villaName: string;
  processedDescription: ProcessedDescription;
  amenities: Array<{ name: string; icon: string }>;
}

/**
 * Separated About section component
 * Handles villa description and amenities display
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  villaName,
  processedDescription,
  amenities
}) => {
  const handleReadMore = () => {
    // Simple alert for now - could be enhanced with modal or expanded state
    alert(processedDescription.fullText);
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-bold mb-4">About {villaName}</h2>
          <div className="text-gray-700 leading-relaxed">
            <p>{processedDescription.text}</p>
            {processedDescription.isTruncated && (
              <>
                <span>...</span>
                <button 
                  onClick={handleReadMore}
                  className="text-hotel-sage hover:text-hotel-sage-dark ml-2 underline"
                >
                  Read More
                </button>
              </>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Amenities amenities={amenities} />
        </div>
      </div>
    </div>
  );
};