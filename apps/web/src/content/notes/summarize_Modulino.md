---
title: Modulino Summary
slug: modulino
excerpt: Modulino modules add buttons, sensors, and outputs to Arduino UNO Q through Qwiic/I2C for fast prototyping.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - arduino-uno-q-depa
  - bridge
---

# Summary: Modulino

## ภาพรวม

Modulino คือชุดโมดูลขนาดกะทัดรัดของ Arduino สำหรับการ prototyping อย่างรวดเร็ว โดยเชื่อมต่อผ่านระบบ Qwiic/I2C ทำให้ผู้ใช้เพิ่ม sensor, input, output และ actuator เข้ากับ Arduino UNO Q ได้ง่ายโดยไม่ต้องบัดกรีหรือเดินสายซับซ้อน

## Qwiic บน Arduino UNO Q

UNO Q มีคอนเนกเตอร์ Qwiic สำหรับ I2C โดย:

- ใช้แรงดัน 3.3 V เท่านั้น
- เชื่อมกับ I2C bus ตัวที่ 4 หรือ I2C4
- ในโค้ดใช้งานผ่าน `Wire1` แทน `Wire`
- เหมาะกับการต่อ sensor, display, module และ peripheral แบบ plug-and-play

ข้อควรระวังคืออุปกรณ์ Qwiic ต้องรองรับ 3.3 V และต้องใช้ bus ให้ถูก

## Modulino Buttons

โมดูลปุ่มกดอัจฉริยะ มี:

- ปุ่ม SPST 3 ปุ่ม
- LED indicator 3 ดวง
- MCU STM32C011F4 บนบอร์ด
- สื่อสารผ่าน I2C
- default I2C address: `0x7C`

เหมาะกับ:

- menu navigation
- user interaction
- command control สำหรับ IoT หรือ robot

ฟังก์ชันหลัก:

- `update()`: ขอข้อมูลล่าสุดจากโมดูล
- `isPressed(index)`: ตรวจสอบว่าปุ่มหมายเลข 0, 1, 2 ถูกกดหรือไม่
- `setLeds(A, B, C)`: เปิด/ปิด LED แต่ละดวง

แนวคิดการเขียน logic:

- ถ้าใช้ `if` แยกทุกปุ่ม เมื่อกดหลายปุ่มจะแสดงหลาย event
- ถ้าใช้ `if/else if` จะเลือกปุ่มแรกที่เข้าเงื่อนไข
- สามารถนับจำนวน click ด้วยตัวแปร `int`
- ถ้าต้องการให้ปุ่ม 0, 1, 2 เป็น event แยกกัน ให้สร้าง handler แยก
- ถ้าต้องการให้กดปุ่มไหนก็ถือว่าเหมือนกัน ให้รวมเงื่อนไขใน handler เดียว

## Modulino Pixels

โมดูล RGB LED:

- มี RGB LED รุ่น LC8822-2020 จำนวน 8 ดวง
- ควบคุมผ่าน STM32C011F4
- สื่อสารผ่าน I2C
- default I2C address: `0x6C`

เหมาะกับ:

- light effect
- animation
- status indicator
- visual feedback ใน IoT project

ฟังก์ชันหลัก:

- `set(index, color, brightness)`: ตั้งสีและความสว่างของ LED ดวงที่ระบุ
- `show()`: ส่งค่าที่ตั้งไว้ให้แสดงจริง

สีที่มีตัวอย่าง:

- `RED`
- `BLUE`
- `GREEN`
- `VIOLET`
- `WHITE`

brightness มักเก็บเป็น 8-bit มีช่วง 0-255:

- 0 คือปิด
- 255 คือสว่างสุด

## Modulino Knob

โมดูล rotary encoder:

- ใช้ Quadrature Rotary Encoder
- มีปุ่มกดในตัว
- MCU STM32C011F4
- default I2C address: `0x76`

เหมาะกับ:

- volume control
- brightness control
- menu selection
- numeric adjustment

ฟังก์ชันหลัก:

- `get()`: คืนค่าตัวเลขตามการหมุน
- `isPressed()`: ตรวจสอบปุ่มกดใน knob
- `set()`: reset หรือกำหนดค่าตำแหน่งเริ่มต้น

แนวคิดสำคัญ:

- เป็น incremental encoder ไม่ใช่ potentiometer
- หมุนตามเข็มแล้วค่าเพิ่ม
- หมุนทวนเข็มแล้วค่าลด
- ไม่มีจุดสิ้นสุดทาง software
- ค่าเป็น `int` บนระบบ 32-bit มีช่วงกว้างมาก

## Modulino Thermo

โมดูลวัดอุณหภูมิและความชื้น:

- ใช้ sensor HS3003
- วัด temperature และ relative humidity
- default I2C address: `0x44`

เหมาะกับ:

- environmental monitoring
- indoor climate control
- IoT ที่ต้องการข้อมูลสภาพอากาศ

ฟังก์ชันหลัก:

- `getTemperature()`: คืนค่าอุณหภูมิเป็นองศาเซลเซียส
- `getHumidity()`: คืนค่าความชื้นสัมพัทธ์เป็นเปอร์เซ็นต์
- `Modulino.begin()`: เริ่มระบบ Modulino โดยปกติใช้ `Wire1`

## Modulino Distance

โมดูลวัดระยะทาง:

- ใช้ Time-of-Flight sensor VL53L4CDV0DH/1
- default I2C address: `0x29`

เหมาะกับ:

- proximity detection
- obstacle avoidance
- robot sensor
- smart detection system

ฟังก์ชันหลัก:

- `available()`: ตรวจสอบว่ามีข้อมูลระยะทางใหม่พร้อมอ่านหรือไม่
- `get()`: อ่านค่าระยะทาง โดยค่าเริ่มต้นเป็นเซนติเมตร

## Modulino Movement

เอกสารเริ่มกล่าวถึง Modulino Movement ว่าเป็นโมดูลสำหรับตรวจจับการเคลื่อนไหวและการสั่นสะเทือนอย่างแม่นยำ เหมาะกับงาน motion sensing, vibration monitoring, gesture หรือการตรวจจับ pattern จาก accelerometer/IMU

## ข้อคิดสำคัญ

- Modulino ทำให้ UNO Q ขยาย hardware ได้เร็วผ่าน Qwiic
- ต้องจำว่า Qwiic บน UNO Q ใช้ 3.3 V และ `Wire1`
- แต่ละโมดูลมี default I2C address ของตนเอง
- การออกแบบ logic ควรแยก input, state, output ให้ชัด เช่นปุ่มเป็น input, LED เป็น feedback, knob เป็น numeric control
- Modulino เหมาะกับการทดลองที่ต้องการต่อ sensor หลายตัวโดยลดภาระ wiring
