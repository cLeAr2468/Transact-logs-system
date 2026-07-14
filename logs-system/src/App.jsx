
import Reroutes from "./components/routes/route-pages";
import { Toaster } from "sonner";

function App() {

  return (
    <>
      <Reroutes/>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;