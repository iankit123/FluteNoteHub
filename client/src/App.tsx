import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyLibrary from "@/pages/MyLibrary";
import Explore from "@/pages/Explore";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import EditNote from "@/pages/EditNote";
import NewTutorial from "@/pages/NewTutorial";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={MyLibrary} />
      <Route path="/explore" component={Explore} />
      <Route path="/community" component={Community} />
      <Route path="/profile" component={Profile} />
      <Route path="/notes/edit/:id" component={EditNote} />
      <Route path="/notes/new" component={EditNote} />
      <Route path="/tutorials/new" component={NewTutorial} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
