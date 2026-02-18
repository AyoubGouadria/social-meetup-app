import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster />
    </LanguageProvider>
  );
}
