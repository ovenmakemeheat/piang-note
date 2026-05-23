---
title: Arduino UNO Q Summary
slug: arduino-uno-q-depa
excerpt: Arduino UNO Q combines a Linux-capable MPU and real-time MCU for edge AI, multimedia, networking, and hardware control.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - app-lab-0-5-0
  - bridge
  - rpc-call
  - modulino
  - bricks
---

# Summary: ArduinoUNOQ_Depa

## ภาพรวม

เอกสารนี้แนะนำ Arduino UNO Q ในฐานะบอร์ด hybrid ที่รวมพลังของ Linux microprocessor และ real-time microcontroller ไว้บนบอร์ดเดียว แนวคิดหลักคือการยกระดับจากบอร์ด Arduino แบบ “Blink” ไปสู่บอร์ดที่สามารถ “Think” หรือประมวลผล AI, multimedia, networking, และควบคุม hardware แบบ real-time ได้พร้อมกัน

## แนวคิด From Blink to Think

Arduino UNO Q ไม่ได้เป็นเพียง microcontroller board สำหรับควบคุม pin หรือทำไฟกระพริบ แต่เป็น platform สำหรับงาน edge computing และ AI:

- ประมวลผลระดับสูงด้วย MPU ที่รัน Linux
- ควบคุม hardware แบบ deterministic ด้วย MCU
- รวม Arduino sketch, Python script, และ AI model ไว้ในแอปเดียว
- เหมาะกับงาน robotics, smart home, smart kiosk, และ visual inspection

## สถาปัตยกรรมสองสมอง

UNO Q ใช้สถาปัตยกรรมแบบ hybrid:

- Qualcomm Dragonwing QRB2210 เป็น MPU สำหรับงาน Linux, Python, AI, networking, graphics, camera, Docker
- STM32U585 เป็น MCU สำหรับงาน real-time, GPIO, sensor, actuator, PWM, ADC และ control logic

การแยกบทบาทแบบนี้ทำให้บอร์ดสามารถทำงานหนัก เช่น vision AI หรือ web UI บนฝั่ง Linux พร้อมกับควบคุม hardware ที่ต้องตอบสนองเร็วบนฝั่ง MCU

## โหมดการใช้งาน

เอกสารกล่าวถึงสองโหมดหลัก:

- Standalone Mode: ต่อจอ, keyboard, mouse เข้ากับ UNO Q แล้วใช้งาน Arduino App Lab บนบอร์ดโดยตรง ไม่ต้องใช้ PC
- PC-Connected Mode: เชื่อมต่อ UNO Q กับคอมพิวเตอร์ผ่าน USB-C หรือ network แล้วรัน App Lab จาก PC เพื่อประสบการณ์ที่คุ้นเคยกว่า

สาระสำคัญคือ App Lab พยายามทำให้ประสบการณ์การพัฒนาเหมือนกัน ไม่ว่าจะใช้งานบนบอร์ดโดยตรงหรือผ่านคอมพิวเตอร์

## สเปกฮาร์ดแวร์สำคัญ

- MPU: Quad-core Arm Cortex-A53 สูงสุด 2.0 GHz
- GPU: Qualcomm Adreno 3D
- Camera ISP: รองรับกล้อง 13 MP + 13 MP หรือ 25 MP
- RAM: 2 GB หรือ 4 GB LPDDR4 แล้วแต่รุ่น
- Storage: 16 GB หรือ 32 GB eMMC แล้วแต่รุ่น
- Connectivity: Wi-Fi 5 และ Bluetooth 5.1
- MCU: STM32U585, Arm Cortex-M33 สูงสุด 160 MHz, Flash 2 MB, SRAM 786 KB
- Power: USB-C 5 V สูงสุด 3 A หรือ VIN 7-24 V
- USB-C: รองรับ host/device, power role switching และ video output
- Interface: I2C/I3C, SPI, PWM, CAN, UART, GPIO, JTAG, ADC
- Extra: RGB LED 4 ดวง, LED matrix 8x13, Qwiic 3.3 V, user button

## ซอฟต์แวร์

- ฝั่ง MPU ใช้ Linux Debian พร้อม upstream support
- ฝั่ง real-time ใช้ Arduino Core บน Zephyr OS
- รองรับ Docker และ Docker Compose
- Arduino App Lab รองรับ Windows 10+, macOS 11+, Ubuntu 22.04+, Debian Trixie แบบ 64-bit

## Connector และการขยายระบบ

UNO Q มี connector หลายแบบเพื่อรองรับอุปกรณ์เสริม:

- Qwiic สำหรับ I2C sensor/module แบบเสียบง่าย ไม่ต้องบัดกรี
- JMEDIA และ JMISC connector สำหรับกล้อง MIPI-CSI, จอ MIPI-DSI, audio analog และ carrier board
- รองรับแนวคิด daisy chaining กับอุปกรณ์บางประเภท

แนวคิดคือบอร์ดหลักสามารถขยายเป็นระบบที่ซับซ้อนได้ผ่าน carrier, shield, Modulino และอุปกรณ์ I2C

## Arduino App Lab

App Lab คือ environment ที่รวมหลายองค์ประกอบ:

- Examples: แอปตัวอย่างที่พร้อมรันและแก้ไข
- Bricks: software building blocks สำหรับงานซับซ้อน เช่น AI, database, web UI, cloud, sensor
- AI Models: โมเดลที่รันบนบอร์ดโดยตรง ไม่ต้องพึ่ง cloud เสมอไป
- Custom Apps: แอปที่ผู้ใช้สร้างเองจากการปรับตัวอย่างหรือประกอบ Bricks ใหม่

## การประยุกต์ใช้งาน

Robotics:

- หุ่นยนต์ส่งของอัตโนมัติ
- หุ่นยนต์ติดตามท่าทาง
- ROS 2 project โดยแนะนำรุ่น RAM 4 GB
- แขนกล DIY พร้อม visual feedback

Smart Home / Building Automation:

- กริ่งประตูอัจฉริยะพร้อม face recognition
- ควบคุมบ้านด้วยเสียงและท่าทาง
- Home Assistant integration
- ศูนย์ควบคุมสภาพอากาศส่วนบุคคล
- ระบบวิเคราะห์การใช้พลังงาน

Prototyping:

- Visual inspection
- Smart kiosk
- Compact edge computer

## ข้อคิดสำคัญ

- UNO Q เป็นสะพานระหว่างโลก Linux และ Arduino real-time control
- จุดแข็งคือการรวม AI, Python, Docker, camera, network และ hardware control ในบอร์ดเดียว
- เหมาะกับงาน edge AI ที่ต้องตอบสนองเร็วและทำงานใกล้แหล่งข้อมูล
- App Lab และ Bricks ทำให้ความซับซ้อนของระบบถูกห่อให้เรียกใช้งานง่ายขึ้น
