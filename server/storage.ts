import { 
  users, User, InsertUser, 
  tutorials, Tutorial, InsertTutorial,
  tags, Tag, InsertTag,
  tutorialTags, TutorialTag, InsertTutorialTag,
  notes, Note, InsertNote,
  comments, Comment, InsertComment,
  bookmarks, Bookmark, InsertBookmark,
  communityPosts, CommunityPost, InsertCommunityPost,
  communityPostTags, CommunityPostTag, InsertCommunityPostTag,
  communityComments, CommunityComment, InsertCommunityComment
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tutorials
  getTutorial(id: number): Promise<Tutorial | undefined>;
  getAllTutorials(): Promise<Tutorial[]>;
  getUserTutorials(userId: number): Promise<Tutorial[]>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial | undefined>;
  deleteTutorial(id: number): Promise<boolean>;
  
  // Tags
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  getAllTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // TutorialTags
  getTutorialTags(tutorialId: number): Promise<Tag[]>;
  addTagToTutorial(tutorialTag: InsertTutorialTag): Promise<TutorialTag>;
  removeTagFromTutorial(tutorialId: number, tagId: number): Promise<boolean>;
  
  // Notes
  getNote(id: number): Promise<Note | undefined>;
  getTutorialNotes(tutorialId: number): Promise<Note[]>;
  getUserNotes(userId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Comments
  getComment(id: number): Promise<Comment | undefined>;
  getTutorialComments(tutorialId: number): Promise<Comment[]>;
  getNoteComments(noteId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Bookmarks
  getBookmark(id: number): Promise<Bookmark | undefined>;
  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  checkBookmark(userId: number, tutorialId?: number, noteId?: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Community Posts
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  getUserCommunityPosts(userId: number): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: number): Promise<boolean>;
  
  // Community Post Tags
  getCommunityPostTags(postId: number): Promise<Tag[]>;
  addTagToCommunityPost(postTag: InsertCommunityPostTag): Promise<CommunityPostTag>;
  removeTagFromCommunityPost(postId: number, tagId: number): Promise<boolean>;
  
  // Community Comments
  getCommunityComment(id: number): Promise<CommunityComment | undefined>;
  getCommunityPostComments(postId: number): Promise<CommunityComment[]>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;
  deleteCommunityComment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tutorials: Map<number, Tutorial>;
  private tags: Map<number, Tag>;
  private tutorialTags: Map<number, TutorialTag>;
  private notes: Map<number, Note>;
  private comments: Map<number, Comment>;
  private bookmarks: Map<number, Bookmark>;
  private communityPosts: Map<number, CommunityPost>;
  private communityPostTags: Map<number, CommunityPostTag>;
  private communityComments: Map<number, CommunityComment>;
  
  private currentIds: {
    user: number;
    tutorial: number;
    tag: number;
    tutorialTag: number;
    note: number;
    comment: number;
    bookmark: number;
    communityPost: number;
    communityPostTag: number;
    communityComment: number;
  };

  constructor() {
    this.users = new Map();
    this.tutorials = new Map();
    this.tags = new Map();
    this.tutorialTags = new Map();
    this.notes = new Map();
    this.comments = new Map();
    this.bookmarks = new Map();
    this.communityPosts = new Map();
    this.communityPostTags = new Map();
    this.communityComments = new Map();
    
    this.currentIds = {
      user: 1,
      tutorial: 1,
      tag: 1,
      tutorialTag: 1,
      note: 1,
      comment: 1,
      bookmark: 1,
      communityPost: 1,
      communityPostTag: 1,
      communityComment: 1,
    };
    
    // First seed with default data
    this.seedData();
    
    // Then try to load data from Firebase (will happen asynchronously)
    this.loadFromFirebase();
  }
  
  // Load data from Firebase and populate MemStorage
  private async loadFromFirebase() {
    try {
      // Import server-side Firebase configuration
      const { firebaseDB } = await import('./firebase');
      console.log('Server Firebase connection status:', firebaseDB.isConnected() ? 'Connected' : 'Not connected');
      
      // Import client-side Firebase for data methods
      const { firebaseDB: clientFirebaseDB } = await import('@/lib/firebase');
      console.log('Client Firebase methods available:', !!clientFirebaseDB);
      
      // Load tutorials from Firebase
      console.log('Attempting to load tutorials from Firebase...');
      const tutorials = await clientFirebaseDB.getAllTutorials();
      if (tutorials && tutorials.length > 0) {
        console.log(`Loaded ${tutorials.length} tutorials from Firebase`);
        
        // Clear existing tutorials and add Firebase tutorials
        this.tutorials.clear();
        tutorials.forEach(tutorial => {
          // Migrate: Add category field if missing
          if (!tutorial.category) {
            if (tutorial.source === 'youtube') {
              tutorial.category = 'music';
            } else {
              tutorial.category = 'learning';
            }
            console.log(`Migrated tutorial ${tutorial.id} "${tutorial.title}" to category: ${tutorial.category}`);
          }
          
          this.tutorials.set(tutorial.id, tutorial);
          // Update the current ID counter to prevent ID conflicts
          if (tutorial.id >= this.currentIds.tutorial) {
            this.currentIds.tutorial = tutorial.id + 1;
          }
        });
      }
      
      // Load tags
      const tags = await clientFirebaseDB.getAllTags();
      if (tags && tags.length > 0) {
        console.log(`Loaded ${tags.length} tags from Firebase`);
        
        // Clear existing tags and add Firebase tags
        this.tags.clear();
        tags.forEach(tag => {
          this.tags.set(tag.id, tag);
          // Update the current ID counter to prevent ID conflicts
          if (tag.id >= this.currentIds.tag) {
            this.currentIds.tag = tag.id + 1;
          }
        });
      }
      
      // Load notes from Firebase
      const notes = await clientFirebaseDB.getAllNotes();
      if (notes && notes.length > 0) {
        console.log(`Loaded ${notes.length} notes from Firebase`);
        
        // Clear existing notes and add Firebase notes
        this.notes.clear();
        notes.forEach(note => {
          this.notes.set(note.id, note);
          // Update the current ID counter to prevent ID conflicts
          if (note.id >= this.currentIds.note) {
            this.currentIds.note = note.id + 1;
          }
        });
      }
      
      console.log('Successfully loaded data from Firebase');
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
      console.log('Using seed data as fallback');
    }
  }

  // Seed initial data
  private seedData() {
    // Seed default tags
    const defaultTags = [
      { name: "Beginner", category: "level", color: "#F9A825" },
      { name: "Intermediate", category: "level", color: "#F9A825" },
      { name: "Advanced", category: "level", color: "#F76C6C" },
      { name: "Technique", category: "category", color: "#005F73" },
      { name: "Repertoire", category: "category", color: "#005F73" },
      { name: "Performance", category: "category", color: "#005F73" },
      { name: "Interpretation", category: "category", color: "#F9A825" },
      { name: "Practice Tips", category: "category", color: "#F9A825" },
      { name: "Flute Care", category: "category", color: "#F9A825" },
    ];
    
    defaultTags.forEach(tag => {
      this.createTag(tag);
    });
    
    // Create a demo user
    this.createUser({
      username: "emma",
      password: "password123", // In a real app, this would be hashed
      displayName: "Emma",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150",
      isInstructor: false,
    });
    
    // Create some instructors
    const instructors = [
      {
        username: "sarah_johnson",
        password: "instructor123",
        displayName: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150",
        isInstructor: true,
      },
      {
        username: "david_chen",
        password: "instructor456",
        displayName: "David Chen",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
        isInstructor: true,
      },
      {
        username: "michelle_taylor",
        password: "instructor789",
        displayName: "Michelle Taylor",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150",
        isInstructor: true,
      }
    ];
    
    instructors.forEach(instructor => {
      this.createUser(instructor);
    });
    
    // Create some sample tutorials
    const sampleTutorials = [
      {
        title: "YouTube Tutorial Example",
        description: "Learn basic flute techniques with this comprehensive tutorial for beginners.",
        thumbnailUrl: "https://img.youtube.com/vi/oV4z-U-AuaY/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=oV4z-U-AuaY",
        websiteUrl: null,
        source: "youtube",
        category: "learning", // Explicitly mark as learning content
        authorId: 2, // David Chen
        duration: "12:45"
      },
      {
        title: "Website Tutorial on Flute Posture",
        description: "Essential guide to proper flute posture and breathing techniques.",
        thumbnailUrl: "https://images.unsplash.com/photo-1548123378-bde4ced4e0c4?auto=format&fit=crop&w=600&h=400",
        videoUrl: null,
        websiteUrl: "https://flutematters.com/posture-techniques",
        source: "website",
        category: "learning", // Explicitly mark as learning content
        authorId: 3, // Michelle Taylor
        duration: "20:00"
      },
      {
        title: "My Personal Practice Notes",
        description: "Personal practice notes with key insights on breathing technique.",
        thumbnailUrl: null,
        videoUrl: null,
        websiteUrl: null,
        source: "personal",
        category: "learning", // Explicitly mark as learning content
        authorId: 1, // Emma
        duration: "15:00"
      }
    ];
    
    sampleTutorials.forEach(tutorial => {
      this.createTutorial(tutorial);
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Tutorials
  async getTutorial(id: number): Promise<Tutorial | undefined> {
    return this.tutorials.get(id);
  }

  async getAllTutorials(): Promise<Tutorial[]> {
    return Array.from(this.tutorials.values());
  }

  async getUserTutorials(userId: number): Promise<Tutorial[]> {
    return Array.from(this.tutorials.values()).filter(
      (tutorial) => tutorial.authorId === userId,
    );
  }

  async createTutorial(insertTutorial: InsertTutorial): Promise<Tutorial> {
    const id = this.currentIds.tutorial++;
    const now = new Date();
    
    // Set default category based on source if not provided
    let category = insertTutorial.category || null;
    if (!category) {
      if (insertTutorial.source === 'youtube') {
        category = 'music';
      } else {
        category = 'learning';
      }
    }
    
    const tutorial: Tutorial = { 
      ...insertTutorial, 
      id, 
      category,
      createdAt: now
    };
    this.tutorials.set(id, tutorial);
    return tutorial;
  }

  async updateTutorial(id: number, tutorialData: Partial<InsertTutorial>): Promise<Tutorial | undefined> {
    const tutorial = this.tutorials.get(id);
    if (!tutorial) return undefined;
    
    const updatedTutorial = { ...tutorial, ...tutorialData };
    this.tutorials.set(id, updatedTutorial);
    return updatedTutorial;
  }

  async deleteTutorial(id: number): Promise<boolean> {
    return this.tutorials.delete(id);
  }
  
  // Tags
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentIds.tag++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }
  
  // TutorialTags
  async getTutorialTags(tutorialId: number): Promise<Tag[]> {
    const tutorialTagEntries = Array.from(this.tutorialTags.values()).filter(
      (tt) => tt.tutorialId === tutorialId,
    );
    
    const tags: Tag[] = [];
    for (const entry of tutorialTagEntries) {
      const tag = await this.getTag(entry.tagId);
      if (tag) tags.push(tag);
    }
    
    return tags;
  }

  async addTagToTutorial(insertTutorialTag: InsertTutorialTag): Promise<TutorialTag> {
    const id = this.currentIds.tutorialTag++;
    const tutorialTag: TutorialTag = { ...insertTutorialTag, id };
    this.tutorialTags.set(id, tutorialTag);
    return tutorialTag;
  }

  async removeTagFromTutorial(tutorialId: number, tagId: number): Promise<boolean> {
    const tutorialTagEntry = Array.from(this.tutorialTags.values()).find(
      (tt) => tt.tutorialId === tutorialId && tt.tagId === tagId,
    );
    
    if (!tutorialTagEntry) return false;
    return this.tutorialTags.delete(tutorialTagEntry.id);
  }
  
  // Notes
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getTutorialNotes(tutorialId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.tutorialId === tutorialId,
    );
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentIds.note++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, noteData: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const now = new Date();
    const updatedNote = { ...note, ...noteData, updatedAt: now };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Comments
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getTutorialComments(tutorialId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.tutorialId === tutorialId,
    );
  }

  async getNoteComments(noteId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.noteId === noteId,
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comment++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
  
  // Bookmarks
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId,
    );
  }

  async checkBookmark(userId: number, tutorialId?: number, noteId?: number): Promise<Bookmark | undefined> {
    return Array.from(this.bookmarks.values()).find(
      (bookmark) => 
        bookmark.userId === userId && 
        (tutorialId ? bookmark.tutorialId === tutorialId : true) &&
        (noteId ? bookmark.noteId === noteId : true)
    );
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentIds.bookmark++;
    const now = new Date();
    const bookmark: Bookmark = { ...insertBookmark, id, createdAt: now };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
  
  // Community Posts
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values());
  }

  async getUserCommunityPosts(userId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).filter(
      (post) => post.userId === userId,
    );
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentIds.communityPost++;
    const now = new Date();
    const post: CommunityPost = { 
      ...insertPost, 
      id, 
      createdAt: now, 
      likesCount: 0 
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async updateCommunityPost(id: number, postData: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...postData };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteCommunityPost(id: number): Promise<boolean> {
    return this.communityPosts.delete(id);
  }
  
  // Community Post Tags
  async getCommunityPostTags(postId: number): Promise<Tag[]> {
    const postTagEntries = Array.from(this.communityPostTags.values()).filter(
      (pt) => pt.postId === postId,
    );
    
    const tags: Tag[] = [];
    for (const entry of postTagEntries) {
      const tag = await this.getTag(entry.tagId);
      if (tag) tags.push(tag);
    }
    
    return tags;
  }

  async addTagToCommunityPost(insertPostTag: InsertCommunityPostTag): Promise<CommunityPostTag> {
    const id = this.currentIds.communityPostTag++;
    const postTag: CommunityPostTag = { ...insertPostTag, id };
    this.communityPostTags.set(id, postTag);
    return postTag;
  }

  async removeTagFromCommunityPost(postId: number, tagId: number): Promise<boolean> {
    const postTagEntry = Array.from(this.communityPostTags.values()).find(
      (pt) => pt.postId === postId && pt.tagId === tagId,
    );
    
    if (!postTagEntry) return false;
    return this.communityPostTags.delete(postTagEntry.id);
  }
  
  // Community Comments
  async getCommunityComment(id: number): Promise<CommunityComment | undefined> {
    return this.communityComments.get(id);
  }

  async getCommunityPostComments(postId: number): Promise<CommunityComment[]> {
    return Array.from(this.communityComments.values()).filter(
      (comment) => comment.postId === postId,
    );
  }

  async createCommunityComment(insertComment: InsertCommunityComment): Promise<CommunityComment> {
    const id = this.currentIds.communityComment++;
    const now = new Date();
    const comment: CommunityComment = { ...insertComment, id, createdAt: now };
    this.communityComments.set(id, comment);
    return comment;
  }

  async deleteCommunityComment(id: number): Promise<boolean> {
    return this.communityComments.delete(id);
  }
}

export const storage = new MemStorage();
