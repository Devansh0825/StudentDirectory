import { type User, type InsertUser, type Student, type InsertStudent, type AdminSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin session management
  createAdminSession(username: string, sessionToken: string): Promise<AdminSession>;
  getAdminSession(sessionToken: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionToken: string): Promise<void>;
  
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
  private adminSessions: Map<string, AdminSession>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.adminSessions = new Map();
    
    // Initialize admin user only
    this.initializeAdmin();
  }


  private initializeAdmin() {
    // Create default admin user (username: admin, password: admin123)
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: "admin123" // In real app, this should be hashed
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

  // Admin session management
  async createAdminSession(username: string, sessionToken: string): Promise<AdminSession> {
    const id = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    const session: AdminSession = {
      id,
      sessionToken,
      username,
      createdAt: new Date(),
      expiresAt
    };
    
    this.adminSessions.set(sessionToken, session);
    return session;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const session = this.adminSessions.get(sessionToken);
    
    // Check if session exists and hasn't expired
    if (session && session.expiresAt && session.expiresAt > new Date()) {
      return session;
    }
    
    // Clean up expired session
    if (session) {
      this.adminSessions.delete(sessionToken);
    }
    
    return undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    this.adminSessions.delete(sessionToken);
  }
}

export const storage = new MemStorage();
