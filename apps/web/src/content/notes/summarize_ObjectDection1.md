---
title: Object Detection API Summary
slug: object-detection-api
excerpt: API-focused object detection notes covering detection output, thresholds, overlap, IoU, and non-maximum suppression.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - object-detection
  - image-classification-vs-object-detection
  - bricks
---

# Summary: ObjectDection1

## ภาพรวม

เอกสารนี้เป็นคู่มือเชิง API สำหรับ Object Detection Brick โดยอธิบายการเรียกใช้ Python class, โครงสร้าง output, method สำคัญ และแนวคิดหลังการประมวลผลอย่าง overlap, IoU และ Non-Maximum Suppression (NMS)

## ความสามารถของ Object Detection Brick

- ตรวจจับวัตถุจากภาพในเครื่องหรือจากกล้อง
- แสดงกรอบ bounding box
- คืน class label และ confidence score
- รองรับ JPEG, JPG, PNG
- ปรับ confidence threshold ได้
- ปรับ overlap/NMS threshold ได้
- ใช้งานกับ PIL image หรือ byte stream ได้

## โครงสร้างตัวอย่างโค้ด

โค้ดหลักประกอบด้วย:

- `os` สำหรับตรวจสอบไฟล์
- `ObjectDetection` จาก `arduino.app_bricks.object_detection`
- `time` สำหรับหน่วงเวลา
- `main()` เป็นจุดเริ่มทำงาน

ลำดับการทำงาน:

1. กำหนดไฟล์ภาพ เช่น `Man.jpg`
2. ถ้าไม่พบไฟล์ให้แจ้งและ `return`
3. สร้าง object `ObjectDetection()`
4. เปิดภาพแบบ binary ด้วย `open(img_path, "rb")`
5. อ่านข้อมูลทั้งหมดเป็น `frame`
6. เรียก `detect(frame)`
7. ถ้ามีผลลัพธ์ใน `out["detection"]` ให้ enumerate แต่ละวัตถุ
8. แสดงชื่อวัตถุ, confidence และ bounding box
9. ใช้ `draw_bounding_boxes(frame, out)` เพื่อวาดกรอบ

## โครงสร้าง output

ตัวแปร `out` เป็น dictionary ที่มี key `"detection"` หากตรวจจับได้

ภายใน `"detection"` เป็น list ของ object แต่ละตัว แต่ละรายการมักมี:

- `class_name`
- `confidence`
- `bounding_box_xyxy`

การใช้ `enumerate(out["detection"])` ช่วยให้ได้ทั้งลำดับและ dictionary ของวัตถุแต่ละตัว

## คลาส ObjectDetection

```python
class ObjectDetection(confidence: float)
```

เป็นโมดูลสำหรับตรวจจับวัตถุด้วย machine learning model โดยส่งคืน:

- bounding boxes
- class labels
- confidence scores

## Method สำคัญ

### `detect_from_file(image_path: str, confidence: float)`

ใช้ตรวจจับวัตถุจากไฟล์ภาพในเครื่อง

พารามิเตอร์:

- `image_path`: path ของไฟล์ภาพ
- `confidence`: threshold ขั้นต่ำ หรือ `None` เพื่อใช้ค่า default

ส่งกลับ:

- dict ของผลลัพธ์ detection

### `detect(image_bytes, image_type: str, confidence: float)`

ใช้ตรวจจับจากภาพในหน่วยความจำ เช่น raw bytes หรือ PIL image

พารามิเตอร์:

- `image_bytes`: bytes หรือ PIL image
- `image_type`: `jpg`, `jpeg`, `png`
- `confidence`: threshold ขั้นต่ำ

### `draw_bounding_boxes(image, detections)`

ใช้วาด bounding box ลงบนภาพโดยใช้ PIL

พารามิเตอร์:

- `image`: PIL image หรือ raw bytes
- `detections`: dict ผลลัพธ์จากการตรวจจับ

ส่งกลับ:

- ภาพที่ annotate แล้ว
- `None` หากไม่มี detection หรือ image ไม่ถูกต้อง

### `process(item)`

method กลางที่รับ input ได้สองแบบ:

- string path ไปยังไฟล์
- dictionary ที่มี `image` และ optional `image_type`

## Overlap และ IoU

Overlap คือระดับการทับซ้อนระหว่าง bounding boxes โดยนิยมวัดด้วย Intersection over Union (IoU)

```text
IoU = พื้นที่ส่วนที่ทับซ้อนกัน / พื้นที่รวมของกล่องทั้งสอง
```

- IoU = 1 แปลว่ากล่องทับกันสมบูรณ์
- IoU = 0 แปลว่าไม่ทับกันเลย

ใน object detection ค่า overlap ใช้ตัดสินว่ากล่องหลายใบกำลังชี้วัตถุเดียวกันหรือไม่

## Non-Maximum Suppression (NMS)

NMS คือขั้นตอน post-processing เพื่อลบ bounding box ที่ซ้ำซ้อน

ขั้นตอนโดยสรุป:

1. เรียงกล่องตาม confidence จากมากไปน้อย
2. เลือกกล่องที่ confidence สูงสุด
3. เทียบกล่องที่เหลือด้วย IoU
4. ถ้า IoU สูงกว่า threshold ให้ลบกล่องที่ confidence ต่ำกว่า
5. ทำซ้ำจนเหลือกล่องสุดท้ายที่ไม่ซ้ำ

ผลคือระบบไม่แสดงกรอบหลายอันบนวัตถุเดียวกัน

## Confidence Threshold

ใช้กรองผลลัพธ์ตามความมั่นใจ:

- threshold ต่ำ: ตรวจเจอมากขึ้น แต่อาจมี false positive
- threshold สูง: ผลลัพธ์น้อยลง แต่มั่นใจกว่า

ต้องปรับตามงาน เช่นระบบนับวัตถุอาจยอมให้ threshold ต่ำกว่า ในขณะที่ระบบแจ้งเตือนสำคัญอาจต้องตั้งสูง

## ข้อคิดสำคัญ

- Output ของ Object Detection ไม่ใช่แค่ class แต่มีพิกัด bounding box
- `detect()` เหมาะกับภาพที่อ่านมาเป็น bytes
- `detect_from_file()` เหมาะกับ path ตรง ๆ
- NMS สำคัญมากในการลดกล่องซ้ำ
- การเข้าใจ IoU ทำให้ปรับ overlap threshold ได้ดีขึ้น
