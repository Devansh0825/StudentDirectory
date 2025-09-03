import { type Student } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const handleLinkedInClick = () => {
    window.open(student.linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="student-card bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300" data-testid={`card-student-${student.id}`}>
      <img 
        src={student.imageUrl}
        alt={`${student.name} profile photo`}
        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-border"
        data-testid={`img-student-photo-${student.id}`}
      />
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
        <Button
          onClick={handleLinkedInClick}
          className="linkedin-btn inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all bg-linkedin hover:bg-linkedin-hover"
          data-testid={`button-linkedin-${student.id}`}
        >
          <i className="fab fa-linkedin mr-2"></i>
          View Profile
        </Button>
      </div>
    </div>
  );
}
