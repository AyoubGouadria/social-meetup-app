import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import JoinRequests from "./pages/JoinRequests";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import DesignSystem from "./pages/DesignSystem";
import Notifications from "./pages/Notifications";
import MyEvents from "./pages/MyEvents";
import JoinedEventsNew from "./pages/JoinedEventsNew";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Impressum from "./pages/Impressum";
import TermsAndConditions from "./pages/TermsAndConditions";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "profile-setup",
        Component: ProfileSetup,
      },
      {
        path: "home",
        Component: Home,
      },
      {
        path: "event/:id",
        Component: EventDetails,
      },
      {
        path: "event/:id/requests",
        Component: JoinRequests,
      },
      {
        path: "event/:id/chat",
        Component: Chat,
      },
      {
        path: "chat/:id",
        Component: Chat,
      },
      {
        path: "messages",
        Component: Messages,
      },
      {
        path: "profile/:id?",
        Component: Profile,
      },
      {
        path: "create-event",
        Component: CreateEvent,
      },
      {
        path: "edit-event/:id",
        Component: EditEvent,
      },
      {
        path: "notifications",
        Component: Notifications,
      },
      {
        path: "my-events",
        Component: MyEvents,
      },
      {
        path: "joined-events",
        Component: JoinedEventsNew,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "privacy-policy",
        Component: PrivacyPolicy,
      },
      {
        path: "impressum",
        Component: Impressum,
      },
      {
        path: "terms",
        Component: TermsAndConditions,
      },
      {
        path: "design-system",
        Component: DesignSystem,
      },
    ],
  },
]);