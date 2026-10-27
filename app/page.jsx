import Dashboard from "../components/Dashboard";
import CropDoctor from "../components/CropDoctor";
import GovRegister from "../components/GovRegister";

export default function AgriSyncApp() {
  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <Dashboard />
      <CropDoctor />
      <GovRegister />
    </div>
  );
}
