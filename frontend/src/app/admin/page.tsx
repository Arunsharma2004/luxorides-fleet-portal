import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin | Luxorides",
};

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Operations dashboard</h1>
      <p className="mt-2 text-neutral-400">
        Review bookings, assign chauffeurs and update trip status.
      </p>
      <div className="mt-8">
        <AdminDashboard />
      </div>
    </div>
  );
}