import React, { createContext, useContext, ReactNode } from 'react';
import directFirebaseDB from '../lib/directFirebase';

// Define the API context type
interface ApiContextType {
  // Users
  getAllUsers: () => Promise<any[]>;
  loginUser: (username: string, password: string) => Promise<any>;
  registerUser: (userData: any) => Promise<any>;
  
  // Tutorials
  getAllTutorials: () => Promise<any[]>;
  getTutorial: (id: number) => Promise<any>;
  
  // Tags
  getAllTags: () => Promise<any[]>;
  getTutorialTags: (tutorialId: number) => Promise<any[]>;
  
  // Notes
  getAllNotes: () => Promise<any[]>;
}

// Create the context with a default value
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider component
export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create the API methods that will directly use Firebase
  const api: ApiContextType = {
    // Users
    getAllUsers: async () => {
      console.log('ApiContext: Getting all users');
      try {
        return await directFirebaseDB.getAllUsers();
      } catch (error) {
        console.error('ApiContext error: Failed to get users', error);
        throw error;
      }
    },
    
    loginUser: async (username: string, password: string) => {
      console.log(`ApiContext: Attempting login for ${username}`);
      try {
        const user = await directFirebaseDB.loginUser(username, password);
        if (!user) {
          throw new Error('Invalid credentials');
        }
        return user;
      } catch (error) {
        console.error('ApiContext error: Login failed', error);
        throw error;
      }
    },
    
    registerUser: async (userData: any) => {
      console.log(`ApiContext: Registering user ${userData.username}`);
      try {
        const user = await directFirebaseDB.registerUser(userData);
        if (!user) {
          throw new Error('Registration failed');
        }
        return user;
      } catch (error) {
        console.error('ApiContext error: Registration failed', error);
        throw error;
      }
    },
    
    // Tutorials
    getAllTutorials: async () => {
      console.log('ApiContext: Getting all tutorials');
      try {
        return await directFirebaseDB.getAllTutorials();
      } catch (error) {
        console.error('ApiContext error: Failed to get tutorials', error);
        throw error;
      }
    },
    
    getTutorial: async (id: number) => {
      console.log(`ApiContext: Getting tutorial ${id}`);
      try {
        const tutorial = await directFirebaseDB.getTutorial(id);
        if (!tutorial) {
          throw new Error(`Tutorial ${id} not found`);
        }
        return tutorial;
      } catch (error) {
        console.error(`ApiContext error: Failed to get tutorial ${id}`, error);
        throw error;
      }
    },
    
    // Tags
    getAllTags: async () => {
      console.log('ApiContext: Getting all tags');
      try {
        return await directFirebaseDB.getAllTags();
      } catch (error) {
        console.error('ApiContext error: Failed to get tags', error);
        throw error;
      }
    },
    
    getTutorialTags: async (tutorialId: number) => {
      console.log(`ApiContext: Getting tags for tutorial ${tutorialId}`);
      try {
        return await directFirebaseDB.getTutorialTags(tutorialId);
      } catch (error) {
        console.error(`ApiContext error: Failed to get tags for tutorial ${tutorialId}`, error);
        throw error;
      }
    },
    
    // Notes
    getAllNotes: async () => {
      console.log('ApiContext: Getting all notes');
      try {
        return await directFirebaseDB.getAllNotes();
      } catch (error) {
        console.error('ApiContext error: Failed to get notes', error);
        throw error;
      }
    },
  };
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
