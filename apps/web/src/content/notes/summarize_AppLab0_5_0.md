---
title: Arduino App Lab 0.5.0 Summary
slug: app-lab-0-5-0
excerpt: App Lab 0.5.0 adds custom AI models, phone camera input, app import/export, and workflow improvements for Arduino UNO Q projects.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - arduino-uno-q-depa
  - bricks
  - image-classification-brick
  - object-detection
  - keyword-spotting-slide
---

# Summary: AppLab0_5_0

## ภาพรวม

เอกสารนี้สรุปความสามารถใหม่ของ Arduino App Lab เวอร์ชัน 0.5.0 โดยเน้นการทำงานกับ AI model แบบกำหนดเอง, การใช้มือถือเป็นกล้อง input, และการจัดการแอปผ่าน command line เพื่อให้การพัฒนาโปรเจกต์บน Arduino UNO Q สะดวกขึ้นทั้งสาย Maker และสาย DevOps/Automation

## ไฮไลต์สำคัญของเวอร์ชัน 0.5.0

- รองรับการสร้างและใช้งาน Custom AI Models ผ่าน Edge Impulse
- สามารถนำโมเดลที่เทรนเสร็จแล้วกลับมาใช้งานกับ Brick ที่เหมาะสมใน App Lab ได้
- ใช้มือถือเป็นกล้อง input ผ่าน IoT Remote App ทำให้ smartphone กลายเป็น vision sensor แบบไร้สาย
- รองรับ command line import/export สำหรับแอป ช่วยให้ backup, restore, share, และ automate workflow ได้ง่ายขึ้น
- ปรับปรุง UI เช่นหน้า What’s New, ระบบแจ้งเตือน, และการจำขนาดหน้าต่าง editor
- เพิ่มตัวอย่างโปรเจกต์ใหม่ เช่น Color Your LEDs และ Video Object Detection on Mobile
- แก้บั๊กสำคัญ เช่นปัญหา update check, syntax highlighting ตอนเลื่อนหน้า, และบอร์ดแสดงซ้ำในหน้าเลือกอุปกรณ์

## Custom AI Model และ Edge Impulse

App Lab 0.5.0 ทำให้ workflow ของการสร้างโมเดล AI ง่ายขึ้น:

1. เริ่มจาก App Lab และเลือกสร้างโมเดล AI สำหรับ Brick
2. ระบบพาไปที่ Edge Impulse Studio บน browser
3. ผู้ใช้เก็บข้อมูล, train, tune, และ deploy โมเดลใน Edge Impulse
4. กลับมาที่ App Lab แล้วโมเดลจะพร้อมติดตั้งลงใน Arduino AI Brick ที่เกี่ยวข้อง

แนวคิดสำคัญคือผู้ใช้ไม่จำเป็นต้องใช้เฉพาะโมเดลสำเร็จรูปอีกต่อไป แต่สามารถสร้างโมเดลที่เหมาะกับโจทย์เฉพาะ เช่น image classification, object detection, keyword spotting หรือ sensor anomaly detection ได้เอง

## การติดตั้งโมเดลลง Brick

หลังจาก train โมเดลเสร็จแล้ว โมเดลจะถูกนำมาใช้กับ Brick ที่ออกแบบมาสำหรับงานนั้น เช่น:

- Image Classification Brick สำหรับจำแนกภาพทั้งภาพ
- Object Detection Brick สำหรับตรวจจับวัตถุพร้อมตำแหน่ง
- Keyword Spotting Brick สำหรับตรวจจับคำสั่งเสียง
- Motion/Vibration/Anomaly Brick สำหรับข้อมูล sensor

สาระสำคัญคือ Brick ทำหน้าที่ซ่อนรายละเอียดการโหลดโมเดลและการ inference ทำให้ผู้ใช้เรียกใช้งานผ่าน API ที่ง่ายกว่า

## การใช้มือถือเป็น Vision Sensor

ฟีเจอร์การใช้มือถือเป็นกล้อง input ช่วยลดข้อจำกัดเรื่อง hardware camera:

- ไม่ต้องพึ่งกล้อง USB หรือ camera module เสมอไป
- เหมาะกับงานทดลอง vision AI แบบรวดเร็ว
- สามารถย้ายตำแหน่งกล้องได้ง่าย
- ใช้กับตัวอย่าง video object detection บนมือถือได้

## CLI Import / Export

App Lab 0.5.0 รองรับการ backup และย้ายแอปผ่าน command line

ตัวอย่าง Export:

```bash
arduino-app-cli app export /home/arduino/ArduinoApps/objectdet ThanaBackup.zip --include-data
adb pull /home/arduino/ThanaBackup.zip ~/Desktop/
```

ความหมาย:

- `app export` ใช้ export โฟลเดอร์แอปเป็นไฟล์ `.zip`
- `--include-data` รวมข้อมูลที่เกี่ยวข้องกับแอปไปด้วย
- `adb pull` ใช้ดึงไฟล์ backup ออกจากบอร์ดมายังคอมพิวเตอร์

ตัวอย่าง Import:

```bash
arduino-app-cli app import /home/arduino/ThanaBackup.zip
```

CLI workflow นี้เหมาะกับการย้ายโปรเจกต์ระหว่างเครื่อง, ทำ backup ก่อนแก้ไข, ส่งงานให้ผู้อื่น, หรือใช้ในระบบ automation

## ข้อคิดสำคัญ

- App Lab กำลังขยับจากเครื่องมือทดลองแบบ UI-only ไปสู่ workflow ที่รองรับการพัฒนาแบบจริงจังมากขึ้น
- Edge Impulse เป็นแกนกลางสำหรับการสร้าง custom model
- Brick เป็นชั้น abstraction ที่ทำให้ AI inference ใช้งานง่ายในโปรเจกต์ Arduino
- CLI ช่วยให้การจัดการแอปเป็นระบบและทำซ้ำได้
