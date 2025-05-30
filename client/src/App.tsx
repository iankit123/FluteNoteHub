import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import EditNote from "@/pages/EditNote";
import NewTutorial from "@/pages/NewTutorial";
import TutorialDetail from "@/pages/TutorialDetail";
import NoteDetail from "@/pages/NoteDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Metronome from "@/pages/Metronome";
import Test from "@/pages/Test";
import MobileFooter from "@/components/MobileFooter";
import { ApiProvider } from "@/context/ApiContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000, // 10 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <>
          <Switch>
            <Route path="/test" component={Test} />
            <Route path="/" component={Home} />
            <Route path="/explore" component={Explore} />
            <Route path="/community" component={Community} />
            <Route path="/metronome" component={Metronome} />
            <Route path="/profile" component={Profile} />
            <Route path="/notes/edit/:id" component={EditNote} />
            <Route path="/notes/new" component={EditNote} />
            <Route path="/notes/:id" component={NoteDetail} />
            <Route path="/tutorials/new" component={NewTutorial} />
            <Route path="/tutorials/:id" component={TutorialDetail} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route component={NotFound} />
          </Switch>
          <MobileFooter />
        </>
      </ApiProvider>
    </QueryClientProvider>
  );
}

export default App;
