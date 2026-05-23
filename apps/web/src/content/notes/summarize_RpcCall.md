---
title: RpcCall Summary
slug: rpc-call
excerpt: RpcCall provides asynchronous RPC patterns between MCU and MPU code on Arduino UNO Q.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - bridge
  - arduino-uno-q-depa
---

# Summary: RpcCall

## ภาพรวม

เอกสารนี้ต่อยอดจาก Bridge Library โดยเน้นการใช้งาน `RpcCall` ซึ่งเป็น helper class สำหรับการเรียก RPC แบบ asynchronous ระหว่าง MCU และ MPU บน Arduino UNO Q แนวคิดหลักคือ “โทรไปแล้วไม่รอ” ให้ฝั่งที่เรียกทำงานอื่นต่อได้ และค่อยเรียก `.result()` เมื่อต้องการผลลัพธ์

## Bridge และ RPC บน UNO Q

Bridge เชื่อมฝั่ง Linux/MPU กับฝั่ง STM32/MCU ผ่าน RPC ทำให้แต่ละฝั่งเรียกฟังก์ชันของกันและกันได้ โดยใช้:

- `provide()` สำหรับประกาศ service
- `provide_safe()` สำหรับ callback ที่รันใน main loop อย่างปลอดภัยบน MCU
- `call()` สำหรับเรียก service
- `notify()` สำหรับส่ง event โดยไม่รอผล

## provide() กับ provide_safe()

| ประเด็น | provide() | provide_safe() |
|---|---|---|
| thread | background RPC thread | main loop |
| priority | สูง | ปกติ |
| Arduino API | ไม่แนะนำ | แนะนำ |
| เสถียรภาพ | เสี่ยงกว่า | ปลอดภัยกว่า |
| เหมาะกับ | logic สั้น ๆ / flag | GPIO, Serial, I/O |

สาระสำคัญคือถ้าจะควบคุม hardware บน MCU ควรใช้ `provide_safe()` เพื่อให้ callback ทำงานใน context ของ `loop()`

## ข้อจำกัดของ Python และ C++

เอกสารย้ำว่า:

- ฝั่ง Python ไม่มี `provide_safe()` เพราะไม่จำเป็นในบริบท Linux
- ใน workflow ที่ C++ เรียก Python ฝั่ง C++ ไม่ควรคิดว่าจะรับ return โดยตรงได้เสมอ
- `call()` และ `notify()` จาก C++ ไป Python อาจต้องออกแบบเป็น asynchronous flow

แนวทางแก้:

1. C++ ส่งข้อมูลไป Python
2. Python ทำงานหรือคำนวณ
3. Python ส่งผลลัพธ์กลับมาหา service ที่ C++ provide ไว้

## RpcCall คืออะไร

`RpcCall` เป็นคลาสช่วยสำหรับ asynchronous RPC:

- เรียก RPC แล้วไม่ block ทันที
- โปรแกรมฝั่ง caller ทำงานอื่นต่อได้
- เมื่ออยากได้ผลลัพธ์ค่อยเรียก `.result()`
- `.result()` จะรอผลลัพธ์, ดึงค่าที่ return, และจัดการ error ให้

ภาพรวม flow:

```text
caller -> call() -> ทำงานต่อ
remote side -> provide() -> process -> return
caller -> result() -> รับผลลัพธ์
```

## เหตุผลที่ต้องใช้ asynchronous RPC

เหมาะกับกรณีที่:

- งานอีกฝั่งใช้เวลานาน เช่น AI inference, file processing, network request
- MCU ไม่ควรหยุดรอจนระบบค้าง
- ต้องทำ task อื่นระหว่างรอผล
- ต้องการลด blocking behavior ในระบบ embedded

## ตัวอย่างแนวคิด

สมมติ MCU เป็น “เจ้านาย” และ MPU เป็น “ลูกน้อง”:

1. MCU ส่ง RPC พร้อม `x=10`, `y=5`
2. MCU ทำงานอื่นต่อทันที
3. MPU คำนวณ `x-y`
4. เมื่อพร้อมผลลัพธ์ caller เรียก `.result()`
5. ได้ค่า `5` หรือจัดการ error หากเกิดปัญหา

## call.result()

`call.result()` มีบทบาทสำคัญ:

- block เฉพาะจุดที่เรียก
- ใช้รอผลลัพธ์เมื่อจำเป็น
- ถอดค่าที่ return จาก RPC
- ช่วยจัดการข้อผิดพลาดจากการเรียกข้ามฝั่ง

แนวปฏิบัติที่ดีคืออย่าเรียก `.result()` ทันทีถ้ายังมีงานอื่นทำได้ เพราะจะทำให้ asynchronous call กลับไปเป็น synchronous โดยไม่จำเป็น

## ข้อคิดสำคัญ

- `RpcCall` ใช้เมื่อต้องการเรียก RPC โดยไม่หยุดโปรแกรมทันที
- เหมาะกับงานที่ใช้เวลานานหรือไม่แน่นอน
- ต้องออกแบบจุดที่รอ `.result()` ให้เหมาะสม
- สำหรับงาน hardware บน MCU ยังต้องระวัง thread และเลือก `provide_safe()`
- RPC ที่ดีควรมีชื่อ service ชัดเจน, argument ชัดเจน, และ error handling ที่คาดการณ์ได้
