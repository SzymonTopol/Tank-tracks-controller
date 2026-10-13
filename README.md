# Full-Stack RC Tank Controller

This repository represents my all-in-one high-performance, low-latency RC tank control system. It consists of C++ ESP32 firmware (with adjacent connection schematics), a Spring Boot Java backend and a React frontend, packaged neatly in a Docker container. I built this project from the ground up without basing it on any other solution. I designed the system with low-latency in mind (which is done by the custom UDP protocol). The project implements a real-time WebSocket telemetry as well as 4 different types of tank movement tied together via the frontend (2 gamepad types, WSAD, joystick/mouse).

https://github.com/user-attachments/assets/64f7951b-46b9-4f44-b062-c765f10541f5

## 🏗️ Repository Layers

The repository consists of 3 distinct layers, that determine the work of the controller:

* **`frontend/` (React + Vite):** Operating panel. Generates telemetry charts in real time (using Recharts), battery charge status and control sliders for configuring PID. It reads Gamepad API and normalizes the input signals from the keyboard (WSAD) or the joystick to send differential track control commands.
* **`backend/` (Java Spring Boot):** Network bridge. It shares the REST API interface to the configuration and a WebSocket server (`/ws/tank`) for the frontend. Backend uses a dedicated asynchronous thread listening for the UDP packets, which translates them into the high-frequency telemetry, without blocking or slowing down the main application thread. 
* **`firmware/` (ESP32 C++ via PlatformIO):** The execution layer on the hardware level. It creates its own Wi-Fi Access Point (`RC_Tank_Network`), translates incoming network commands and operates the DC motors. It also saves the set PID parameters in the non-volatile memory, which allows the settings to be persistent even after turning off power. A custom `PID` class serves as a slew-rate limiter, transforming the sudden power demands into smooth, exponential acceleration curves that prevent track slippage.

## 📡 Two protocols networking concept

Data streams, based on how important they are at the given moment, are split into two protocols: `UDP` and `HTTP REST`.

* **UDP (High-Frequency Control & Telemetry)** guarantees that the tank reacts to the movement commands instantly, and ensures the telemetry data is up to date for the charts to draw.

  This is because the engine commands sent from the frontend and the telemetry updates from the tank (in the 20ms time window) are packaged in compact byte arrays (`PacketCodec`). Despite heavy focus on speed, packets are strictly validated for size and ID on both sides (sending and receiving) before usage to avoid unwanted data.
* **HTTP REST (Configuration & State)** is responsible for critical low-frequency operations - such as updating the PID parameters, or triggering the emergency brake.

  They use standard API endpoints HTTP GET/POST, guaranteeing delivery and allowing validation from the ESP32 microcontroller before its implementation.

## 🔌 Hardware & Circuit Diagram

![Circuit Diagram](firmware/Circuit%20diagram.png)

* The tank's brain is an **ESP32 Microcontroller**, responsible for managing the Wi-Fi Access Point, receiving and sending UDP packets and generating PWM signals for the DC motors.  

* **L298N Motor Driver** is used for powering and steering the DC motors for both left and right tracks.

* Two 4-channel bi-directional level shifters safely bridge the 3.3V ESP32 logic signals to the 5V L298N inputs, minimizing the risk of reverse voltage flow.

* Direct voltage from the battery is lowered by **LM2596 Buck Converter** to safely power the logic components.

* **Voltage Divider (100kΩ / 10kΩ)** scales down the raw battery voltage to a safe 0-3.3V range for the ESP32's ADC pin (AN_READ_PIN), allowing the system to track the battery percentage (which can be later displayed on the frontend).

## 🚀 Getting Started

The easiest way to run the frontend and backend is by using Docker. Both environments can be started with a single command using Docker Compose. However, the firmware must first be manually uploaded to the ESP32.

### Quick Start (Docker Compose)

Prerequisites: Docker and Docker Compose installed on the host machine.

1. Prepare the ESP32 hardware and connect to its Wi-Fi network (see **1. Firmware (ESP32)** below for detailed steps).
2. From the root of the repository, start the containers by running:

```bash
docker compose up --build

```

3. Open a web browser and navigate to `http://localhost:5173` to access the control panel.

---

### Manual Setup (Local Development)

To run the system locally, all three layers must be started.

### 1. Firmware (ESP32)

1. Open the `firmware` folder in VS Code with the **PlatformIO** extension installed.


2. Connect the ESP32 via USB.
3. Build and upload the project using the PlatformIO toolbar.
4. Once booted, the ESP32 will broadcast a standalone Wi-Fi Access Point (`RC_Tank_Network`). Connect the computer directly to this network (the password is defined in `Config.h`).

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


3. Open the browser to the URL provided by Vite (usually `http://localhost:5173`).

## 🎮 Controls

Depending on the chosen interaction method, the user can choose from 4 control methods.

The frontend dynamically switches between input methods based on physical interaction:

* **Keyboard:** `W` `S` `A` `D` for standard differential driving.
* **On-Screen Joystick:** Click and drag for precise vector control.
* **Gamepad (NFS Mode):** Press `D-Pad UP` to activate. Uses the left stick for steering and triggers (L2/R2) for throttle and brake/reverse.
* **Gamepad (Tank Mode):** Press `D-Pad DOWN` to activate. Uses the left and right triggers to independently control the speed of the left and right tracks, with bumpers (L1/R1) toggling reverse direction.

### Automated & Manual Safety Overrides

* **Emergency Halt:** A dedicated HALT button in the UI immediately wipes the PID memory and cuts motor power. This state is authoritative and maintained on the ESP32 - meaning the tank stays safely locked down even if the frontend client disconnects or refreshes.
* **Dead-Man Switch:** The ESP32 firmware includes a watchdog deadline timer. If the microcontroller stops receiving valid UDP movement commands within a specified time threshold (e.g., the controller disconnects or the Java backend crashes), the tank will automatically trigger a self-halt to prevent a runaway vehicle.

https://github.com/user-attachments/assets/311b3104-aa52-4dd8-b089-be26869ca782
