# Update Quiz Generation System - Text & Listening/Speaking Tests

## Tanggal: 6 Januari 2026

## Ringkasan Perubahan

Sistem quiz generation telah diupdate untuk mendukung:
1. **Multiple Choice**: Mix antara Text-based questions dan Listening-based questions (dengan audio script)
2. **Essay**: Mix antara Text-based questions dan Speaking-based questions (voice recording)

## Perubahan Detail

### 1. Multiple Choice Questions

#### Sebelum:
- Hanya generate soal text-based
- Tidak ada field `question_mode` atau `audio_script`

#### Sesudah:
- Generate **8 soal** (sebelumnya 5)
- **50% Text questions** (`question_mode: "text"`)
- **50% Listening questions** (`question_mode: "audio"`)

#### Field Baru:
```typescript
{
  question_mode: "text" | "audio",
  question_text: "string (soal yang dibaca siswa)",
  audio_script: "string | null (script yang akan dibacakan untuk listening test)",
  options: ["string", "string", "string", "string"],
  correct_answer: "0" | "1" | "2" | "3",
  explanation: "string",
  points: 1
}
```

#### Contoh Listening Question:
```json
{
  "question_mode": "audio",
  "audio_script": "Hi, this is Sarah calling from City Library. Your book, 'English Grammar in Use,' is now available for pickup. Please collect it before Friday, or we'll give it to the next person on the waiting list. Our opening hours are 9 AM to 5 PM. Thanks!",
  "question_text": "Why is Sarah calling?",
  "options": [
    "To remind about a library fine",
    "To inform about a book arrival",
    "To ask about opening hours",
    "To cancel a book reservation"
  ],
  "correct_answer": "1",
  "explanation": "...",
  "points": 1
}
```

### 2. Essay Questions

#### Sebelum:
- Hanya generate soal text-based (written essay)
- Tidak ada field `answer_mode`

#### Sesudah:
- **50% Text questions** (`answer_mode: "text"`) - written essay
- **50% Speaking questions** (`answer_mode: "voice"`) - voice recording

#### Field Baru:
```typescript
{
  answer_mode: "text" | "voice",
  question_text: "string (prompt dalam English)",
  expected_word_count: "100-180" (text) | "60-120 seconds" (voice),
  rubric: "string (Bahasa Indonesia dengan sample answer)",
  points: 5
}
```

#### Contoh Speaking Question:
```json
{
  "answer_mode": "voice",
  "question_text": "Describe your favorite hobby and explain why you enjoy it. Include when you usually do it and how it makes you feel.",
  "expected_word_count": "60-120 seconds",
  "rubric": "**Jenis Soal:** Speaking\n\n**Konsep yang Diuji:**\nDeskripsi personal dengan present tense...",
  "points": 5
}
```

### 3. Database Schema

Database sudah support field-field ini melalui migration:
- `quiz_question_multiple_choice.question_mode` - TEXT CHECK ('text', 'audio')
- `quiz_question_multiple_choice.audio_script` - TEXT NULL
- `quiz_question_essay.answer_mode` - TEXT CHECK ('text', 'voice')

### 4. AI Prompt Updates

#### Multiple Choice Prompt:
- Instruksi untuk generate 50% text dan 50% listening questions
- Guidelines untuk audio_script:
  - 40-100 words per script
  - Natural spoken English (contractions OK)
  - Clear context (who, where, what)
  - Age-appropriate untuk SMA/SMK
- Contoh scenarios: conversations, announcements, monologues, instructions

#### Essay Prompt:
- Instruksi untuk generate 50% text dan 50% speaking questions
- Guidelines untuk speaking questions:
  - Focus on oral communication skills
  - Conversational dan natural
  - Test speaking fluency, not just grammar
  - Expected response: 60-120 seconds

### 5. Files Modified

1. **consts.ts** (backup: consts.backup.ts)
   - Updated `SYSTEM_PROMPT_MULTIPLE_CHOICE`
   - Updated `USER_PROMPT_MULTIPLE_CHOICE`
   - Updated `SYSTEM_PROMPT_ESSAY`
   - Updated `USER_PROMPT_ESSAY`

2. **utils.ts**
   - Updated `MultipleChoiceQuestion` interface
   - Updated `EssayQuestion` interface
   - Updated `saveMultipleChoiceQuestions()` untuk handle question_mode & audio_script
   - Updated `saveEssayQuestions()` untuk handle answer_mode

3. **route.ts**
   - Changed count dari 5 ke 8 untuk multiple choice questions

## Next Steps - Audio Generation

Untuk sistem yang lengkap, perlu ditambahkan:

### 1. TTS (Text-to-Speech) Integration
Generate audio dari `audio_script` menggunakan:
- OpenAI TTS API (recommended - natural voice)
- Google Cloud TTS
- ElevenLabs (high quality)

### 2. Audio Storage
- Upload generated audio ke Supabase Storage
- Save URL ke field `quiz_question_multiple_choice.audio_url`

### 3. Implementation Plan
```typescript
// Tambahkan function di utils.ts
async function generateAudioFromScript(
  audioScript: string,
  questionId: string
): Promise<string> {
  // 1. Generate audio menggunakan OpenAI TTS
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy", // atau "nova", "shimmer" untuk female voice
    input: audioScript,
  });

  // 2. Convert to buffer
  const buffer = Buffer.from(await mp3.arrayBuffer());

  // 3. Upload ke Supabase Storage
  const fileName = `quiz-audio/${questionId}.mp3`;
  const { data, error } = await supabase.storage
    .from('quiz-assets')
    .upload(fileName, buffer, {
      contentType: 'audio/mpeg',
    });

  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('quiz-assets')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

### 4. Update saveMultipleChoiceQuestions
```typescript
export async function saveMultipleChoiceQuestions(
  quizId: string,
  questions: MultipleChoiceQuestion[]
) {
  const supabase = await createClient();

  // Insert questions first
  const { data: insertedQuestions } = await supabase
    .from("quiz_question_multiple_choice")
    .insert(questionsToInsert)
    .select();

  // Generate audio for listening questions
  for (const question of insertedQuestions) {
    if (question.question_mode === "audio" && question.audio_script) {
      const audioUrl = await generateAudioFromScript(
        question.audio_script,
        question.id
      );

      // Update question with audio_url
      await supabase
        .from("quiz_question_multiple_choice")
        .update({ audio_url: audioUrl })
        .eq("id", question.id);
    }
  }
}
```

## Testing

Untuk test perubahan:

```bash
# Test quiz generation
curl -X POST http://localhost:3000/api/quiz/create-from-document \
  -H "Content-Type: application/json" \
  -d '{"filePath": "path/to/your/document"}'
```

Verify di database:
```sql
-- Check multiple choice questions
SELECT 
  question_mode,
  audio_script IS NOT NULL as has_audio_script,
  question_text,
  audio_url
FROM quiz_question_multiple_choice
WHERE quiz_id = 'your-quiz-id';

-- Check essay questions
SELECT 
  answer_mode,
  question_text,
  rubric
FROM quiz_question_essay
WHERE quiz_id = 'your-quiz-id';
```

## Notes

- AI akan otomatis generate mix 50-50 untuk text dan listening/speaking
- Audio script disimpan di database, siap untuk di-convert ke audio
- Rubric untuk speaking questions sudah include kriteria pronunciation & fluency
- Explanations include label "Jenis Soal: Text/Listening"
