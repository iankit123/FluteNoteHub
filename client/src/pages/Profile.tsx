import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import NavigationBar from '@/components/NavigationBar';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import MobileFooter from '@/components/MobileFooter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ChevronRight, Edit, LogOut, Settings } from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';

const Profile: React.FC = () => {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // If not logged in, redirect to login
  React.useEffect(() => {
    if (!user && !localStorage.getItem('fluteNotesUser')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const { data: userTutorials, isLoading: isLoadingTutorials } = useQuery({
    queryKey: ['/api/users', user?.id, 'tutorials'],
    enabled: !!user,
  });

  const { data: userNotes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['/api/users', user?.id, 'notes'],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PUT', `/api/users/${user?.id}`, {
        displayName,
        avatar: avatarUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditMode(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    },
  });

  const saveProfile = () => {
    if (!displayName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please provide a display name.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={user.avatar || ''} alt={user.displayName} />
                  <AvatarFallback className="text-2xl">{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <button className="absolute bottom-0 right-0 bg-royal-purple text-white p-1 rounded-full">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input 
                        id="avatarUrl" 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div className="flex gap-2 justify-center md:justify-start">
                      <Button 
                        onClick={saveProfile} 
                        className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDisplayName(user.displayName || '');
                          setAvatarUrl(user.avatar || '');
                          setIsEditMode(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h1 className="font-poppins font-bold text-2xl md:text-3xl text-dark-slate">
                          {user.displayName}
                        </h1>
                        <p className="text-dark-slate/70">@{user.username}</p>
                        {user.isInstructor && (
                          <span className="inline-block mt-2 bg-royal-purple/10 text-royal-purple text-xs font-medium px-2 py-1 rounded-full">
                            Instructor
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0 justify-center md:justify-start">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditMode(true)}
                          className="text-royal-purple border-royal-purple"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogout}
                          className="text-coral-pink border-coral-pink"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xl text-center">{userNotes?.length || 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <CardDescription className="text-center">Notes</CardDescription>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xl text-center">{userTutorials?.length || 0}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <CardDescription className="text-center">Tutorials</CardDescription>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xl text-center">32</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <CardDescription className="text-center">Comments</CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-6 bg-ivory-white/50 p-1 rounded-full">
              <TabsTrigger 
                value="activity" 
                className="flex-1 rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="tutorials" 
                className="flex-1 rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
              >
                Tutorials
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex-1 rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                    <div className="bg-royal-purple/10 p-2 rounded-full mr-3">
                      <Edit className="h-5 w-5 text-royal-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Created a new note</p>
                      <p className="text-sm text-dark-slate/70">My Practice Notes: Debussy's Syrinx</p>
                    </div>
                    <p className="text-xs text-dark-slate/50">2 days ago</p>
                  </div>
                  
                  <div className="flex items-center p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                    <div className="bg-coral-pink/10 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-coral-pink" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.2 10.95L12 16l-9.2-5.05.2-.85L12 4l9 6.15.2.85z"></path>
                        <path d="M12 16v4"></path>
                        <path d="M3 10v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Commented on a tutorial</p>
                      <p className="text-sm text-dark-slate/70">Mastering Flute Embouchure for Beginners</p>
                    </div>
                    <p className="text-xs text-dark-slate/50">5 days ago</p>
                  </div>
                  
                  <div className="flex items-center p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                    <div className="bg-deep-teal/10 p-2 rounded-full mr-3">
                      <svg className="h-5 w-5 text-deep-teal" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Bookmarked a tutorial</p>
                      <p className="text-sm text-dark-slate/70">Vibrato Techniques by Emmanuel Pahud</p>
                    </div>
                    <p className="text-xs text-dark-slate/50">1 week ago</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tutorials" className="focus-visible:outline-none focus-visible:ring-0">
              {isLoadingTutorials ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-card h-80 animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-xl"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex justify-between items-center pt-3">
                          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
                          <div className="flex space-x-2">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userTutorials && userTutorials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTutorials.map((tutorial) => (
                    <TutorialCard
                      key={tutorial.id}
                      tutorial={tutorial}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No tutorials shared yet</h2>
                  <p className="text-dark-slate/70 mb-6 max-w-md">Share your first tutorial with the community!</p>
                  <Link href="/tutorials/new">
                    <Button className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white">
                      Create Tutorial
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0">
              {isLoadingNotes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-card h-64 animate-pulse">
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex justify-between items-center pt-3">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="flex space-x-2">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userNotes && userNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userNotes.map((note) => (
                    <TutorialCard
                      key={note.id}
                      tutorial={{
                        ...note,
                        source: 'personal',
                        tags: note.tags || []
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No notes created yet</h2>
                  <p className="text-dark-slate/70 mb-6 max-w-md">Create your first practice note to keep track of your progress!</p>
                  <Link href="/notes/new">
                    <Button className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white">
                      Create Note
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <Link href="#">
                    <div className="flex items-center justify-between p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-royal-purple/10 p-2 rounded-full mr-3">
                          <Settings className="h-5 w-5 text-royal-purple" />
                        </div>
                        <div>
                          <p className="font-medium">Account Preferences</p>
                          <p className="text-sm text-dark-slate/70">Update your account settings</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-dark-slate/30" />
                    </div>
                  </Link>
                  
                  <Link href="#">
                    <div className="flex items-center justify-between p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-deep-teal/10 p-2 rounded-full mr-3">
                          <svg className="h-5 w-5 text-deep-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Privacy & Security</p>
                          <p className="text-sm text-dark-slate/70">Manage your privacy settings</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-dark-slate/30" />
                    </div>
                  </Link>
                  
                  <Link href="#">
                    <div className="flex items-center justify-between p-3 bg-ivory-white rounded-lg hover:bg-royal-purple/5 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-turmeric-yellow/10 p-2 rounded-full mr-3">
                          <svg className="h-5 w-5 text-turmeric-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Notifications</p>
                          <p className="text-sm text-dark-slate/70">Configure your notification preferences</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-dark-slate/30" />
                    </div>
                  </Link>
                  
                  <div className="flex items-center justify-between p-3 bg-ivory-white rounded-lg hover:bg-coral-pink/5 transition-colors cursor-pointer" onClick={handleLogout}>
                    <div className="flex items-center">
                      <div className="bg-coral-pink/10 p-2 rounded-full mr-3">
                        <LogOut className="h-5 w-5 text-coral-pink" />
                      </div>
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-sm text-dark-slate/70">Sign out from your account</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileFooter />
    </>
  );
};

export default Profile;
