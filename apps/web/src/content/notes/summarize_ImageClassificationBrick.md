---
title: Image Classification Brick Summary
slug: image-classification-brick
excerpt: Image Classification Brick classifies a whole image into labels with confidence scores using pre-trained or custom models.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - bricks
  - image-classification-vs-object-detection
  - object-detection
  - app-lab-0-5-0
---

# Summary: ImageClassificationBrick

## ภาพรวม

Image Classification Brick ใช้สำหรับจำแนกภาพด้วยโมเดล Machine Learning โดยรับ input เป็นภาพทั้งภาพ แล้วส่งกลับผลลัพธ์เป็น class ที่คาดการณ์และ confidence score เหมาะกับโจทย์ที่ต้องการตอบว่า “ภาพนี้คืออะไร” โดยไม่ต้องรู้ตำแหน่งของวัตถุในภาพ

## ความสามารถหลัก

- วิเคราะห์ภาพและจัดหมวดหมู่สิ่งที่อยู่ในภาพ
- ใช้ภาพจากไฟล์ในเครื่องหรือภาพจากกล้องเป็น input
- รองรับโมเดล pre-trained และ custom model จาก Edge Impulse
- ใช้งานผ่าน Python API ที่ง่าย
- รองรับ input แบบ raw bytes, file path และ PIL image
- ปรับค่า confidence threshold และ image type ได้

## หลักการทำงาน

Image classification model จะมองภาพทั้งภาพเป็นหน่วยเดียว แล้วทำนาย class หนึ่งหรือหลายรายการพร้อมคะแนนความมั่นใจ โมเดลไม่บอกตำแหน่งของวัตถุ ดังนั้นถ้าในภาพมีหลายวัตถุ ผลลัพธ์จะยังเป็นการตีความภาพรวม ไม่ใช่การลากกรอบวัตถุ

ผลลัพธ์หลัก:

- class name
- confidence score
- รายการ class ที่ผ่าน threshold

## โมเดลที่เกี่ยวข้อง

เอกสารกล่าวถึง MobileNet V2 ที่ pre-trained บน ImageNet ซึ่งมี 1,000 class สำหรับวัตถุทั่วไป และยังรองรับโมเดลเฉพาะทางจาก Edge Impulse เช่นโมเดลที่ train เพื่อแยก class เฉพาะของผู้ใช้

MobileNet V2 เหมาะกับงานทั่วไปเพราะ:

- มีขนาดเหมาะกับ edge device
- ผ่านการ train กับ ImageNet
- ใช้จำแนกวัตถุทั่วไปจำนวนมากได้

## ตัวอย่าง flow การใช้งาน

1. กำหนด path ของไฟล์ภาพ
2. ตรวจสอบว่าไฟล์มีอยู่จริงด้วย `os.path.exists`
3. สร้าง object `ImageClassification()`
4. อ่านไฟล์ภาพเป็น bytes
5. เรียก `classify(frame, confidence=...)`
6. ตรวจสอบว่าผลลัพธ์มี key `"classification"`
7. วนลูปผลลัพธ์และอ่าน `class_name` กับ `confidence`

ตัวอย่างแนวคิดโค้ด:

```python
from arduino.app_bricks.image_classification import ImageClassification

image_classification = ImageClassification()
out = image_classification.classify(frame, confidence=0.1)

for item in out["classification"]:
    print(item.get("class_name"), item.get("confidence"))
```

## API สำคัญ

### `ImageClassification(confidence: float)`

สร้าง object สำหรับจำแนกภาพ ค่า `confidence` เป็น threshold ขั้นต่ำของผลลัพธ์ ค่าเริ่มต้นประมาณ 0.3

### `classify_from_file(image_path: str, confidence: float)`

ประมวลผลภาพจากไฟล์ในเครื่อง

ส่งกลับ:

- dictionary ของผลลัพธ์ classification
- `None` หากเกิดข้อผิดพลาด

### `classify(image_bytes, image_type: str, confidence: float)`

ประมวลผลภาพในหน่วยความจำ เช่น raw bytes หรือ PIL image

พารามิเตอร์สำคัญ:

- `image_bytes`: ข้อมูลภาพ
- `image_type`: เช่น `jpg`, `jpeg`, `png`
- `confidence`: threshold ขั้นต่ำ

### `process(item)`

รับ input ได้สองรูปแบบ:

- string path ของไฟล์ภาพ
- dictionary ที่มี `image` และอาจมี `image_type`

## การตีความผลลัพธ์

ค่า confidence สูงหมายถึงโมเดลมั่นใจมากขึ้น แต่ไม่ได้แปลว่าถูกต้องเสมอไป ต้องพิจารณาคุณภาพภาพ, class ที่โมเดลรู้จัก, dataset ที่ใช้ train และ threshold ที่ตั้งไว้

ถ้าตั้ง threshold ต่ำ:

- เห็นผลลัพธ์มากขึ้น
- เสี่ยง false positive มากขึ้น

ถ้าตั้ง threshold สูง:

- ผลลัพธ์น้อยลงแต่มั่นใจกว่า
- อาจพลาด class ที่ถูกต้องแต่ confidence ต่ำ

## ข้อจำกัด

- ไม่บอกตำแหน่งวัตถุในภาพ
- ถ้ามีหลายวัตถุในภาพ อาจให้ผลลัพธ์ตามสิ่งที่เด่นที่สุดหรือภาพรวม
- หากใช้ MobileNet V2 จะจำแนกได้ดีเฉพาะ class ที่อยู่ใน ImageNet
- งานเฉพาะทางควร train custom model บน Edge Impulse

## ข้อคิดสำคัญ

- ใช้ Image Classification เมื่อโจทย์คือ “ภาพนี้เป็นอะไร”
- ถ้าต้องรู้ตำแหน่งวัตถุ ให้ใช้ Object Detection
- คุณภาพ dataset และความชัดเจนของ class สำคัญมาก
- Brick ช่วยให้การเรียก model inference เหลือเพียงไม่กี่บรรทัด
