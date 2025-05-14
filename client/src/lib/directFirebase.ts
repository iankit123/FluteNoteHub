import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  remove, 
  push, 
  child, 
  update,
  connectDatabaseEmulator 
} from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import type { 
  Tutorial, InsertTutorial, 
  Tag, InsertTag, 
  Note, InsertNote, 
  CommunityPost, InsertCommunityPost,
  CommunityComment, InsertCommunityComment,
  User
} from "@shared/schema";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXggS45GgtQEDKt7ylTmKMXIg2PPfmCB4",
  authDomain: "flute-notes-f985e.firebaseapp.com",
  databaseURL: "https://flute-notes-f985e-default-rtdb.firebaseio.com",
  projectId: "flute-notes-f985e",
  storageBucket: "flute-notes-f985e.firebasestorage.app",
  messagingSenderId: "461328034114",
  appId: "1:461328034114:web:6bc32ef02899cd0932c0db",
  measurementId: "G-NCP8XDCGBD"
};

console.log('DirectFirebase: Initializing with config:', JSON.stringify(firebaseConfig));

// Initialize Firebase
let app;
let database;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('DirectFirebase: Firebase app initialized successfully');
  
  database = getDatabase(app);
  console.log('DirectFirebase: Firebase database initialized successfully');
  
  auth = getAuth(app);
  console.log('DirectFirebase: Firebase auth initialized successfully');
  
  // Enable offline capabilities
  // This allows the app to work offline and sync when back online
  // database.goOnline();
  // console.log('DirectFirebase: Database is online');
} catch (error) {
  console.error('DirectFirebase ERROR: Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. See console for details.');
}

// Direct Firebase Service
export const directFirebaseDB = {
  // Cache for data
  _tutorialsCache: null as Tutorial[] | null,
  _notesCache: null as Note[] | null,
  _tagsCache: null as Tag[] | null,
  _usersCache: null as User[] | null,
  _lastFetchTime: 0,
  
  // User Authentication
  async loginUser(username: string, password: string): Promise<User | null> {
    console.log(`DirectFirebase: Attempting login for user: ${username}`);
    try {
      // In a real app, you'd use Firebase Authentication
      // For this demo, we'll directly query the users in the database
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const users = Object.values(usersObj) as User[];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          console.log(`DirectFirebase: Login successful for ${username}`);
          return user;
        }
      }
      
      console.log(`DirectFirebase: Login failed for ${username} - Invalid credentials`);
      return null;
    } catch (error) {
      console.error(`DirectFirebase ERROR: Login error for ${username}:`, error);
      throw error;
    }
  },
  
  async registerUser(userData: any): Promise<User | null> {
    console.log(`DirectFirebase: Attempting to register user: ${userData.username}`);
    try {
      // Check if username exists
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const users = Object.values(usersObj) as User[];
        const existingUser = users.find(u => u.username === userData.username);
        
        if (existingUser) {
          console.log(`DirectFirebase: Registration failed - Username ${userData.username} already exists`);
          return null;
        }
      }
      
      // Generate new user ID
      const newUserId = Date.now();
      const newUser = {
        id: newUserId,
        username: userData.username,
        password: userData.password, // In a real app, you'd hash this
        displayName: userData.displayName || userData.username,
        avatar: userData.avatar || null,
        isInstructor: userData.isInstructor || false,
      };
      
      // Save to Firebase
      await set(ref(database, `users/${newUserId}`), newUser);
      console.log(`DirectFirebase: User ${userData.username} registered successfully`);
      
      return newUser;
    } catch (error) {
      console.error(`DirectFirebase ERROR: Registration error for ${userData.username}:`, error);
      throw error;
    }
  },
  
  // Users
  async getAllUsers(): Promise<User[]> {
    console.log('DirectFirebase: getAllUsers called');
    try {
      // Use cache if it's less than 10 seconds old
      const now = Date.now();
      if (this._usersCache && now - this._lastFetchTime < 10000) {
        console.log('DirectFirebase: Using cached users data');
        return this._usersCache;
      }
      
      console.log('DirectFirebase: Fetching users from database');
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        console.log('DirectFirebase: Raw users data received');
        
        const users = Object.keys(usersObj).map(key => {
          // Don't return passwords in the response
          const { password, ...userWithoutPassword } = {
            id: parseInt(key),
            ...usersObj[key]
          };
          return userWithoutPassword;
        });
        
        console.log(`DirectFirebase: Processed ${users.length} users`);
        
        // Update cache
        this._usersCache = users;
        this._lastFetchTime = now;
        
        return users;
      }
      
      console.log('DirectFirebase: No users found in database');
      return [];
    } catch (error) {
      console.error("DirectFirebase ERROR: Error fetching users:", error);
      throw error;
    }
  },
  
  // Tutorials
  async getAllTutorials(): Promise<Tutorial[]> {
    console.log('DirectFirebase: getAllTutorials called');
    try {
      // Use cache if it's less than 10 seconds old
      const now = Date.now();
      if (this._tutorialsCache && now - this._lastFetchTime < 10000) {
        console.log('DirectFirebase: Using cached tutorials data');
        return this._tutorialsCache;
      }
      
      console.log('DirectFirebase: Fetching tutorials from database');
      const tutorialsRef = ref(database, 'tutorials');
      const snapshot = await get(tutorialsRef);
      
      if (snapshot.exists()) {
        const tutorialsObj = snapshot.val();
        console.log('DirectFirebase: Raw tutorials data received');
        
        const tutorials = Object.keys(tutorialsObj).map(key => ({
          id: parseInt(key),
          ...tutorialsObj[key]
        }));
        
        console.log(`DirectFirebase: Processed ${tutorials.length} tutorials`);
        
        // Update cache
        this._tutorialsCache = tutorials;
        this._lastFetchTime = now;
        
        return tutorials;
      }
      
      console.log('DirectFirebase: No tutorials found in database');
      return [];
    } catch (error) {
      console.error("DirectFirebase ERROR: Error fetching tutorials:", error);
      throw error;
    }
  },
  
  async getTutorial(id: number): Promise<Tutorial | undefined> {
    console.log(`DirectFirebase: getTutorial called for id: ${id}`);
    try {
      const tutorialRef = ref(database, `tutorials/${id}`);
      const snapshot = await get(tutorialRef);
      
      if (snapshot.exists()) {
        console.log(`DirectFirebase: Tutorial ${id} found`);
        return {
          id,
          ...snapshot.val()
        };
      }
      
      console.log(`DirectFirebase: Tutorial ${id} not found`);
      return undefined;
    } catch (error) {
      console.error(`DirectFirebase ERROR: Error fetching tutorial ${id}:`, error);
      throw error;
    }
  },
  
  // Tags
  async getAllTags(): Promise<Tag[]> {
    console.log('DirectFirebase: getAllTags called');
    try {
      // Use cache if it's less than 10 seconds old
      const now = Date.now();
      if (this._tagsCache && now - this._lastFetchTime < 10000) {
        console.log('DirectFirebase: Using cached tags data');
        return this._tagsCache;
      }
      
      console.log('DirectFirebase: Fetching tags from database');
      const tagsRef = ref(database, 'tags');
      const snapshot = await get(tagsRef);
      
      if (snapshot.exists()) {
        const tagsObj = snapshot.val();
        console.log('DirectFirebase: Raw tags data received');
        
        const tags = Object.keys(tagsObj).map(key => ({
          id: parseInt(key),
          ...tagsObj[key]
        }));
        
        console.log(`DirectFirebase: Processed ${tags.length} tags`);
        
        // Update cache
        this._tagsCache = tags;
        this._lastFetchTime = now;
        
        return tags;
      }
      
      console.log('DirectFirebase: No tags found in database');
      return [];
    } catch (error) {
      console.error("DirectFirebase ERROR: Error fetching tags:", error);
      throw error;
    }
  },
  
  // Notes
  async getAllNotes(): Promise<Note[]> {
    console.log('DirectFirebase: getAllNotes called');
    try {
      // Use cache if it's less than 10 seconds old
      const now = Date.now();
      if (this._notesCache && now - this._lastFetchTime < 10000) {
        console.log('DirectFirebase: Using cached notes data');
        return this._notesCache;
      }
      
      console.log('DirectFirebase: Fetching notes from database');
      const notesRef = ref(database, 'notes');
      const snapshot = await get(notesRef);
      
      if (snapshot.exists()) {
        const notesObj = snapshot.val();
        console.log('DirectFirebase: Raw notes data received');
        
        const notes = Object.keys(notesObj).map(key => ({
          id: parseInt(key),
          ...notesObj[key]
        }));
        
        console.log(`DirectFirebase: Processed ${notes.length} notes`);
        
        // Update cache
        this._notesCache = notes;
        this._lastFetchTime = now;
        
        return notes;
      }
      
      console.log('DirectFirebase: No notes found in database');
      return [];
    } catch (error) {
      console.error("DirectFirebase ERROR: Error fetching notes:", error);
      throw error;
    }
  },
  
  // Tutorial Tags
  async getTutorialTags(tutorialId: number): Promise<Tag[]> {
    console.log(`DirectFirebase: getTutorialTags called for tutorial: ${tutorialId}`);
    try {
      const tutorialTagsRef = ref(database, `tutorialTags/${tutorialId}`);
      const snapshot = await get(tutorialTagsRef);
      
      if (snapshot.exists()) {
        const tagIds = Object.values(snapshot.val());
        console.log(`DirectFirebase: Found ${tagIds.length} tag IDs for tutorial ${tutorialId}`);
        
        const tags: Tag[] = [];
        
        // Get all tags first
        const allTags = await this.getAllTags();
        
        // Filter tags by IDs
        for (const tagId of tagIds) {
          const tag = allTags.find(t => t.id === tagId);
          if (tag) {
            tags.push(tag);
          }
        }
        
        console.log(`DirectFirebase: Processed ${tags.length} tags for tutorial ${tutorialId}`);
        return tags;
      }
      
      console.log(`DirectFirebase: No tags found for tutorial ${tutorialId}`);
      return [];
    } catch (error) {
      console.error(`DirectFirebase ERROR: Error fetching tags for tutorial ${tutorialId}:`, error);
      throw error;
    }
  }
};

export default directFirebaseDB;
