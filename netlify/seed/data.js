/**
 * Seed data for development and testing
 */

// Sample users
const users = [
  {
    id: 1,
    username: 'fluteMaster',
    name: 'John Smith',
    password: 'password123', // In a real app, this would be hashed
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    bio: 'Professional flutist with 15 years of experience',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'fluteStudent',
    name: 'Sarah Johnson',
    password: 'password123',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    bio: 'Learning flute for 2 years, passionate about classical music',
    createdAt: '2023-02-15T00:00:00.000Z'
  },
  {
    id: 3,
    username: 'musicTeacher',
    name: 'David Wilson',
    password: 'password123',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
    bio: 'Music teacher specializing in woodwind instruments',
    createdAt: '2023-03-10T00:00:00.000Z'
  },
  {
    id: 4,
    username: 'fluteEnthusiast',
    name: 'Emily Chen',
    password: 'password123',
    profilePicture: 'https://i.pravatar.cc/150?img=9',
    bio: 'Hobbyist flutist who loves sharing tips and tricks',
    createdAt: '2023-04-20T00:00:00.000Z'
  }
];

// Sample tutorials
const tutorials = [
  {
    id: 1,
    title: 'Getting Started with Flute',
    description: 'Learn the basics of flute playing with this beginner-friendly tutorial',
    author: 1, // References user id
    difficulty: 'beginner',
    duration: '15 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1569791832138-f8bed9a95c17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    content: 'This tutorial covers the basics of flute playing...',
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-01-15T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Advanced Flute Techniques',
    description: 'Master advanced flute techniques with this comprehensive guide',
    author: 1,
    difficulty: 'advanced',
    duration: '30 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    content: 'This tutorial explores advanced flute techniques...',
    createdAt: '2023-02-20T00:00:00.000Z',
    updatedAt: '2023-02-20T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Flute Maintenance Tips',
    description: 'Learn how to properly care for and maintain your flute',
    author: 3,
    difficulty: 'intermediate',
    duration: '20 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1621628898826-8956e10449c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    content: 'This tutorial covers essential flute maintenance tips...',
    createdAt: '2023-03-15T00:00:00.000Z',
    updatedAt: '2023-03-15T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Breathing Techniques for Flutists',
    description: 'Improve your flute playing with proper breathing techniques',
    author: 2,
    difficulty: 'intermediate',
    duration: '25 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1629114112651-a8c8c27fb851?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
    content: 'This tutorial focuses on breathing techniques for flutists...',
    createdAt: '2023-04-10T00:00:00.000Z',
    updatedAt: '2023-04-10T00:00:00.000Z'
  }
];

// Sample tags
const tags = [
  { id: 1, name: 'Beginner' },
  { id: 2, name: 'Intermediate' },
  { id: 3, name: 'Advanced' },
  { id: 4, name: 'Technique' },
  { id: 5, name: 'Maintenance' },
  { id: 6, name: 'Performance' },
  { id: 7, name: 'Theory' },
  { id: 8, name: 'Practice Tips' },
  { id: 9, name: 'Classical' }
];

module.exports = {
  users,
  tutorials,
  tags
};
