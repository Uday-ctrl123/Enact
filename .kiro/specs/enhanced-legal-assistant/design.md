# Design Document - Enhanced Legal Assistant

## Overview

This design document outlines the technical architecture and implementation approach for enhancing the ENACT Legal Assistant with improved AI behavior, multilingual support, document analysis, and voice interaction capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chat UI    │  │  Language    │  │   Voice      │     │
│  │  Component   │  │  Selector    │  │  Recorder    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Document   │  │  Audio       │  │  Message     │     │
│  │   Upload     │  │  Player      │  │  Display     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Edge Functions                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ legal-chat   │  │ analyze-doc  │  │ speech-to-   │     │
│  │  (enhanced)  │  │              │  │    text      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Gemini API  │  │  Google      │  │  Supabase    │     │
│  │  (2.0 Flash) │  │  Cloud APIs  │  │  Storage     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced AI Lawyer Persona

#### System Prompt Enhancement

**Current Implementation:**

- Basic system prompt with Indian legal focus
- Step-by-step response structure
- Unbiased principles mentioned

**Enhanced Implementation:**

```typescript
interface EnhancedSystemPrompt {
  basePersona: string;
  biasDetection: BiasDetectionConfig;
  responseStructure: ResponseTemplate;
  culturalContext: CulturalSensitivityRules;
  emergencyProtocols: EmergencyHandling;
}

interface BiasDetectionConfig {
  prohibitedTerms: string[];
  sensitiveTopics: string[];
  equalityChecks: EqualityRule[];
}

interface ResponseTemplate {
  sections: ResponseSection[];
  stepFormat: StepFormat;
  languageLevel: number; // Grade 8 = 8
}
```

**Implementation Approach:**

1. Enhance system prompt with explicit bias prevention rules
2. Add response validation layer to check for bias indicators
3. Implement step-by-step formatting with clear numbering
4. Add cultural sensitivity checks for Indian context

---

### 2. Multilingual Support

#### Language Detection and Translation

**Architecture:**

```typescript
interface LanguageConfig {
  supportedLanguages: Language[];
  defaultLanguage: Language;
  translationService: TranslationProvider;
}

type Language = "en" | "te" | "ta" | "hi" | "ml";

interface TranslationProvider {
  detect(text: string): Promise<Language>;
  translate(text: string, from: Language, to: Language): Promise<string>;
}
```

**Components:**

1. **LanguageSelector Component**

```typescript
interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}
```

2. **Language Detection Service**

```typescript
class LanguageDetectionService {
  async detectLanguage(text: string): Promise<Language>;
  async translateMessage(message: string, targetLang: Language): Promise<string>;
}
```

3. **UI Translation Service**

```typescript
interface UITranslations {
  [key: string]: {
    en: string;
    te: string;
    ta: string;
    hi: string;
    ml: string;
  };
}
```

**Implementation Strategy:**

1. **Frontend:**
   - Add language selector dropdown in chat header
   - Store language preference in localStorage and user profile
   - Implement i18n library (react-i18next) for UI translations
   - Create translation files for all UI text

2. **Backend:**
   - Use Gemini API's multilingual capabilities
   - Add language parameter to API requests
   - Implement language detection for incoming messages
   - Store language preference in user profile

3. **Database Schema:**

```sql
ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE messages ADD COLUMN language VARCHAR(5) DEFAULT 'en';
```

---

### 3. Document Upload and Analysis

#### Document Processing Pipeline

**Architecture:**

```
Upload → Validation → Storage → Text Extraction → AI Analysis → Response
```

**Components:**

1. **DocumentUpload Component**

```typescript
interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedFormats: string[];
  maxSize: number; // in MB
}

interface UploadedDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  storageUrl: string;
  extractedText?: string;
  analysis?: DocumentAnalysis;
}
```

2. **Document Analysis Service**

```typescript
interface DocumentAnalysis {
  documentType: string;
  keyPoints: KeyPoint[];
  parties: Party[];
  dates: ImportantDate[];
  legalIssues: LegalIssue[];
  recommendations: Recommendation[];
  nextSteps: ActionStep[];
}

interface KeyPoint {
  section: string;
  content: string;
  importance: "high" | "medium" | "low";
  legalRelevance: string;
}
```

3. **Text Extraction Service**

```typescript
class TextExtractionService {
  async extractFromPDF(file: File): Promise<string>;
  async extractFromImage(file: File): Promise<string>; // OCR
  async extractFromDocx(file: File): Promise<string>;
}
```

**Implementation Strategy:**

1. **Frontend:**
   - Add file upload button with drag-and-drop support
   - Implement file validation (type, size)
   - Show upload progress indicator
   - Display extracted text preview
   - Show analysis results in structured format

2. **Backend (Supabase Edge Function):**

```typescript
// analyze-document/index.ts
serve(async (req) => {
  const { fileUrl, fileType, language } = await req.json();

  // 1. Download file from Supabase Storage
  const fileContent = await downloadFile(fileUrl);

  // 2. Extract text based on file type
  const extractedText = await extractText(fileContent, fileType);

  // 3. Send to Gemini with document analysis prompt
  const analysis = await analyzeDocument(extractedText, language);

  // 4. Return structured analysis
  return new Response(JSON.stringify(analysis));
});
```

3. **Gemini API Integration:**

```typescript
const documentAnalysisPrompt = `
You are analyzing a legal document for an Indian citizen.

Document Content:
${extractedText}

Provide a comprehensive analysis in ${language} with:
1. Document Type and Purpose
2. Key Legal Points (numbered list)
3. Parties Involved
4. Important Dates and Deadlines
5. User's Rights and Obligations
6. Potential Issues or Concerns
7. Recommended Actions (step-by-step)
8. When to Consult a Lawyer

Format each section clearly with headers and bullet points.
`;
```

4. **Database Schema:**

```sql
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  analysis JSONB,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 4. Voice Input with Unlimited Duration

#### Voice Recording and Processing Pipeline

**Architecture:**

```
Mic Input → Recording → Audio File → Speech-to-Text → Text Processing → AI Response → Text-to-Speech → Audio Output
```

**Components:**

1. **VoiceRecorder Component**

```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onTranscriptionComplete: (text: string) => void;
  language: Language;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
}
```

2. **Speech-to-Text Service**

```typescript
class SpeechToTextService {
  async transcribe(audioBlob: Blob, language: Language): Promise<string>;
  async transcribeStream(audioStream: MediaStream, language: Language): Promise<string>;
}
```

3. **Text-to-Speech Service**

```typescript
class TextToSpeechService {
  async synthesize(text: string, language: Language): Promise<Blob>;
  async play(audioBlob: Blob): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}
```

4. **AudioPlayer Component**

```typescript
interface AudioPlayerProps {
  audioUrl: string;
  onPlaybackComplete: () => void;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}
```

**Implementation Strategy:**

1. **Frontend - Voice Recording:**

```typescript
// useVoiceRecorder hook
const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecordingComplete(audioBlob);
      chunksRef.current = [];
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, duration, startRecording, stopRecording };
};
```

2. **Backend - Speech-to-Text Edge Function:**

```typescript
// speech-to-text/index.ts
serve(async (req) => {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File;
  const language = formData.get("language") as string;

  // Upload to Supabase Storage
  const { data: uploadData } = await supabase.storage
    .from("voice-recordings")
    .upload(`${userId}/${Date.now()}.webm`, audioFile);

  // Use Google Speech-to-Text API
  const transcription = await transcribeAudio(uploadData.path, language);

  return new Response(JSON.stringify({ text: transcription }));
});
```

3. **Google Speech-to-Text Integration:**

```typescript
async function transcribeAudio(audioPath: string, language: string): Promise<string> {
  const languageCode = getLanguageCode(language); // 'en-IN', 'te-IN', etc.

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: "latest_long",
        },
        audio: {
          uri: audioPath,
        },
      }),
    }
  );

  const result = await response.json();
  return result.results.map((r: any) => r.alternatives[0].transcript).join(" ");
}
```

4. **Text-to-Speech Integration:**

```typescript
async function synthesizeSpeech(text: string, language: Language): Promise<Blob> {
  const voice = getVoiceForLanguage(language);

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voice.languageCode,
          name: voice.name,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.9,
          pitch: 0,
        },
      }),
    }
  );

  const result = await response.json();
  const audioContent = result.audioContent;

  // Convert base64 to Blob
  const audioBlob = base64ToBlob(audioContent, "audio/mp3");
  return audioBlob;
}
```

5. **Database Schema:**

```sql
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  transcription TEXT,
  language VARCHAR(5) DEFAULT 'en',
  duration INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Data Models

### Enhanced Message Model

```typescript
interface EnhancedMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  language: Language;
  created_at: Date;

  // Voice-related fields
  voice_recording_id?: string;
  audio_url?: string;
  transcription?: string;

  // Document-related fields
  document_id?: string;
  document_analysis?: DocumentAnalysis;

  // Metadata
  metadata: {
    isVoiceInput: boolean;
    hasDocument: boolean;
    responseTime: number;
    tokenCount: number;
  };
}
```

### User Preferences Model

```typescript
interface UserPreferences {
  user_id: string;
  preferred_language: Language;
  voice_enabled: boolean;
  auto_play_responses: boolean;
  voice_speed: number; // 0.5 to 2.0
  created_at: Date;
  updated_at: Date;
}
```

## Error Handling

### Error Types and Responses

```typescript
enum ErrorType {
  LANGUAGE_DETECTION_FAILED = "LANGUAGE_DETECTION_FAILED",
  TRANSLATION_FAILED = "TRANSLATION_FAILED",
  DOCUMENT_UPLOAD_FAILED = "DOCUMENT_UPLOAD_FAILED",
  TEXT_EXTRACTION_FAILED = "TEXT_EXTRACTION_FAILED",
  VOICE_RECORDING_FAILED = "VOICE_RECORDING_FAILED",
  SPEECH_TO_TEXT_FAILED = "SPEECH_TO_TEXT_FAILED",
  TEXT_TO_SPEECH_FAILED = "TEXT_TO_SPEECH_FAILED",
  AI_RESPONSE_FAILED = "AI_RESPONSE_FAILED",
}

interface ErrorResponse {
  type: ErrorType;
  message: string;
  userMessage: string; // Translated to user's language
  retryable: boolean;
  suggestedAction: string;
}
```

## Testing Strategy

### Unit Tests

1. **Language Detection**
   - Test detection accuracy for each supported language
   - Test mixed language input handling
   - Test fallback to default language

2. **Document Processing**
   - Test PDF text extraction
   - Test image OCR accuracy
   - Test DOCX parsing
   - Test file validation

3. **Voice Processing**
   - Test audio recording
   - Test speech-to-text accuracy
   - Test text-to-speech quality
   - Test playback controls

### Integration Tests

1. **End-to-End Multilingual Flow**
   - User selects language → sends message → receives response in same language

2. **Document Upload Flow**
   - User uploads document → text extracted → AI analyzes → step-by-step guidance provided

3. **Voice Input Flow**
   - User records voice → transcribed → AI processes → response generated → audio played

### Performance Tests

1. **Document Processing Time**
   - Target: < 10 seconds for 10-page PDF
   - Target: < 15 seconds for image OCR

2. **Voice Processing Time**
   - Target: < 5 seconds for 1-minute audio transcription
   - Target: < 3 seconds for text-to-speech synthesis

3. **Response Time**
   - Target: < 3 seconds for first token
   - Target: < 10 seconds for complete response

## Security Considerations

1. **File Upload Security**
   - Validate file types and sizes
   - Scan for malware
   - Store in secure Supabase Storage with RLS policies

2. **Voice Recording Security**
   - Request explicit microphone permissions
   - Store audio files securely
   - Implement automatic deletion after 30 days

3. **Data Privacy**
   - Encrypt sensitive document content
   - Implement user data deletion on request
   - Comply with Indian data protection laws

## Deployment Strategy

### Phase 1: Enhanced AI Persona (Week 1)

- Update system prompt
- Add bias detection
- Implement step-by-step formatting

### Phase 2: Multilingual Support (Week 2-3)

- Add language selector
- Implement translation service
- Create UI translations

### Phase 3: Document Upload (Week 4-5)

- Implement file upload
- Add text extraction
- Create document analysis function

### Phase 4: Voice Input (Week 6-7)

- Implement voice recording
- Add speech-to-text
- Add text-to-speech
- Create audio player

### Phase 5: Testing & Optimization (Week 8)

- Comprehensive testing
- Performance optimization
- Bug fixes
- User acceptance testing
