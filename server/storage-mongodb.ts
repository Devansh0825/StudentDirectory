import { type User, type InsertUser, type Student, type InsertStudent, type AdminSession } from "@shared/schema";
import { connectMongoDB, UserModel, StudentModel, AdminSessionModel, type IUser, type IStudent, type IAdminSession } from "./mongodb";
import { IStorage } from "./storage";

export class MongoDBStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!this.initialized) {
      try {
        await connectMongoDB();
        await this.initializeAdmin();
        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize MongoDB:", error);
      }
    }
  }

  private async initializeAdmin() {
    try {
      // Check if admin user already exists
      const existingAdmin = await UserModel.findOne({ username: "admin" });
      if (!existingAdmin) {
        // Create default admin user
        await UserModel.create({
          username: "admin",
          password: "admin123" // In real app, this should be hashed
        });
        console.log("Created default admin user");
      }
    } catch (error) {
      console.error("Failed to initialize admin user:", error);
    }
  }

  // Helper function to convert MongoDB document to interface
  private mongoUserToUser(mongoUser: IUser): User {
    return {
      id: mongoUser._id.toString(),
      username: mongoUser.username,
      password: mongoUser.password
    };
  }

  private mongoStudentToStudent(mongoStudent: IStudent): Student {
    return {
      id: mongoStudent._id.toString(),
      name: mongoStudent.name,
      email: mongoStudent.email,
      course: mongoStudent.course,
      batch: mongoStudent.batch,
      imageUrl: mongoStudent.imageUrl,
      linkedinUrl: mongoStudent.linkedinUrl
    };
  }

  private mongoSessionToSession(mongoSession: IAdminSession): AdminSession {
    return {
      id: mongoSession._id.toString(),
      sessionToken: mongoSession.sessionToken,
      username: mongoSession.username,
      createdAt: mongoSession.createdAt,
      expiresAt: mongoSession.expiresAt
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.initialize();
    const user = await UserModel.findById(id);
    return user ? this.mongoUserToUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.initialize();
    const user = await UserModel.findOne({ username });
    return user ? this.mongoUserToUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.initialize();
    const user = await UserModel.create(insertUser);
    return this.mongoUserToUser(user);
  }

  async getAllStudents(): Promise<Student[]> {
    await this.initialize();
    const students = await StudentModel.find();
    return students.map(student => this.mongoStudentToStudent(student));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    await this.initialize();
    const student = await StudentModel.findById(id);
    return student ? this.mongoStudentToStudent(student) : undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    await this.initialize();
    const student = await StudentModel.create(insertStudent);
    return this.mongoStudentToStudent(student);
  }

  async searchStudents(query: string): Promise<Student[]> {
    await this.initialize();
    const regex = new RegExp(query, 'i');
    const students = await StudentModel.find({
      $or: [
        { name: regex },
        { email: regex },
        { course: regex },
        { batch: regex }
      ]
    });
    return students.map(student => this.mongoStudentToStudent(student));
  }

  async filterStudents(batch?: string, course?: string): Promise<Student[]> {
    await this.initialize();
    const filter: any = {};
    if (batch) filter.batch = batch;
    if (course) filter.course = course;
    
    const students = await StudentModel.find(filter);
    return students.map(student => this.mongoStudentToStudent(student));
  }

  async clearAllStudents(): Promise<void> {
    await this.initialize();
    await StudentModel.deleteMany({});
  }

  async importStudents(students: InsertStudent[]): Promise<Student[]> {
    await this.initialize();
    if (students.length === 0) return [];
    
    const createdStudents = await StudentModel.insertMany(students);
    return createdStudents.map(student => this.mongoStudentToStudent(student));
  }

  async upsertStudents(students: InsertStudent[]): Promise<Student[]> {
    await this.initialize();
    if (students.length === 0) return [];
    
    const upsertedStudents: Student[] = [];
    
    for (const studentData of students) {
      // Check if student exists by email or name
      const existing = await StudentModel.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${studentData.email}$`, 'i') } },
          { name: { $regex: new RegExp(`^${studentData.name}$`, 'i') } }
        ]
      });
      
      if (existing) {
        // Update existing student
        const updated = await StudentModel.findByIdAndUpdate(
          existing._id,
          studentData,
          { new: true, runValidators: true }
        );
        if (updated) {
          upsertedStudents.push(this.mongoStudentToStudent(updated));
          console.log(`Updated existing student: ${updated.name}`);
        }
      } else {
        // Create new student
        const newStudent = await StudentModel.create(studentData);
        upsertedStudents.push(this.mongoStudentToStudent(newStudent));
        console.log(`Created new student: ${newStudent.name}`);
      }
    }
    
    return upsertedStudents;
  }

  // Admin session management
  async createAdminSession(username: string, sessionToken: string): Promise<AdminSession> {
    await this.initialize();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    const session = await AdminSessionModel.create({
      sessionToken,
      username,
      expiresAt
    });
    
    return this.mongoSessionToSession(session);
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    await this.initialize();
    const session = await AdminSessionModel.findOne({ sessionToken });
    
    // Check if session exists and hasn't expired
    if (session && session.expiresAt > new Date()) {
      return this.mongoSessionToSession(session);
    }
    
    // Clean up expired session
    if (session) {
      await this.deleteAdminSession(sessionToken);
    }
    
    return undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    await this.initialize();
    await AdminSessionModel.deleteOne({ sessionToken });
  }
}