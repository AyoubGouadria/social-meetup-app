import { Outlet } from "react-router";
import { MessengerButton } from "./MessengerButton";
import CookieConsent from "./CookieConsent";

export function Layout() {
  return (
    <>
      <Outlet />
      <MessengerButton />
      <CookieConsent />
    </>
  );
}
