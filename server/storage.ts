import { type User, type InsertUser, type Student, type InsertStudent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  searchStudents(query: string): Promise<Student[]>;
  filterStudents(batch?: string, course?: string): Promise<Student[]>;
  clearAllStudents(): Promise<void>;
  importStudents(students: InsertStudent[]): Promise<Student[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private students: Map<string, Student>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    
    // Initialize with sample MCA students data
    this.initializeStudents();
  }

  private initializeStudents() {
    const sampleStudents: InsertStudent[] = [
      {
        name: "Arjun Sharma",
        email: "arjun.sharma@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/arjun-sharma"
      },
      {
        name: "Priya Patel",
        email: "priya.patel@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c5e04c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/priya-patel"
      },
      {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/rajesh-kumar"
      },
      {
        name: "Sneha Gupta",
        email: "sneha.gupta@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/sneha-gupta"
      },
      {
        name: "Vikash Singh",
        email: "vikash.singh@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/vikash-singh"
      },
      {
        name: "Anita Desai",
        email: "anita.desai@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/anita-desai"
      },
      {
        name: "Rohit Verma",
        email: "rohit.verma@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/rohit-verma"
      },
      {
        name: "Kavya Sharma",
        email: "kavya.sharma@university.edu",
        course: "MCA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/kavya-sharma"
      },
      {
        name: "Amit Jain",
        email: "amit.jain@university.edu",
        course: "MCA",
        batch: "2023-2025",
        imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/amit-jain"
      },
      {
        name: "Pooja Mehta",
        email: "pooja.mehta@university.edu",
        course: "MCA",
        batch: "2023-2025",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/pooja-mehta"
      },
      {
        name: "Ravi Agarwal",
        email: "ravi.agarwal@university.edu",
        course: "MBA",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/ravi-agarwal"
      },
      {
        name: "Neha Kapoor",
        email: "neha.kapoor@university.edu",
        course: "M.Tech",
        batch: "2024-2026",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        linkedinUrl: "https://linkedin.com/in/neha-kapoor"
      }
    ];

    sampleStudents.forEach(student => {
      const id = randomUUID();
      this.students.set(id, { ...student, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async searchStudents(query: string): Promise<Student[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.students.values()).filter(student =>
      student.name.toLowerCase().includes(lowerQuery) ||
      student.email.toLowerCase().includes(lowerQuery) ||
      student.course.toLowerCase().includes(lowerQuery) ||
      student.batch.toLowerCase().includes(lowerQuery)
    );
  }

  async filterStudents(batch?: string, course?: string): Promise<Student[]> {
    let students = Array.from(this.students.values());
    
    if (batch) {
      students = students.filter(student => student.batch === batch);
    }
    
    if (course) {
      students = students.filter(student => student.course === course);
    }
    
    return students;
  }

  async clearAllStudents(): Promise<void> {
    this.students.clear();
  }

  async importStudents(students: InsertStudent[]): Promise<Student[]> {
    const importedStudents: Student[] = [];
    
    for (const studentData of students) {
      const id = randomUUID();
      const student: Student = { ...studentData, id };
      this.students.set(id, student);
      importedStudents.push(student);
    }
    
    return importedStudents;
  }
}

export const storage = new MemStorage();
