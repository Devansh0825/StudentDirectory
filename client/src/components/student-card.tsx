import { type Student } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const handleLinkedInClick = () => {
    if (student.linkedinUrl && student.linkedinUrl.trim()) {
      window.open(student.linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const hasValidLinkedIn = student.linkedinUrl && student.linkedinUrl.trim() !== '';
  const hasValidImage = student.imageUrl && student.imageUrl.trim() !== '';

  return (
    <div className="student-card bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300" data-testid={`card-student-${student.id}`}>
      {/* Profile Image or Avatar */}
      <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
        {hasValidImage ? (
          <img 
            src={student.imageUrl}
            alt={`${student.name} profile photo`}
            className="w-full h-full object-cover"
            data-testid={`img-student-photo-${student.id}`}
            onLoad={(e) => {
              console.log(`Image loaded successfully for ${student.name}: ${student.imageUrl}`);
            }}
            onError={(e) => {
              console.error(`Image failed to load for ${student.name}: ${student.imageUrl}`);
              // Try alternative Google Drive format if original fails
              const originalSrc = e.currentTarget.src;
              if (originalSrc.includes('drive.google.com/thumbnail')) {
                // Extract file ID and try direct format
                const fileIdMatch = originalSrc.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (fileIdMatch) {
                  const fileId = fileIdMatch[1];
                  const newSrc = `https://lh3.googleusercontent.com/d/${fileId}=w300-h300`;
                  console.log(`Trying alternative format: ${newSrc}`);
                  e.currentTarget.src = newSrc;
                  return;
                }
              }
              // If all else fails, hide image and show icon
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<i class="fas fa-user text-2xl text-muted-foreground"></i>';
              }
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
