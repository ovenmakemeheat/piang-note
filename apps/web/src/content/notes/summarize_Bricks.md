---
title: Arduino App Lab Bricks Summary
slug: bricks
excerpt: Bricks are reusable Arduino App Lab building blocks for AI, data, web UI, cloud, audio, sensors, and external services.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - app-lab-0-5-0
  - image-classification-brick
  - image-classification-vs-object-detection
  - object-detection
  - object-detection-api
  - keyword-spotting-slide
  - sound-generator-bricks
---

# Summary: Bricks

## ภาพรวม

Bricks คือชุดคำสั่งหรือ software building blocks สำเร็จรูปใน Arduino App Lab ที่ออกแบบมาเพื่อห่อความซับซ้อนของงานอย่าง AI, database, web UI, cloud, audio, sensor processing และ external service ให้นักพัฒนาเรียกใช้ผ่าน API ที่เรียบง่าย แทนที่จะต้องเขียนโค้ดจำนวนมากด้วยตนเอง

## แนวคิดหลักของ Brick

Brick ถูกออกแบบมาเพื่อ:

- ทำให้การออกแบบแอปง่ายขึ้น
- ลดความซับซ้อนของการเขียนโค้ด
- เปิดให้ใช้งานความสามารถขั้นสูงด้วยโค้ดไม่กี่บรรทัด
- ซ่อนรายละเอียดภายใน เช่น model loading, driver handling, protocol, API key, Docker, JSON encoding และ configuration
- ทำให้ Brick หลายชนิดมีรูปแบบการใช้งานที่คล้ายกัน แม้หน้าที่จะต่างกัน

เปรียบได้กับ “เลโก้ของโค้ด” ที่นำมาต่อกันเพื่อสร้างระบบที่ซับซ้อนได้เร็วขึ้น

## กลุ่ม Bricks ทั้ง 19 รายการ

### Database / Data

1. Database - SQL: จัดเก็บและจัดการข้อมูลเชิงโครงสร้างด้วย SQLite
2. Database - Time Series: จัดเก็บข้อมูลตามลำดับเวลาผ่าน InfluxDB เช่น sensor, log, telemetry

### Vision / Image / Video

3. Image Classification: จำแนกภาพเป็น class พร้อม confidence
4. Video Image Classification: จำแนกภาพจากวิดีโอแบบต่อเนื่อง
5. Object Detection: ตรวจจับวัตถุจากภาพ พร้อม bounding box
6. Video Object Detection: ตรวจจับวัตถุแบบ real-time จากวิดีโอ
7. Visual Anomaly Detection: ตรวจจับความผิดปกติในภาพ เช่น defect/outlier
8. Camera Code Detection: ตรวจจับ QR code, barcode หรือ code pattern จากกล้อง

### Sensor / Text / Audio

9. Mood Detection: วิเคราะห์อารมณ์จากข้อความ เช่น positive/negative/neutral
10. Motion Detection: ตรวจจับรูปแบบการเคลื่อนไหวจาก accelerometer
11. Vibration Anomaly Detection: ตรวจจับความผิดปกติจากข้อมูลการสั่น
12. Audio Classification: จำแนกเสียง เช่น noise, clap, voice
13. Keyword Spotting: ตรวจจับคำสั่งเสียงสั้น ๆ หรือ wake word

### Audio

14. Wave Generator / Sound Generator: สร้างสัญญาณเสียงหรือ waveform สำหรับ audio synthesis

### Cloud / AI / LLM

15. Arduino Cloud: เชื่อมต่ออุปกรณ์กับ Arduino Cloud และ Dashboard
16. Cloud LLM: เชื่อมต่อ Large Language Model ผ่าน API key เพื่อใช้งาน AI ด้านภาษา

### External Service / Data

17. Weather Forecast: ดึงข้อมูลพยากรณ์อากาศจากบริการภายนอก เช่น Open-Meteo

### Web / UI

18. WebUI - HTML: สร้าง web server ขนาดเล็กด้วย HTML/CSS/JavaScript
19. WebUI - Streamlit: สร้าง web app แบบ interactive ด้วย Python และ Streamlit

## รายละเอียดเชิงแนวคิดของ Brick สำคัญ

### Database - SQL

ใช้จัดการ SQLite ผ่าน API ที่ง่ายขึ้น จุดสำคัญคือช่วยสร้าง table, แก้ไขข้อมูล, query ข้อมูล, จัดการ connection, จัดเก็บไฟล์ และ handle error ให้เป็นระบบ เหมาะกับข้อมูลโครงสร้าง เช่นตารางข้อมูล sensor, user setting, log หรือ state ของแอป

### Database - Time Series

ออกแบบสำหรับข้อมูลที่มีเวลาเป็นแกนหลัก เช่น sensor reading, telemetry, machine log โดยเชื่อมกับ InfluxDB รองรับการสรุปผล เช่น average, maximum และ retention policy สำหรับควบคุมระยะเวลาเก็บข้อมูล

### Image Classification

รับภาพทั้งภาพแล้วทำนายว่าเป็น class ใด เหมาะกับโจทย์ “ภาพนี้คืออะไร” เช่น cat/dog, material type, object category ผลลัพธ์หลักคือ class name และ confidence ไม่ระบุตำแหน่งวัตถุในภาพ

### Object Detection

ตรวจจับวัตถุหลายตัวในภาพ พร้อม class, confidence และ bounding box เหมาะกับโจทย์ที่ต้องรู้ทั้ง “มีอะไร” และ “อยู่ตรงไหน” เช่นนับคน, นับรถ, ตรวจกล่องสินค้า, หุ่นยนต์หลบสิ่งกีดขวาง

### Video Bricks

Video Image Classification และ Video Object Detection ขยายแนวคิดจากภาพนิ่งไปสู่ stream วิดีโอแบบ real-time โดยมี callback/event-driven logic เพื่อให้แอปตอบสนองเมื่อพบ class หรือ object ที่กำหนด

### Visual Anomaly Detection

ใช้ neural network ตรวจหาความผิดปกติในภาพ เหมาะกับงาน quality control หรือ defect detection ผลลัพธ์อาจประกอบด้วย anomaly score และ bounding box ของพื้นที่ผิดปกติ

### Keyword Spotting

ใช้ตรวจจับคำสั่งเสียงสั้น ๆ เช่น wake word หรือ command โดยแยก keyword, noise และ unknown เพื่อให้ระบบตอบสนองต่อเสียงที่ต้องการเท่านั้น

### WebUI

WebUI - HTML เหมาะกับ dashboard/control panel ที่ต้องการความเบาและเข้าถึงผ่าน browser ส่วน WebUI - Streamlit เหมาะกับ UI ที่เขียนด้วย Python และต้องการ visualization หรือ interaction แบบรวดเร็ว

## ตาราง Input / Output แบบสรุป

- Image Classification: input เป็นไฟล์ภาพหรือกล้อง, output เป็น class และ confidence
- Object Detection: input เป็นภาพหรือกล้อง, output เป็น class, confidence, bounding box
- Motion/Vibration: input เป็นแกน x/y/z จาก accelerometer, output เป็น pattern หรือ anomaly score
- Audio/KWS: input เป็นไมค์, output เป็น class เสียงหรือคำสั่ง พร้อม confidence
- Arduino Cloud: input เป็น sensor value และ credential, output เป็น dashboard/control
- Weather Forecast: input เป็นพิกัดหรือเมือง, output เป็นข้อมูลพยากรณ์อากาศ
- WebUI: input เป็น asset/code, output เป็น web server และ URL/IP สำหรับเข้าถึง

## ข้อคิดสำคัญ

- Brick เป็น abstraction layer ที่ช่วยให้ผู้ใช้โฟกัส logic ของโปรเจกต์มากกว่ารายละเอียด infrastructure
- Bricks เปิดทางให้ผู้เริ่มต้นใช้ AI และ service ขั้นสูงได้เร็ว
- สำหรับงานจริง ยังต้องเข้าใจ input/output, confidence threshold, model limitation และ resource ของบอร์ด
- การเลือก Brick ควรเริ่มจากโจทย์: ต้องการ classify, detect, store, visualize, communicate หรือ control
