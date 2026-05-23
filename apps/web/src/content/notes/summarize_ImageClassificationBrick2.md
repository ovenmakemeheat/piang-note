---
title: Image Classification vs Object Detection Summary
slug: image-classification-vs-object-detection
excerpt: Compares image classification and object detection workflows, tradeoffs, inputs, outputs, and Arduino App Lab use cases.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - image-classification-brick
  - object-detection
  - object-detection-api
  - bricks
---

# Summary: ImageClassificationBrick2

## ภาพรวม

เอกสารนี้เน้นการเปรียบเทียบ Image Classification Brick กับ Object Detection Brick และสรุป workflow การใช้งาน Image Classification ใน Arduino App Lab โดยชี้ให้เห็นว่า classification เหมาะกับการจำแนกภาพทั้งใบ ส่วน object detection เหมาะกับการหา object พร้อมตำแหน่ง

## Image Classification กับ Object Detection ต่างกันอย่างไร

### Image Classification

- ใช้บอกว่า “ภาพนี้คืออะไร”
- รับ input เป็นภาพทั้งภาพ
- output เป็น class และ confidence
- ไม่ให้ตำแหน่งวัตถุ
- มักใช้ทรัพยากรน้อยกว่า
- เร็วกว่า object detection
- dataset เตรียมง่ายกว่า เพราะไม่ต้องทำ bounding box annotation
- เหมาะกับภาพที่มีวัตถุเด่นหนึ่งชนิดหรือโจทย์ที่ต้องการจำแนกภาพรวม

ตัวอย่างงาน:

- ตรวจว่าเป็นแมวหรือหมา
- แยกสมุด/ปากกา/กรรไกร
- จำแนกพื้นผิวไม้/โลหะ/พลาสติก

### Object Detection

- ใช้บอกว่า “มีอะไร” และ “อยู่ตรงไหน”
- output เป็น class, confidence และ bounding box
- ตรวจหลายวัตถุในภาพเดียวได้
- ใช้ทรัพยากรหนักกว่าและช้ากว่า
- dataset ต้องทำ annotation เป็นกรอบวัตถุ
- เหมาะกับงานนับวัตถุหรือระบุตำแหน่ง

ตัวอย่างงาน:

- ตรวจหาคนหลายคนในภาพ
- นับรถในลานจอด
- ตรวจจับกล่องสินค้าในคลัง
- ระบบนับวัตถุ

## ตารางเปรียบเทียบเชิงแนวคิด

| ประเด็น | Image Classification | Object Detection |
|---|---|---|
| บอกชนิดวัตถุ | ได้ | ได้ |
| ระบุตำแหน่ง | ไม่ได้ | ได้ด้วย bounding box |
| หลายวัตถุในภาพ | ตีความภาพรวม | ตรวจแยกเป็นวัตถุ |
| ความยากของ dataset | ง่ายกว่า | ยากกว่า |
| Annotation | ไม่ต้องลากกรอบ | ต้องลากกรอบ |
| Resource | เบากว่า | หนักกว่า |
| Speed | เร็วกว่า | ช้ากว่า |
| โมเดลที่กล่าวถึง | MobileNet V2 / Edge Impulse | YOLOX Tiny ผ่าน Edge Impulse |

## เหตุผลที่ Image Classification มักแม่นกว่าในงานวัตถุเดียว

เพราะโมเดลไม่ต้องแก้ปัญหาสองอย่างพร้อมกัน Classification สนใจเพียง class ของภาพ ส่วน Object Detection ต้องทั้ง classify และ localize วัตถุ ดังนั้นถ้าโจทย์มีวัตถุเดียวและไม่ต้องรู้ตำแหน่ง classification มักง่ายกว่า เร็วกว่า และใช้ข้อมูลน้อยกว่า

## YOLOX และ Edge Impulse ใน Object Detection

สไลด์ระบุว่า Object Detection Brick ที่ทำงานร่วมกับ Edge Impulse ใช้โมเดลตระกูล YOLOX แบบ Tiny และถูก optimize เป็น Edge Impulse EIM model แบบ quantized เพื่อให้รันบน edge device ได้

ประเด็นสำคัญ:

- train ภาพบน Edge Impulse Studio
- deploy ลง Arduino UNO Q
- โมเดลถูกลดขนาดให้เหมาะกับ edge computing
- เหมาะกับงาน real-time ที่ต้องการตำแหน่งวัตถุ

## ตัวอย่างการใช้ ImageClassification

โครงสร้างหลัก:

```python
from arduino.app_bricks.image_classification import ImageClassification

image_classification = ImageClassification()
out = image_classification.classify(frame)

for i, obj_det in enumerate(out["classification"]):
    detected_object = obj_det.get("class_name", None)
    confidence = obj_det.get("confidence", None)
    print(f"[{i+1}] Object: {detected_object}, Confidence: {confidence}")
```

สิ่งที่ต้องเข้าใจ:

- `classify(frame)` ส่งภาพเข้าโมเดล
- `out["classification"]` เป็น list ของผลลัพธ์
- แต่ละรายการมี class และ confidence
- `enumerate` ใช้เพิ่มลำดับผลลัพธ์

## การจัดการไฟล์ภาพบน Linux

เอกสารมีตัวอย่างการ copy ไฟล์ `.jpg` และ `.png` จากโฟลเดอร์ object detection ไปยังโฟลเดอร์ image classification:

```bash
cp /home/arduino/ArduinoApps/object-detection-brick-testing/*.jpg \
   /home/arduino/ArduinoApps/object-detection-brick-testing/*.png \
   /home/arduino/ArduinoApps/image-classification-brick-testing
```

ตรวจสอบไฟล์ปลายทาง:

```bash
ls /home/arduino/ArduinoApps/image-classification-brick-testing
```

## หมายเหตุเรื่องการรันครั้งแรก

เมื่อเรียกใช้ Brick ครั้งแรก อาจต้องดาวน์โหลดไฟล์หรือ dependency เข้ามาใน Arduino UNO Q ซึ่งอาจใช้เวลานานกว่าปกติ หลังจากนั้นการใช้งานซ้ำจะเร็วขึ้น

## ข้อคิดสำคัญ

- เลือก Image Classification ถ้าต้องการคำตอบระดับภาพ
- เลือก Object Detection ถ้าต้องการตำแหน่งหรือจำนวนวัตถุ
- การเตรียม dataset ของ classification ง่ายกว่า detection มาก
- สำหรับ edge device การเลือกงานที่เรียบง่ายพอจะช่วยให้ระบบเร็วและเสถียรกว่า
