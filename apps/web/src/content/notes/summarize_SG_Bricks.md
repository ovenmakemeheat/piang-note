---
title: Sound Generator Brick Summary
slug: sound-generator-bricks
excerpt: Sound Generator Brick creates tones, notes, melodies, chords, waveforms, effects, and audio streams from Arduino App Lab code.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - summarize
  - lecture
  - microcontrollers
links:
  - bricks
  - keyword-spotting-slide
  - app-lab-0-5-0
---

# Summary: SG_Bricks

## ภาพรวม

เอกสารนี้อธิบาย Sound Generator Brick หรือ Wave Generator Brick สำหรับสร้างเสียงจากโค้ดบน Arduino App Lab โดยไม่ต้องมีความรู้ด้าน audio synthesis ลึกมาก ผู้ใช้สามารถสร้าง tone, note, melody, chord, waveform และ effect ต่าง ๆ ได้จาก Python API แล้วเล่นออกลำโพงหรือสร้าง audio data เพื่อนำไปใช้ต่อ

## Sound Generator คืออะไร

Sound Generator เป็น Brick สำหรับสร้างและควบคุมเสียงแบบ programmatic:

- สร้างโน้ตดนตรี
- สร้าง tone ด้วยความถี่
- แต่ง melody จากโค้ด
- เล่นเสียงแบบ real-time
- ใช้ waveform หลายแบบ
- ใส่ effect เช่น chorus, delay, vibrato, distortion/overdrive

แนวคิดสำคัญคือเปลี่ยน Arduino UNO Q จากบอร์ดควบคุมทั่วไปให้เป็น audio device ที่ตอบสนองด้วยเสียงได้

## Waveform พื้นฐาน

เอกสารเน้น 4 waveform หลัก:

### Sine

- เสียงบริสุทธิ์
- มีความถี่เดียว
- ไม่มี harmonic อื่น
- เสียงนุ่มและสะอาด
- เหมาะกับ sub bass, tone ทดสอบ, reference

### Square

- มี odd harmonics
- เสียงหนา ดิบ และ digital
- เหมาะกับ retro sound, synth lead, game sound

### Triangle

- มี odd harmonics เหมือน square แต่ harmonic ลดลงเร็วกว่า
- เสียงนุ่มกว่า square
- เหมาะกับ lead ใส, เสียงคล้ายเครื่องเป่า, tone กลาง ๆ

### Sawtooth

- มี harmonic ทุกลำดับ
- เสียงสว่าง แรง และ buzz สูง
- เหมาะกับ pad, supersaw, subtractive synthesis

สรุปคือ 4 waveform นี้เป็นรากฐานของเสียงสังเคราะห์จำนวนมาก เมื่อควบคุม waveform, frequency, amplitude, envelope และ filter ได้ ก็สร้างเสียงได้หลากหลาย

## อุปกรณ์ที่ต้องใช้

ก่อนใช้ Sound Generator:

- USB-C hub พร้อมแหล่งจ่ายไฟภายนอก 5V 3A
- USB audio device เช่นลำโพง USB หรือ adapter USB-C to 3.5 mm
- Arduino UNO Q ใน Network Mode หรือ SBC Mode

## โน้ตและ duration

เอกสารมีตารางตำแหน่งโน้ต เช่น E4, F4, F#4, G4, A4, C5 ฯลฯ และแนวคิด divisor ของโน้ต:

- 1 = whole note = 1.0 วินาที
- 2 = half note = 0.5 วินาที
- 4 = quarter note = 0.25 วินาที
- 8 = eighth note = 0.125 วินาที
- 16 = sixteenth note = 0.0625 วินาที

ค่าจริงสัมพันธ์กับ BPM และ time signature ในบริบทของ composition

## SoundGenerator class

พารามิเตอร์สำคัญ:

- `output_device`: อุปกรณ์เล่นเสียง
- `bpm`: ความเร็วเพลง
- `time_signature`: เช่น `(4, 4)` หรือ `(3, 4)`
- `octaves`: จำนวนช่วงเสียง
- `wave_form`: `sine`, `square`, `triangle`, `sawtooth`
- `master_volume`: 0.0-1.0
- `sound_effects`: list ของ effect

เมธอดสำคัญ:

- `start()`: เริ่มระบบเสียง
- `stop()`: หยุดเสียงทั้งหมด
- `set_master_volume(volume)`: ปรับความดังรวม
- `set_effects(effects)`: ตั้ง effect
- `play(note, note_duration, volume, block)`: เล่นโน้ตเดี่ยวด้วย duration แบบดนตรี
- `play_tone(note, duration, volume, block)`: เล่นโน้ตตามเวลาวินาที
- `play_chord(notes, note_duration, volume, block)`: เล่นหลายโน้ตพร้อมกัน
- `play_polyphonic(notes, as_tone, volume)`: เล่นหลาย track พร้อมกัน
- `play_composition(composition, block)`: เล่นจาก MusicComposition object
- `play_abc(abc_string, volume, block)`: เล่นจาก ABC notation
- `play_wav(wav_file, block)`: เล่นไฟล์ `.wav`
- `play_step_sequence(...)`: เล่น sequence แบบ step/loop
- `stop_sequence()`: หยุด sequence
- `is_sequence_playing()`: ตรวจว่ามี sequence เล่นอยู่หรือไม่

## SoundGeneratorStreamer

SoundGeneratorStreamer สร้าง audio data แต่ไม่เล่นออกลำโพง

เหมาะกับ:

- ส่งเสียงไป WebUI หรือ WebSocket
- ส่ง audio ไป network/app อื่น
- ประมวลผลเสียงเอง
- สร้าง audio array และ duration เพื่อนำไปใช้ต่อ

เมธอดคล้าย SoundGenerator เช่น set waveform, set volume, play, play_tone, play_chord, play_polyphonic, play_abc, play_wav แต่ผลลัพธ์คือ audio data ไม่ใช่เสียงออกจริง

## Sound Effect

### Overdrive

- เพิ่มความแรง/แตกของเสียง
- parameter เช่น `drive`

### ADSR

ควบคุม envelope ของเสียง:

- `attack`: เวลาที่เสียงขึ้นจาก 0 ไปสูงสุด
- `decay`: เวลาลดจากสูงสุดไป sustain
- `sustain`: ระดับเสียงค้าง
- `release`: เวลาที่เสียงค่อย ๆ หายหลังจบโน้ต

### Chorus

- ทำให้เสียงหนาและกว้างขึ้น
- parameter เช่น `depth_ms`, `rate_hz`, `mix`

## LRUDict

LRUDict เป็น cache แบบจำกัดขนาดที่ลบข้อมูลที่ไม่ได้ใช้นานที่สุดออกอัตโนมัติ เหมาะกับไฟล์เสียงที่มีขนาดใหญ่และ RAM บอร์ดมีจำกัด

ข้อดี:

- จำกัด memory
- โหลดเสียงที่ใช้ซ้ำได้เร็วขึ้น
- ลดความเสี่ยง memory เต็ม

## ABC Notation

ABC notation คือรูปแบบเขียนโน้ตดนตรีด้วยตัวอักษร เช่น CDEFGAB แทนการเขียนบนบรรทัดห้าเส้น

แนวคิด:

- CDEFGAB คือโน้ต
- ตัวพิมพ์เล็กเช่น `c` แทน octave สูงกว่า
- `C,` แทน octave ต่ำกว่า
- `C2` ทำให้ยาวขึ้น
- `C/2` ทำให้สั้นลง

## MusicComposition

MusicComposition คือ object สำหรับเก็บโครงสร้างเพลง:

- note
- duration
- BPM
- waveform
- volume
- effects
- composition แบบหลาย track

ถ้า SoundGenerator คือ “คนเล่นเพลง” MusicComposition คือ “โน้ตเพลง/สกอร์เพลง”

## ข้อคิดสำคัญ

- Sound Generator ทำให้ UNO Q สร้างเสียงตอบสนองแบบ real-time ได้
- ความเข้าใจ waveform ช่วยออกแบบ character ของเสียง
- SoundGenerator ใช้เล่นเสียงจริง ส่วน SoundGeneratorStreamer ใช้สร้างข้อมูลเสียง
- effect และ envelope ทำให้เสียงดูเป็นธรรมชาติมากขึ้น
- cache สำคัญเมื่อทำงานกับไฟล์เสียงบนอุปกรณ์ resource จำกัด
