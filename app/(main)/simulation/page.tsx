import WarehouseSimulation from "@/components/simulation/warehouse-simulation"
import { fetchInventoryData, fetchInOutData } from "@/lib/api"

export default async function SimulationPage() {
  const [inventoryData, inOutData] = await Promise.all([
    fetchInventoryData(),
    fetchInOutData()
  ]);

  return (
    <div className="flex-1 h-screen bg-white">
      <WarehouseSimulation 
        initialInventoryData={inventoryData}
        initialInOutData={inOutData}
      />
    </div>
  )
}
