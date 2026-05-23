---
title: Keyword Spotting Summary
slug: keyword-spotting-slide
excerpt: Keyword Spotting listens for short voice commands or wake words on edge devices using preprocessing, models, and event callbacks.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - bricks
  - app-lab-0-5-0
  - sound-generator-bricks
---

# Summary: KWS_Slide

## ภาพรวม

เอกสารนี้กล่าวถึง Keyword Spotting (KWS) สำหรับ edge device โดยใช้ Arduino UNO Q และ Keyword Spotting Brick เพื่อให้ระบบสามารถฟังเสียงแบบ real-time และ trigger event เมื่อพบคำสั่งเสียงสั้น ๆ หรือ wake word เช่น “Hey Siri”, “OK Google” หรือคำที่ผู้ใช้ train เอง

## Keyword Spotting คืออะไร

Keyword Spotting คือระบบตรวจจับคำเฉพาะจากเสียงอย่างต่อเนื่อง โดยทั่วไปใช้กับ:

- wake word
- command สั้น ๆ
- ระบบเปิด/ปิดอุปกรณ์ด้วยเสียง
- IoT device ที่ต้องการตอบสนองโดยไม่ส่งเสียงไป cloud ตลอดเวลา

flow พื้นฐาน:

```text
Audio -> Preprocess -> AI Model -> Classify -> Confidence Check -> Event Callback
```

## Pre-processing และ Spectrogram

เสียงดิบมักไม่ถูกส่งเข้า neural network ตรง ๆ แต่จะผ่านการแปลงเป็น feature เช่น spectrogram เพื่อให้โมเดลเห็น pattern ของความถี่ตามเวลาได้ชัดขึ้น

แนวคิดสำคัญ:

- เสียงเป็นสัญญาณเวลา
- โมเดลต้องการ representation ที่เรียนรู้ได้
- DSP และ neural network architecture ของ Edge Impulse ถูกออกแบบให้เหมาะกับ KWS

## Keyword Spotting Brick

ความสามารถ:

- ช่วยให้ Arduino UNO Q ฟังเสียงได้
- รองรับโมเดลสำเร็จรูปและโมเดล Edge Impulse `.eim`
- trigger event เมื่อพบ keyword
- แยก class เช่น keyword, noise, unknown
- ใช้ confidence เพื่อกรอง false positive

ตัวอย่าง output อาจเป็น “On” 95% หรือ class อื่นพร้อม confidence

## คลาสและพารามิเตอร์

```python
KeywordSpotting(confidence=0.9, debounce_sec=3.0)
```

### confidence

- ช่วง 0.0-1.0
- ค่าเริ่มต้นประมาณ 0.8
- ค่าสูงช่วยลด false positive
- แต่ถ้าสูงเกินไปอาจเพิ่ม false rejection

### debounce_sec

- เวลาขั้นต่ำระหว่างการตรวจพบ keyword เดิมซ้ำ
- ใช้ป้องกันการ trigger ซ้ำรัว ๆ
- ค่าเริ่มต้นประมาณ 2 วินาที

### เมธอดสำคัญ

- `on_detect(...)`: ผูก callback เมื่อพบคำ
- `start()`: เริ่มฟัง
- `stop()`: หยุดฟัง
- `get_model_info()`: อ่าน metadata ของโมเดล เช่น labels

## การเตรียม dataset สำหรับ KWS

ระดับจำนวนไฟล์โดยรวม:

- ขั้นต่ำสุด: 20-30 ไฟล์ เหมาะกับทดลอง
- ใช้งานได้จริง: 50-100 ไฟล์ โมเดลเริ่มแม่นขึ้น
- คุณภาพสูง: 150-300 ไฟล์ เหมาะกับใช้งานจริงใน IoT

Edge Impulse มักแบ่งข้อมูล train/test ประมาณ 80/20 ดังนั้นถ้าต้องการ 100 ไฟล์ ควรเตรียมรวม test ด้วย

## ประเภทข้อมูลที่ควรมี

### Keyword

- ประมาณ 50-100 ไฟล์
- ไฟล์ละประมาณ 1 วินาที
- ควรครอบคลุมผู้พูดหลายคน, สำเนียง, ระดับเสียง, โทนเสียง

### Noise

- ประมาณ 30-60 ไฟล์
- ใช้สอนโมเดลให้ไม่สับสนกับเสียงพื้นหลัง
- ควรมีเสียงพัดลม, แอร์, คอมพิวเตอร์, ประตู, traffic, คนคุยไกล ๆ

### Unknown

- ประมาณ 20-50 ไฟล์
- เป็นคำที่ไม่ใช่ keyword หรือคำที่ฟังคล้าย
- ใช้ลด false positive จากคำอื่น เช่น red/dead/said ถ้า keyword คือ bed

## FAR และ FRR

### FAR: False Activation Rate

FAR คืออัตราที่ระบบแจ้งว่าพบ keyword ทั้งที่จริงไม่ใช่

สูตร:

```text
FAR = False Positives / Total Negative Samples
```

ถ้า FAR สูง ระบบไวเกินไป ทำให้ trigger ผิดบ่อย ผู้ใช้รำคาญและไม่เชื่อถือระบบ

### FRR: False Rejection Rate

FRR คืออัตราที่ระบบไม่พบ keyword ทั้งที่จริงมี keyword

สูตร:

```text
FRR = False Negatives / Total Positive Samples
```

ถ้า FRR สูง ระบบเข้มงวดเกินไป ทำให้พลาดคำสั่งจริง

## Trade-off ระหว่าง FAR และ FRR

- เพิ่ม threshold: FAR ลดลง แต่ FRR เพิ่มขึ้น
- ลด threshold: FRR ลดลง แต่ FAR เพิ่มขึ้น

การเลือก threshold ต้องขึ้นกับ use case:

- ระบบเตือนภัยหรือการแพทย์: ยอม false alarm บางส่วนเพื่อไม่พลาดเหตุการณ์จริง
- ระบบเปิดไฟหรืออุปกรณ์ทั่วไป: ควรลด false alarm เพื่อไม่ให้รบกวนผู้ใช้

## การวิเคราะห์ข้อผิดพลาด

เอกสารอธิบายการดู error table:

- False negative: โมเดลพลาด keyword จริง
- False positive: โมเดลทาย keyword ทั้งที่ไม่ใช่
- Label: class ที่เกี่ยวข้อง
- Start time: เวลาที่เกิด error ในไฟล์เสียง
- Play: ฟังช่วงเสียงเพื่อวิเคราะห์

การดู waveform ร่วมกับ error ช่วยให้ปรับ parameter เช่น detection threshold หรือ averaging window ได้ดีขึ้น

## Deploy โมเดล `.eim` บน UNO Q

ขั้นตอนในโหมด Network:

1. สร้าง App เช่น `KWS testing`
2. เข้า terminal บน UNO Q
3. เสียบ flash drive ที่มีไฟล์ `.eim`
4. ตรวจสอบ drive ด้วย `lsblk`
5. mount drive ไปที่ `/media/usb`
6. สร้างโฟลเดอร์โมเดลถ้ายังไม่มี:

```bash
mkdir -p /home/arduino/.arduino-bricks/ei-models/
```

7. copy โมเดล:

```bash
cp /media/usb/KWS_model.eim /home/arduino/.arduino-bricks/ei-models/
```

8. แก้ `app.yaml`:

```yaml
variables: {
  EI_KEYWORD_SPOTTING_MODEL: "/home/arduino/.arduino-bricks/ei-models/KWS_model.eim"
}
```

9. unmount ก่อนถอด USB:

```bash
sudo umount /media/usb
```

## ตัวอย่าง callback

```python
from arduino.app_bricks.keyword_spotting import KeywordSpotting
from arduino.app_utils import App

spotter = KeywordSpotting()
spotter.on_detect("helloworld", lambda: print("Hello world detected!"))
App.run()
```

## ข้อคิดสำคัญ

- KWS ต้องให้ความสำคัญกับ dataset มากพอ ๆ กับโค้ด
- noise และ unknown class สำคัญมากในการลด false positive
- confidence threshold คือจุดปรับสมดุลระหว่าง FAR และ FRR
- การ deploy `.eim` ต้องตั้ง path ใน `app.yaml` ให้ถูกต้อง
- `on_detect()` ทำให้ระบบ event-driven และตอบสนองต่อเสียงได้ทันที
