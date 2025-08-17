import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SerialPort {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export default function SerialPortComponent() {
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available serial ports
  const fetchPorts = async () => {
    try {
      const response = await fetch("/api/serial");
      const data = await response.json();
      if (data.ports) {
        setPorts(data.ports);
      }
    } catch (err) {
      setError("Failed to fetch serial ports");
      console.error(err);
    }
  };

  // Read data from selected port
  const readFromPort = async (portPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/serial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          port: portPath,
          baudRate: 9600, // You can make this configurable
        }),
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to read from serial port");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Serial Port Communication</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Available Ports:</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ports.map((port) => (
                <Button
                  key={port.path}
                  variant={selectedPort === port.path ? "default" : "outline"}
                  onClick={() => setSelectedPort(port.path)}
                  className="w-full"
                >
                  {port.path}
                </Button>
              ))}
            </div>
          </div>

          {selectedPort && (
            <div className="space-y-2">
              <Button
                onClick={() => readFromPort(selectedPort)}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reading...
                  </>
                ) : (
                  "Read Data"
                )}
              </Button>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {data && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">Received Data:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2 overflow-auto">
                {data}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
