import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const PRAISE_TEXT = ['Great!', 'Correct!', 'Awesome!'];

function formatElapsed(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return { hours, minutes, seconds };
}

function parsePrompt(prompt) {
  const match = /([0-9]+)\s*\+\s*([0-9]+)/.exec(prompt || '');
  if (!match) {
    return { left: 0, right: 0 };
  }

  return {
    left: Number.parseInt(match[1], 10),
    right: Number.parseInt(match[2], 10),
  };
}

function createAttemptId() {
  return `attempt-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export default function SkillExerciseScreen({ onBack, apiBaseUrl, authToken }) {
  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState(null);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  const [answerInput, setAnswerInput] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [smartScore, setSmartScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [incorrectState, setIncorrectState] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;

    async function startOrResumeSession() {
      if (!apiBaseUrl || !authToken) {
        setLoadError('Please sign in again to continue.');
        setLoadingSession(false);
        return;
      }

      setLoadingSession(true);
      setLoadError('');

      try {
        const progressResponse = await fetch(`${apiBaseUrl}/api/students/me/skills/math-g1-add-001/progress`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (active && progressResponse.ok) {
          const progressPayload = await progressResponse.json();
          if (progressPayload.success) {
            setSmartScore(progressPayload.data.currentPoints ?? 0);
            setQuestionsAnswered(progressPayload.data.questionsAttempted ?? 0);
            setCorrectCount(progressPayload.data.questionsCorrect ?? 0);
          }
        }

        const startResponse = await fetch(`${apiBaseUrl}/api/students/me/skills/math-g1-add-001/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            action: 'RESUME',
            deviceInfo: {
              platform: Platform.OS,
              appVersion: '1.0.0',
            },
          }),
        });

        const startPayload = await startResponse.json();
        if (!startResponse.ok || !startPayload.success) {
          throw new Error(startPayload?.error?.message || 'Unable to start skill session.');
        }

        if (!active) {
          return;
        }

        setSessionId(startPayload.data.session.sessionId);
        setCurrentQuestion(startPayload.data.question);
        setQuestionStartedAt(Date.now());

        if (typeof startPayload.data.progress?.currentPoints === 'number') {
          setSmartScore(startPayload.data.progress.currentPoints);
        }
        if (typeof startPayload.data.progress?.questionsAttempted === 'number') {
          setQuestionsAnswered(startPayload.data.progress.questionsAttempted);
        }
      } catch (error) {
        if (active) {
          setLoadError(error.message || 'Unable to load skill progress.');
        }
      } finally {
        if (active) {
          setLoadingSession(false);
        }
      }
    }

    startOrResumeSession();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, authToken]);

  const elapsed = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);
  const parsedQuestion = useMemo(() => parsePrompt(currentQuestion?.prompt), [currentQuestion]);

  function applyNextQuestion() {
    if (!pendingNextQuestion) {
      return;
    }

    setCurrentQuestion(pendingNextQuestion);
    setPendingNextQuestion(null);
    setAnswerInput('');
    setQuestionStartedAt(Date.now());
  }

  async function handleSubmit() {
    if (!sessionId || !currentQuestion || submitting) {
      return;
    }

    const parsed = Number.parseInt(answerInput.trim(), 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    setSubmitting(true);

    try {
      const responseTimeSeconds = Math.max(0, Math.floor((Date.now() - questionStartedAt) / 1000));
      const response = await fetch(`${apiBaseUrl}/api/students/me/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          attemptId: createAttemptId(),
          questionId: currentQuestion.questionId,
          submittedAnswer: parsed,
          responseTimeSeconds,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message || 'Submit failed.');
      }

      const { result, progress, nextQuestion } = payload.data;

      setSmartScore(result.currentPoints);
      if (progress) {
        setQuestionsAnswered(progress.questionsAttempted);
        setCorrectCount(progress.questionsCorrect);
      }

      setPendingNextQuestion(nextQuestion || null);

      if (result.isCorrect) {
        const praise = PRAISE_TEXT[Math.floor(Math.random() * PRAISE_TEXT.length)];
        setIncorrectState(null);
        setFeedbackText(praise);

        setTimeout(() => {
          setFeedbackText('');
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            setPendingNextQuestion(null);
            setAnswerInput('');
            setQuestionStartedAt(Date.now());
          }
        }, 3000);
      } else {
        setFeedbackText('Sorry, incorrect...');
        setIncorrectState({
          left: parsedQuestion.left,
          right: parsedQuestion.right,
          answer: result.correctAnswer,
          userAnswer: result.submittedAnswer,
        });
        setAnswerInput('');
      }
    } catch (error) {
      setLoadError(error.message || 'Unable to submit answer.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleGotIt() {
    setFeedbackText('');
    setIncorrectState(null);
    applyNextQuestion();
  }

  async function handleBack() {
    try {
      if (sessionId && apiBaseUrl && authToken) {
        await fetch(`${apiBaseUrl}/api/students/me/sessions/${sessionId}/pause`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            pauseReasonCode: 'STUDENT_BREAK',
            pauseReasonText: 'Student pressed back from exercise screen.',
          }),
        });
      }
    } catch (error) {
      // Ignore pause failures to avoid trapping user on this screen.
    } finally {
      onBack();
    }
  }

  if (loadingSession) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#1b8ccc" />
          <Text style={styles.loadingText}>Loading skill progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.exerciseFrame}>
        <View style={styles.mainColumn}>
          <View style={styles.topActions}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Text style={styles.videoText}>Video</Text>
          </View>

          {loadError ? <Text style={styles.loadErrorText}>{loadError}</Text> : null}

          {!!feedbackText && (
            <Text style={[styles.feedbackText, incorrectState ? styles.feedbackError : styles.feedbackSuccess]}>
              {feedbackText}
            </Text>
          )}

          <Text style={styles.promptText}>Add.</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionText}>{parsedQuestion.left}</Text>
            <Text style={styles.questionText}> + </Text>
            <Text style={styles.questionText}>{parsedQuestion.right}</Text>
            <Text style={styles.questionText}> = </Text>
            <TextInput
              value={answerInput}
              onChangeText={setAnswerInput}
              keyboardType="number-pad"
              style={styles.answerInput}
              maxLength={2}
              editable={!submitting}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed, submitting && styles.submitButtonDisabled]}
            disabled={submitting || !currentQuestion}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
          </Pressable>

          {incorrectState ? (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>The correct answer is:</Text>
              <Text style={styles.explanationLine}>
                {incorrectState.left} + {incorrectState.right} = {incorrectState.answer}
              </Text>
              <Text style={styles.explanationLine}>You answered: {incorrectState.userAnswer}</Text>

              <Pressable onPress={handleGotIt} style={styles.gotItButton}>
                <Text style={styles.gotItText}>Got it</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.scorePanel}>
          <View style={styles.blockHeaderGreen}>
            <Text style={styles.blockHeaderText}>Questions answered</Text>
          </View>
          <Text style={styles.largeValue}>{questionsAnswered}</Text>

          <View style={styles.blockHeaderBlue}>
            <Text style={styles.blockHeaderText}>Time elapsed</Text>
          </View>
          <View style={styles.timeGrid}>
            <Text style={styles.timeCell}>{elapsed.hours}</Text>
            <Text style={styles.timeCell}>{elapsed.minutes}</Text>
            <Text style={styles.timeCell}>{elapsed.seconds}</Text>
          </View>
          <View style={styles.timeLabelRow}>
            <Text style={styles.timeLabel}>HR</Text>
            <Text style={styles.timeLabel}>MIN</Text>
            <Text style={styles.timeLabel}>SEC</Text>
          </View>

          <View style={styles.blockHeaderOrange}>
            <Text style={styles.blockHeaderText}>SmartScore out of 100</Text>
          </View>
          <Text style={styles.largeValue}>{smartScore}</Text>

          <Text style={styles.sessionInfoText}>{sessionId ? `Session: ${sessionId.slice(0, 8)}...` : ''}</Text>
          <Text style={styles.sessionInfoText}>Correct answers: {correctCount}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#82cde9',
    padding: 16,
  },
  loadingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    color: '#1f5f79',
    fontWeight: '600',
  },
  exerciseFrame: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dde4ea',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mainColumn: {
    flex: 1,
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#1098d6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  videoText: {
    color: '#5f7f91',
    fontSize: 28,
  },
  loadErrorText: {
    color: '#b12d2d',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 48,
    lineHeight: 54,
    marginBottom: 16,
    fontWeight: '400',
  },
  feedbackSuccess: {
    color: '#2ca937',
  },
  feedbackError: {
    color: '#22a2df',
  },
  promptText: {
    fontSize: 44,
    color: '#151f26',
    marginBottom: 14,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  questionText: {
    fontSize: 44,
    color: '#101820',
  },
  answerInput: {
    width: 90,
    height: 52,
    borderWidth: 2,
    borderColor: '#1aa0dd',
    backgroundColor: '#ffffff',
    fontSize: 38,
    textAlign: 'center',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  submitButton: {
    width: 180,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4eb400',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '600',
  },
  explanationBox: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d8dde2',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  explanationTitle: {
    color: '#5c8a26',
    fontSize: 34,
    marginBottom: 8,
  },
  explanationLine: {
    color: '#0f1b27',
    fontSize: 34,
    marginBottom: 6,
  },
  gotItButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    width: 150,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4eb400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
  scorePanel: {
    width: 170,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#dae3ea',
  },
  blockHeaderGreen: {
    height: 58,
    backgroundColor: '#77b816',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  blockHeaderBlue: {
    height: 58,
    backgroundColor: '#1ea6dd',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  blockHeaderOrange: {
    height: 58,
    backgroundColor: '#ef7a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  blockHeaderText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  largeValue: {
    minHeight: 84,
    fontSize: 70,
    lineHeight: 84,
    textAlign: 'center',
    color: '#4d5a66',
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  timeCell: {
    width: 42,
    textAlign: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#e1e6eb',
    fontSize: 19,
    color: '#586673',
    paddingVertical: 3,
  },
  timeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#8a959f',
    fontWeight: '700',
  },
  sessionInfoText: {
    fontSize: 11,
    color: '#73818c',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
  },
});
