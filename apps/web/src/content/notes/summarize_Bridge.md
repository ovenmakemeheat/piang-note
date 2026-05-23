---
title: Arduino UNO Q Bridge Summary
slug: bridge
excerpt: Bridge Library uses RPC to connect Linux MPU logic with STM32 MCU hardware control on Arduino UNO Q.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - arduino-uno-q-depa
  - rpc-call
  - modulino
---

# Summary: Bridge

## ภาพรวม

Bridge Library เป็นกลไกการสื่อสารแบบ Remote Procedure Call (RPC) สำหรับเชื่อมระหว่างฝั่ง Linux/Qualcomm MPU และฝั่ง STM32 MCU บน Arduino UNO Q ทำให้สองโปรเซสเซอร์เรียกใช้ฟังก์ชันของกันและกันได้คล้ายอยู่ในระบบเดียวกัน โดยมี Arduino Router เป็นตัวกลางและใช้แนวคิด MessagePack RPC กับโครงสร้างแบบ star topology

## เป้าหมายของ Bridge

- เชื่อมงานประมวลผลระดับสูงบน Linux กับงานควบคุม hardware แบบ real-time บน MCU
- ให้ Python script เรียกฟังก์ชันบน Arduino sketch ได้
- ให้ Arduino sketch ส่งข้อมูลหรือ event ไปยัง Python ได้
- ลดความยุ่งยากในการออกแบบ protocol เอง
- ทำให้แอปที่มี AI, UI, sensor และ actuator ทำงานร่วมกันได้

## คำสั่งหลัก

### provide()

ใช้ประกาศ service/function ให้ฝั่งอื่นเรียกได้ เมื่อมี RPC request เข้ามา callback จะถูกเรียกจาก background RPC thread ทันที

ข้อดี:

- ตอบสนองเร็ว
- เหมาะกับ logic สั้น ๆ หรือการ set flag

ข้อควรระวัง:

- callback ไม่ได้รันใน main loop
- ไม่เหมาะกับ Arduino API หรือ hardware I/O ที่ต้องการความปลอดภัยของ thread
- มีความเสี่ยงเรื่อง concurrency บนฝั่ง MCU

### provide_safe()

ใช้ประกาศ service แบบปลอดภัยกว่า โดย RPC thread รับ request แล้วฝากงานไว้ให้ `loop()` เป็นผู้เรียก callback

ข้อดี:

- callback รันใน main loop thread
- เหมาะกับ GPIO, Serial, I/O และ Arduino API
- เสถียรกว่าสำหรับงาน hardware

ข้อจำกัด:

- ความสำคัญ/priority ต่ำกว่า `provide()`
- ต้องรอ loop cycle

### call()

ใช้เรียก RPC service อีกฝั่งหนึ่ง และในบางกรณีสามารถรอผลลัพธ์ที่ return กลับมาได้

### notify()

ใช้ส่งข้อความ/event ไปอีกฝั่งโดยไม่ต้องรอผลลัพธ์ เหมาะกับการแจ้งเตือนหรือส่งข้อมูลแบบ fire-and-forget

## provide() เทียบกับ provide_safe()

| ประเด็น | provide() | provide_safe() |
|---|---|---|
| Thread ที่เรียก user function | Background RPC thread | Main loop thread |
| Priority | สูง | ปกติ |
| ใช้ Arduino API | ไม่แนะนำ | แนะนำ |
| ความเสถียร | เสี่ยงกว่า | ปลอดภัยกว่า |
| เหมาะกับ | logic สั้น ๆ / flag | GPIO, Serial, I/O |

แนวคิดสำคัญคือทั้งสองวิธีมีปลายทางคือ MCU เหมือนกัน แต่ “ถนน” ที่ callback วิ่งต่างกัน

## กติกาการใช้งาน Bridge

ฝั่ง Python:

- import `Bridge` และ `App` จาก `arduino.app_utils`
- ถ้าใช้ `provide()` หรือ `provide_safe()` ต้องสร้าง object จาก `Bridge`
- บรรทัดสุดท้ายควรมี `App.run()` เพื่อให้ event loop ทำงาน

ฝั่ง C++:

- include `Arduino_RouterBridge.h`
- ใน `setup()` ต้องเรียก `Bridge.begin()`

กติกาสำคัญ:

- ชื่อ RPC service ต้องตรงกันทั้งสองฝั่ง
- ต้องระวัง thread context เมื่อ callback ไปแตะ hardware

## รูปแบบการสื่อสาร

### Python เป็นผู้ให้บริการ และ C++ เรียกใช้

ฝั่ง C++ สามารถส่งค่าไปยัง Python ผ่าน `call()` หรือ `notify()` ได้ เช่นส่ง `x=10`, `y=5` ให้ Python คำนวณ

### C++ เป็นผู้ให้บริการ และ Python เรียกใช้

Python สามารถเรียก service ที่ C++ provide ไว้ แล้วรับค่ากลับได้ตามรูปแบบที่กำหนด

### กรณี C++ เป็นเจ้านาย Python เป็นลูกน้อง

สไลด์เน้นข้อจำกัดว่า:

- ฝั่ง C++ ไม่สามารถรับ return จาก Python ได้โดยตรงแบบ synchronous ในบาง workflow
- ให้คิดว่า `call()` จาก C++ ไป Python มีพฤติกรรมใกล้กับ `notify()`
- ฝั่ง Python ไม่มี `provide_safe()` เพราะฝั่ง Linux มี resource มากกว่าและไม่จำเป็นในบริบทเดียวกับ MCU

แนวทางแก้คือใช้การตอบกลับแบบสองจังหวะ:

1. C++ ส่งค่าไปให้ Python ด้วย `call()` หรือ `notify()`
2. Python รับค่าด้วย `provide()` แล้วคำนวณ
3. Python ส่งผลลัพธ์กลับไปหา C++ ด้วย `call()`
4. C++ เตรียม `provide()` เพื่อรับผลลัพธ์นั้น

## ข้อคิดสำคัญ

- Bridge คือหัวใจของการทำงานร่วมกันระหว่าง Linux และ MCU บน UNO Q
- ต้องเลือก `provide()` หรือ `provide_safe()` ตามชนิดของงาน ไม่ใช่ตามความสะดวก
- งาน hardware บน MCU ควรรันใน loop thread ผ่าน `provide_safe()`
- งานที่ต้อง return ข้ามฝั่งควรออกแบบ flow ให้ชัด โดยเฉพาะเมื่อ C++ เรียก Python
