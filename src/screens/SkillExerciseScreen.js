import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const PRAISE_TEXT = ['Great!', 'Correct!', 'Awesome!'];

function createQuestion() {
  const left = Math.floor(Math.random() * 10);
  const right = Math.floor(Math.random() * 10);

  return {
    left,
    right,
    answer: left + right,
  };
}

function formatElapsed(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return { hours, minutes, seconds };
}

export default function SkillExerciseScreen({ onBack }) {
  const [question, setQuestion] = useState(createQuestion());
  const [answerInput, setAnswerInput] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [smartScore, setSmartScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [incorrectState, setIncorrectState] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const elapsed = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

  function moveToNextQuestion() {
    setAnswerInput('');
    setQuestion(createQuestion());
  }

  function handleSubmit() {
    const parsed = Number.parseInt(answerInput.trim(), 10);

    if (Number.isNaN(parsed)) {
      return;
    }

    if (parsed === question.answer) {
      const praise = PRAISE_TEXT[Math.floor(Math.random() * PRAISE_TEXT.length)];
      const increment = Math.max(3, 10 - correctCount);

      setIncorrectState(null);
      setQuestionsAnswered((value) => value + 1);
      setSmartScore((value) => value + increment);
      setCorrectCount((value) => value + 1);
      setFeedbackText(praise);

      setTimeout(() => {
        setFeedbackText('');
        moveToNextQuestion();
      }, 3000);

      return;
    }

    setFeedbackText('Sorry, incorrect...');
    setIncorrectState({
      left: question.left,
      right: question.right,
      answer: question.answer,
      userAnswer: parsed,
    });
    setSmartScore((value) => Math.max(0, value - 3));
    setAnswerInput('');
  }

  function handleGotIt() {
    setFeedbackText('');
    setIncorrectState(null);
    moveToNextQuestion();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.exerciseFrame}>
        <View style={styles.mainColumn}>
          <View style={styles.topActions}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Text style={styles.videoText}>Video</Text>
          </View>

          {!!feedbackText && (
            <Text style={[styles.feedbackText, incorrectState ? styles.feedbackError : styles.feedbackSuccess]}>
              {feedbackText}
            </Text>
          )}

          <Text style={styles.promptText}>Add.</Text>

          <View style={styles.questionRow}>
            <Text style={styles.questionText}>{question.left}</Text>
            <Text style={styles.questionText}> + </Text>
            <Text style={styles.questionText}>{question.right}</Text>
            <Text style={styles.questionText}> = </Text>
            <TextInput
              value={answerInput}
              onChangeText={setAnswerInput}
              keyboardType="number-pad"
              style={styles.answerInput}
              maxLength={2}
            />
          </View>

          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
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
    height: 84,
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
});
