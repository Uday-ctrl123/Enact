# Implementation Plan - Enhanced Legal Assistant

## Task List

- [ ] 1. Enhanced AI Lawyer Persona
  - Enhance system prompt with explicit unbiased behavior rules
  - Add bias detection keywords and validation
  - Implement step-by-step response formatting with clear numbering
  - Add cultural sensitivity checks for Indian context
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [ ] 1.1 Update system prompt in legal-chat function
  - Modify `supabase/functions/legal-chat/index.ts`
  - Add explicit bias prevention rules
  - Enhance step-by-step formatting instructions
  - Add emergency handling protocols
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 1.2 Implement response validation layer
  - Create response validator utility
  - Check for bias indicators in responses
  - Validate step-by-step formatting
  - Add regeneration logic for biased responses
  - _Requirements: 1.2, 1.8_

- [ ] 1.3 Add complexity detection and lawyer recommendation
  - Detect complex legal cases in user queries
  - Add automatic lawyer consultation recommendations
  - Include contact information for legal aid services
  - _Requirements: 1.4_

- [ ] 2. Multilingual Support - Frontend
  - Add language selector component to chat interface
  - Implement language preference storage
  - Create UI translation files for all supported languages
  - Add language detection for user messages
  - _Requirements: 2.1, 2.2, 2.7, 2.8_

- [ ] 2.1 Create LanguageSelector component
  - Create `src/components/chat/LanguageSelector.tsx`
  - Add dropdown with Telugu, Tamil, Hindi, Malayalam, English options
  - Implement language change handler
  - Style with Tailwind CSS
  - _Requirements: 2.1_

- [ ] 2.2 Implement language preference storage
  - Add language field to user preferences
  - Store selection in localStorage for guests
  - Store in database for authenticated users
  - Load preference on app initialization
  - _Requirements: 2.2, 2.8_

- [ ] 2.3 Create UI translation files
  - Install react-i18next library
  - Create translation files for each language in `src/locales/`
  - Translate all UI text (buttons, labels, messages, errors)
  - Implement translation hook
  - _Requirements: 2.7_

- [ ] 2.4 Add language detection service
  - Create `src/services/languageDetection.ts`
  - Implement automatic language detection for user messages
  - Add fallback to user's preferred language
  - _Requirements: 2.3_

- [ ] 3. Multilingual Support - Backend
  - Update legal-chat function to accept language parameter
  - Implement multilingual response generation
  - Add language-specific legal term explanations
  - Update database schema for language support
  - _Requirements: 2.4, 2.5, 2.6, 2.9_

- [ ] 3.1 Update legal-chat Edge Function for multilingual support
  - Modify `supabase/functions/legal-chat/index.ts`
  - Accept language parameter in request
  - Add language-specific system prompt instructions
  - Ensure responses are in requested language
  - _Requirements: 2.4_

- [ ] 3.2 Add language-specific legal term handling
  - Create glossary of common legal terms in all languages
  - Implement term explanation in native language
  - Add English term reference for clarity
  - _Requirements: 2.6_

- [ ] 3.3 Update database schema for language support
  - Add `preferred_language` column to profiles table
  - Add `language` column to messages table
  - Create migration file
  - Apply migration to database
  - _Requirements: 2.8_

- [ ] 4. Document Upload - Frontend
  - Create document upload component
  - Implement file validation and preview
  - Add upload progress indicator
  - Display document analysis results
  - _Requirements: 3.1, 3.2, 3.3, 3.12_

- [ ] 4.1 Create DocumentUpload component
  - Create `src/components/chat/DocumentUpload.tsx`
  - Add file input with drag-and-drop support
  - Implement file type validation (PDF, JPG, PNG, DOCX)
  - Add file size validation (max 10MB)
  - _Requirements: 3.1, 3.2_

- [ ] 4.2 Implement file upload to Supabase Storage
  - Create upload service in `src/services/documentUpload.ts`
  - Upload file to Supabase Storage bucket
  - Generate secure file URL
  - Handle upload errors with retry logic
  - _Requirements: 3.3_

- [ ] 4.3 Create DocumentAnalysis display component
  - Create `src/components/chat/DocumentAnalysis.tsx`
  - Display document type and key points
  - Show step-by-step recommendations
  - Format analysis in collapsible sections
  - _Requirements: 3.7, 3.10_

- [ ] 4.4 Add document reference in chat messages
  - Update Message interface to include document reference
  - Display document icon/thumbnail in message
  - Allow clicking to view full analysis
  - _Requirements: 3.10, 3.11_

- [ ] 5. Document Upload - Backend
  - Create document analysis Edge Function
  - Implement text extraction for different file types
  - Integrate with Gemini API for document analysis
  - Update database schema for document storage
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 5.1 Create analyze-document Edge Function
  - Create `supabase/functions/analyze-document/index.ts`
  - Accept file URL and language parameters
  - Download file from Supabase Storage
  - Return structured analysis
  - _Requirements: 3.5_

- [ ] 5.2 Implement text extraction service
  - Add PDF text extraction using pdf-parse
  - Add image OCR using Tesseract.js or Google Vision API
  - Add DOCX text extraction using mammoth
  - Handle multi-page documents
  - _Requirements: 3.4, 3.8_

- [ ] 5.3 Implement document analysis with Gemini API
  - Create document analysis prompt template
  - Send extracted text to Gemini API
  - Parse and structure the analysis response
  - Include step-by-step recommendations
  - _Requirements: 3.6, 3.7_

- [ ] 5.4 Add regional language OCR support
  - Configure OCR for Telugu, Tamil, Hindi, Malayalam
  - Implement language detection for documents
  - Handle mixed-language documents
  - _Requirements: 3.9_

- [ ] 5.5 Update database schema for document uploads
  - Create `document_uploads` table
  - Add foreign keys to conversations and users
  - Store file metadata and analysis results
  - Create RLS policies for secure access
  - _Requirements: 3.10_

- [ ] 6. Voice Input - Frontend
  - Create voice recorder component
  - Implement audio recording with no time limit
  - Add visual recording indicators
  - Display transcription for confirmation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.17, 4.18, 4.19_

- [ ] 6.1 Create VoiceRecorder component
  - Create `src/components/chat/VoiceRecorder.tsx`
  - Add microphone button with icon
  - Request microphone permissions
  - Implement recording state management
  - _Requirements: 4.1, 4.2_

- [ ] 6.2 Implement audio recording functionality
  - Use MediaRecorder API for audio capture
  - Record in WebM format
  - No time limit on recording
  - Display elapsed time during recording
  - _Requirements: 4.3, 4.5, 4.17_

- [ ] 6.3 Add visual recording indicators
  - Create waveform visualization or pulsing icon
  - Show recording status (active, paused, stopped)
  - Display elapsed time counter
  - Add stop button
  - _Requirements: 4.4, 4.5, 4.6_

- [ ] 6.4 Implement transcription confirmation UI
  - Display transcribed text in editable field
  - Add confirm and retry buttons
  - Allow manual editing before sending
  - _Requirements: 4.8, 4.9_

- [ ] 6.5 Add recording warnings and device checks
  - Show warning after 5 minutes of recording
  - Check for microphone support
  - Hide microphone button if not supported
  - Display helpful error messages
  - _Requirements: 4.18, 4.19_

- [ ] 7. Voice Input - Backend
  - Create speech-to-text Edge Function
  - Integrate with Google Speech-to-Text API
  - Handle multiple languages
  - Store audio files and transcriptions
  - _Requirements: 4.7, 4.14, 4.15, 4.16, 4.20_

- [ ] 7.1 Create speech-to-text Edge Function
  - Create `supabase/functions/speech-to-text/index.ts`
  - Accept audio file and language parameters
  - Upload audio to Supabase Storage
  - Return transcribed text
  - _Requirements: 4.7_

- [ ] 7.2 Integrate Google Speech-to-Text API
  - Configure Google Cloud Speech-to-Text API
  - Support all required languages (Telugu, Tamil, Hindi, Malayalam, English)
  - Use long-running recognition for unlimited duration
  - Enable automatic punctuation
  - _Requirements: 4.7, 4.14_

- [ ] 7.3 Implement noise reduction
  - Add audio preprocessing for noise reduction
  - Enhance speech clarity before transcription
  - Handle background noise gracefully
  - _Requirements: 4.15_

- [ ] 7.4 Add error handling and retry logic
  - Handle transcription failures gracefully
  - Provide clear error messages
  - Allow user to retry or type manually
  - _Requirements: 4.16_

- [ ] 7.5 Update database schema for voice recordings
  - Create `voice_recordings` table
  - Store audio file path and transcription
  - Add language and duration fields
  - Create RLS policies
  - _Requirements: 4.20_

- [ ] 8. Voice Output - Text-to-Speech
  - Create text-to-speech service
  - Implement audio playback controls
  - Add language-specific voice selection
  - Enable/disable audio output option
  - _Requirements: 4.11, 4.12, 4.13_

- [ ] 8.1 Create TextToSpeech service
  - Create `src/services/textToSpeech.ts`
  - Integrate with Google Text-to-Speech API or Web Speech API
  - Support all required languages
  - Generate audio from AI responses
  - _Requirements: 4.11_

- [ ] 8.2 Create AudioPlayer component
  - Create `src/components/chat/AudioPlayer.tsx`
  - Add play, pause, stop, replay controls
  - Display playback progress
  - Show audio waveform visualization
  - _Requirements: 4.12, 4.13_

- [ ] 8.3 Implement auto-play functionality
  - Add user preference for auto-play
  - Automatically play AI responses if enabled
  - Respect browser autoplay policies
  - _Requirements: 4.12_

- [ ] 8.4 Add language-specific voice selection
  - Select appropriate voice for each language
  - Use natural-sounding voices (Neural/WaveNet)
  - Allow user to adjust speech rate
  - _Requirements: 4.11_

- [ ] 9. Integration and Testing
  - Integrate all features into chat interface
  - Test multilingual conversations
  - Test document upload and analysis
  - Test voice input and output
  - Perform end-to-end testing
  - _Requirements: All_

- [ ] 9.1 Integrate features into Chat component
  - Update `src/pages/Chat.tsx` with all new components
  - Add language selector to header
  - Add document upload button
  - Add voice recorder button
  - Ensure proper layout and responsiveness

- [ ] 9.2 Test multilingual functionality
  - Test language switching mid-conversation
  - Verify translations for all UI elements
  - Test language detection accuracy
  - Verify AI responses in all languages

- [ ] 9.3 Test document upload and analysis
  - Test with various document types (PDF, images, DOCX)
  - Test with documents in different languages
  - Verify analysis accuracy and completeness
  - Test error handling for invalid files

- [ ] 9.4 Test voice input and output
  - Test recording with various durations
  - Test transcription accuracy for all languages
  - Test text-to-speech quality
  - Test playback controls

- [ ]\* 9.5 Performance optimization
  - Optimize file upload speed
  - Reduce transcription latency
  - Implement caching for translations
  - Optimize audio streaming

- [ ]\* 9.6 Accessibility testing
  - Test keyboard navigation
  - Verify screen reader compatibility
  - Test with assistive technologies
  - Ensure WCAG 2.1 AA compliance

- [ ] 10. Documentation and Deployment
  - Update user documentation
  - Create API documentation
  - Deploy Edge Functions
  - Update environment variables
  - _Requirements: All_

- [ ] 10.1 Create user guide
  - Document how to use multilingual feature
  - Document how to upload documents
  - Document how to use voice input
  - Create video tutorials

- [ ] 10.2 Update API documentation
  - Document new Edge Functions
  - Document request/response formats
  - Add code examples
  - Document error codes

- [ ] 10.3 Deploy to production
  - Deploy updated Edge Functions
  - Apply database migrations
  - Update environment variables
  - Configure Google Cloud APIs
  - Test in production environment

- [ ] 10.4 Monitor and optimize
  - Set up monitoring for new features
  - Track usage metrics
  - Monitor error rates
  - Optimize based on user feedback
