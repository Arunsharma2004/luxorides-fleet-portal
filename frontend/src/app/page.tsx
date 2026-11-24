import { getVehicles } from "@/lib/api";

export default async function Home() {
  const vehicles = await getVehicles();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Luxorides</h1>
      <ul className="mt-4 list-disc pl-6">
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            {vehicle.name} - {vehicle.city}
          </li>
        ))}
      </ul>
    </main>
  );
}