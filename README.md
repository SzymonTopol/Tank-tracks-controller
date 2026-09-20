# Full-Stack RC Tank Controller

A high-performance, low-latency RC tank control system featuring a React frontend, a Spring Boot Java backend, and custom C++ ESP32 firmware. Designed with hardware safety and precise maneuverability in mind, this project implements real-time WebSocket telemetry, dual gamepad control schemes, and a custom PID-based slew rate limiter for smooth motor acceleration.

## 🏗️ Architecture & Stack

The repository is divided into three distinct layers, each handling a specific domain of the controller's operation:

* **`frontend/` (React + Vite):** The operator dashboard. Renders real-time telemetry charts (via Recharts), battery status, and PID configuration sliders. It polls the Gamepad API and normalizes WSAD/Joystick inputs into differential track power commands.
* **`backend/` (Java Spring Boot):** The network bridge. It exposes a REST API for configuration and a WebSocket server (`/ws/tank`) for the frontend. It features a dedicated asynchronous UDP listener thread that processes high-frequency telemetry without blocking or choking the main application runtime.
* **`firmware/` (ESP32 C++ via PlatformIO):** The physical execution layer. It hosts its own Wi-Fi Access Point (`RC_Tank_Network`), parses incoming network commands, and drives the motors. It persists tuned PID configurations to non-volatile memory so settings survive power cycles. A custom `PID` class acts as a slew rate limiter, converting instant power demands into smooth exponential acceleration curves to prevent track slippage.

## 📡 Dual-Protocol Networking Concept

To balance speed and reliability, the system isolates data streams by urgency:

* **UDP (High-Frequency Control & Telemetry):** Motor commands from the frontend and 50Hz telemetry updates from the tank are packed into custom, tightly packed byte arrays (`PacketCodec`). Despite the focus on speed, payloads undergo strict size and packet ID validation on both ends before execution to discard corrupted data. UDP ensures the tank reacts instantly to inputs and never chokes on outdated telemetry if packets drop.
* **HTTP REST (Configuration & State):** Critical, low-frequency operations-like updating PID tuning parameters or triggering an emergency halt-use standard HTTP GET/POST endpoints. This guarantees delivery and allows the ESP32 to validate the configuration before applying it.

## 🔌 Hardware & Circuit Diagram

![Circuit Diagram](firmware/Circuit%20diagram.png)

The physical build relies on standard, reliable maker components wired for safety and logic isolation:

* **ESP32 Microcontroller:** The brain of the tank, handling the AP, UDP reception, and motor PWM generation.


* **L298N Motor Driver:** Controls the high-current DC motors for the left and right tracks.


* **Logic Level Converters:** Two 4-channel bi-directional level shifters safely bridge the 3.3V ESP32 logic signals to the 5V L298N inputs.


* **LM2596 Buck Converter:** Steps down the raw battery voltage to safely power the logic components.


* **Voltage Divider (100kΩ / 10kΩ):** Scales down the raw battery voltage to a safe 0-3.3V range for the ESP32's ADC pin (AN_READ_PIN), allowing the frontend to display real-time battery percentage.



## 🚀 Getting Started (Local Development)

To run the system locally, you will need to start all three layers.

### 1. Firmware (ESP32)

1. Open the `firmware` folder in VS Code with the **PlatformIO** extension installed.


2. Connect your ESP32 via USB.
3. Build and upload the project using the PlatformIO toolbar.
4. Once booted, the ESP32 will broadcast a standalone Wi-Fi Access Point (`RC_Tank_Network`). Connect your computer directly to this network (the password is defined in `Config.h`).

### 2. Backend (Java Spring Boot)

Prerequisites: Java 21 (or compatible JDK) and Maven.

1. Navigate to the `backend` directory:


```bash
cd backend

```


2. Run the Spring Boot application using the Maven wrapper:
```bash
./mvnw spring-boot:run

```


*The backend will start on port 8080 and bind to the ESP32's AP at `192.168.4.1`.*

### 3. Frontend (React)

Prerequisites: Node.js (v18+).

1. Navigate to the `frontend` directory:


```bash
cd frontend

```


2. Install dependencies and start the Vite development server:
```bash
npm install
npm run dev

```


3. Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

## 🎮 Controls & Hardware Safety

The frontend dynamically switches between input methods based on physical interaction.

* **Keyboard:** `W` `A` `S` `D` for standard differential driving.
* **On-Screen Joystick:** Click and drag for precise vector control.
* **Gamepad (NFS Mode):** Press `D-Pad UP` to activate. Uses the left stick for steering and triggers (L2/R2) for throttle and brake/reverse.
* **Gamepad (Tank Mode):** Press `D-Pad DOWN` to activate. Uses the left and right triggers to independently control the speed of the left and right tracks, with bumpers (L1/R1) toggling reverse direction.

### Automated & Manual Safety Overrides

* **Emergency Halt:** A dedicated HALT button in the UI immediately zero-outs the PID memory and cuts motor power. This state is authoritative and maintained on the ESP32-meaning the tank stays safely locked down even if the frontend client disconnects or refreshes.
* **Dead-Man Switch:** The ESP32 firmware includes a watchdog deadline timer. If the microcontroller stops receiving valid UDP movement commands within a specified time threshold (e.g., the controller disconnects or the Java backend crashes), the tank will automatically trigger a self-halt to prevent a runaway vehicle.
