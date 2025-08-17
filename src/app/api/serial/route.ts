import { NextResponse } from "next/server";
import { SerialPort } from "serialport";

export async function GET() {
  try {
    // List all available serial ports
    const ports = await SerialPort.list();
    return NextResponse.json({ ports });
  } catch (error) {
    console.error("Error listing serial ports:", error);
    return NextResponse.json(
      { error: "Failed to list serial ports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { port, baudRate = 9600 } = await request.json();

    const serialPort = new SerialPort({
      path: port,
      baudRate: baudRate,
    });

    return new Promise((resolve) => {
      serialPort.on("open", () => {
        console.log("Serial port opened");

        let data = "";
        serialPort.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });

        // Read data for 2 seconds then close the port
        setTimeout(() => {
          serialPort.close();
          resolve(NextResponse.json({ data }));
        }, 2000);
      });

      serialPort.on("error", (err) => {
        console.error("Error:", err);
        resolve(
          NextResponse.json(
            { error: "Failed to read from serial port" },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("Error handling serial port:", error);
    return NextResponse.json(
      { error: "Failed to handle serial port request" },
      { status: 500 }
    );
  }
}
