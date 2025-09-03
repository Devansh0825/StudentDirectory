interface HeaderProps {
  studentCount: number;
}

export default function Header({ studentCount }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <i className="fas fa-graduation-cap text-primary text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
                Student Directory
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-app-subtitle">
                MCA Program 2024-2026
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid="text-student-count">
              {studentCount} Students
            </span>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-primary-foreground text-sm"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
