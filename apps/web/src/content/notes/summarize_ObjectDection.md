---
title: Object Detection Brick Workflow Summary
slug: object-detection
excerpt: Object Detection Brick identifies objects and bounding boxes while covering file preparation, YOLOX inference, and Python API output.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - bricks
  - object-detection-api
  - image-classification-vs-object-detection
  - image-classification-brick
---

# Summary: ObjectDection

## ภาพรวม

เอกสารนี้อธิบายการใช้งาน Object Detection Brick บน Arduino App Lab และ Arduino UNO Q ตั้งแต่การเตรียมไฟล์บน Linux, การ mount flash drive, การ copy ภาพเข้าโฟลเดอร์แอป, ไปจนถึงหลักการตรวจจับวัตถุด้วย YOLOX และการอ่านผลลัพธ์จาก Python API

## Object Detection คืออะไร

Object Detection เป็นงานด้าน Computer Vision ที่ต้องทำสองอย่างพร้อมกัน:

- จำแนกว่าวัตถุคืออะไร
- ระบุตำแหน่งของวัตถุในภาพ

ผลลัพธ์มักประกอบด้วย:

- bounding box
- class label
- confidence score

เหมาะกับโปรเจกต์ เช่น:

- กล้องอัจฉริยะ
- นับจำนวนคนหรือรถ
- หุ่นยนต์หลบสิ่งกีดขวาง
- ยานยนต์ไร้คนขับ
- ระบบเฝ้าระวัง
- เกษตรอัจฉริยะ

## การเตรียมไฟล์บน UNO Q

เอกสารสอน workflow พื้นฐานบน Linux:

- ตรวจสอบ flash drive
- ตรวจสอบ filesystem
- สร้าง mount directory
- mount flash drive
- copy ไฟล์ `.jpg` หรือ `.png` ไปยังโฟลเดอร์ App
- ตรวจสอบว่าไฟล์อยู่ปลายทางจริง
- unmount ก่อนถอด flash drive

แนวคิดสำคัญคือบน Linux ไม่ควรถอด flash drive ทันทีหลัง copy เพราะระบบอาจยังเขียนข้อมูลจาก write buffer ไม่เสร็จ ควร `umount` ก่อนทุกครั้ง

## Object Detection Brick

Brick นี้ช่วยให้:

- ตรวจจับวัตถุจากไฟล์ภาพหรือกล้อง
- ระบุตำแหน่งด้วย bounding box
- คืนค่า confidence และ label
- รองรับไฟล์ JPEG, JPG, PNG
- ปรับ confidence threshold และ NMS/overlap ได้
- ใช้กับ raw bytes หรือ PIL image ได้

## YOLOX

เอกสารระบุว่า Object Detection Brick ใช้ YOLOX ที่ train จาก COCO dataset

YOLOX เป็นโมเดลตระกูล YOLO สำหรับ real-time object detection จุดเด่น:

- Anchor-Free: ไม่ใช้ anchor box ที่กำหนดล่วงหน้า ทำให้โมเดลง่ายและยืดหยุ่นขึ้น
- Decoupled Head: แยกส่วนทำนาย class, bounding box และ confidence ช่วยให้แม่นขึ้น
- SimOTA: วิธี label assignment ที่ช่วยให้ training เสถียรและมีประสิทธิภาพ

COCO dataset มี class มาตรฐาน 80 class สำหรับวัตถุทั่วไป

## Bounding Box

Bounding box คือกรอบสี่เหลี่ยมล้อมรอบวัตถุที่ตรวจพบ โดยมักอยู่ในรูป:

```text
[x_min, y_min, x_max, y_max]
```

ความหมาย:

- `x_min`: พิกัดซ้ายสุด
- `y_min`: พิกัดบนสุด
- `x_max`: พิกัดขวาสุด
- `y_max`: พิกัดล่างสุด

สามารถคำนวณขนาดกล่องได้:

```text
width = x_max - x_min
height = y_max - y_min
```

## ตัวอย่าง flow โค้ด

1. import `ObjectDetection`
2. กำหนด path ภาพ เช่น `Man.jpg`
3. ตรวจสอบไฟล์ด้วย `os.path.exists`
4. สร้าง `ObjectDetection()`
5. อ่านภาพเป็น bytes
6. เรียก `object_detection.detect(frame)`
7. ตรวจว่า output มี key `"detection"`
8. วนลูปผลลัพธ์และอ่าน class, confidence, bounding box
9. เรียก `draw_bounding_boxes(frame, out)` เพื่อวาดกรอบ

ตัวอย่างแนวคิด:

```python
object_detection = ObjectDetection()
out = object_detection.detect(frame)

if out and "detection" in out:
    for i, obj_det in enumerate(out["detection"]):
        print(obj_det.get("class_name"))
        print(obj_det.get("confidence"))
        print(obj_det.get("bounding_box_xyxy"))
```

## การรันครั้งแรก

เมื่อรัน Brick ครั้งแรก บอร์ดอาจต้องดาวน์โหลดไฟล์ที่จำเป็นเข้ามาใน UNO Q ทำให้ใช้เวลานานกว่าปกติ หลังจากนั้นจะเร็วขึ้น

## ข้อคิดสำคัญ

- Object Detection เหมาะเมื่อจำเป็นต้องรู้ตำแหน่งของวัตถุ
- Bounding box คือข้อมูลสำคัญสำหรับ robotics และ automation
- Confidence threshold ใช้ควบคุมความเข้มงวดของผลลัพธ์
- ต้องจัดการไฟล์และ mount/unmount flash drive อย่างถูกต้องบน Linux
- หากงานไม่ต้องการตำแหน่งวัตถุ Image Classification อาจเหมาะและเบากว่า
