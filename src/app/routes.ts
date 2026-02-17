import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import JoinRequests from "./pages/JoinRequests";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import DesignSystem from "./pages/DesignSystem";
import Notifications from "./pages/Notifications";
import MyEvents from "./pages/MyEvents";
import JoinedEventsNew from "./pages/JoinedEventsNew";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/event/:id",
    Component: EventDetails,
  },
  {
    path: "/event/:id/requests",
    Component: JoinRequests,
  },
  {
    path: "/event/:id/chat",
    Component: Chat,
  },
  {
    path: "/profile/:id?",
    Component: Profile,
  },
  {
    path: "/create-event",
    Component: CreateEvent,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/my-events",
    Component: MyEvents,
  },
  {
    path: "/joined-events",
    Component: JoinedEventsNew,
  },
  {
    path: "/design-system",
    Component: DesignSystem,
  },
]);