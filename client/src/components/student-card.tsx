import { Button } from "@/components/ui/button";
import { type Student } from "@shared/schema";
import { useState } from "react";

interface StudentCardProps {
  student: Student;
}

// Helper to convert Google Drive share links to direct image links
function getDirectImageUrl(url: string) {
  if (!url) return "";
  // Match Google Drive open?id= or file/d/ links
  const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{25,})/);
  if (match && match[1]) {
    // Use proxy to bypass CORS and access restrictions
    const directUrl = `https://lh3.googleusercontent.com/d/${match[1]}=w300-h300`;
    return `/api/images/proxy?url=${encodeURIComponent(directUrl)}`;
  }
  return url;
}

export default function StudentCard({ student }: StudentCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleLinkedInClick = () => {
    if (student.linkedinUrl && student.linkedinUrl.trim()) {
      window.open(student.linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const hasValidLinkedIn = student.linkedinUrl && student.linkedinUrl.trim() !== '';
  const hasValidImage = student.imageUrl && student.imageUrl.trim() !== '';
  const imageUrl = hasValidImage ? getDirectImageUrl(student.imageUrl) : '';

  return (
    <div className="student-card bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300" data-testid={`card-student-${student.id}`}>
      {/* Profile Image or Avatar */}
      <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
        {hasValidImage && !imgError ? (
          <img 
            src={imageUrl}
            alt={`${student.name} profile photo`}
            className="w-full h-full object-cover"
            data-testid={`img-student-photo-${student.id}`}
            onLoad={() => {
              console.log(`Image loaded successfully for ${student.name}: ${imageUrl}`);
            }}
            onError={() => {
              console.error(`Image failed to load for ${student.name}: ${imageUrl}`);
              setImgError(true);
            }}
          />
        ) : (
          <i className="fas fa-user text-2xl text-muted-foreground"></i>
        )}
      </div>
      
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-lg mb-1" data-testid={`text-student-name-${student.id}`}>
          {student.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-2" data-testid={`text-student-course-${student.id}`}>
          {student.course}
        </p>
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground mb-4" data-testid={`text-student-batch-${student.id}`}>
          <i className="fas fa-calendar-alt mr-1"></i>
          {student.batch}
        </div>
        
        {/* LinkedIn Button - only show if valid URL exists */}
        {hasValidLinkedIn ? (
          <Button
            onClick={handleLinkedInClick}
            className="linkedin-btn inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all bg-linkedin hover:bg-linkedin-hover"
            data-testid={`button-linkedin-${student.id}`}
          >
            <i className="fab fa-linkedin mr-2"></i>
            View Profile
          </Button>
        ) : (
          <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
            <i className="fab fa-linkedin mr-2"></i>
            No Profile
          </div>
        )}
      </div>
    </div>
  );
}
