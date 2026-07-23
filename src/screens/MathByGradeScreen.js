import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MATH_GRADES } from '../data/math/grades';
import { loadSubjectsByGrade } from '../data/math/loadSubjectsByGrade';

function splitIntoColumns(list, columns) {
  if (!list.length || columns <= 1) {
    return [list];
  }

  const size = Math.ceil(list.length / columns);
  const bucket = [];

  for (let i = 0; i < columns; i += 1) {
    const start = i * size;
    const end = start + size;
    bucket.push(list.slice(start, end));
  }

  return bucket.filter((group) => group.length > 0);
}

export default function MathByGradeScreen({
  onBack,
  displayName,
  onOpenSkillExercise,
  apiBaseUrl,
  authToken,
  selectedGradeCode,
  onSelectedGradeChange,
}) {
  const [gradePayload, setGradePayload] = useState({ sections: [], title: 'Math skills' });
  const [loading, setLoading] = useState(false);
  const [addTwoNumbersPoints, setAddTwoNumbersPoints] = useState(null);
  const { width } = useWindowDimensions();

  const selectedGrade = useMemo(
    () => MATH_GRADES.find((grade) => grade.code === selectedGradeCode) || MATH_GRADES[0],
    [selectedGradeCode],
  );

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      const data = await loadSubjectsByGrade(selectedGradeCode);
      if (active) {
        setGradePayload(data);
        setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [selectedGradeCode]);

  useEffect(() => {
    let active = true;

    async function loadSkillPoints() {
      if (!authToken || !apiBaseUrl) {
        setAddTwoNumbersPoints(null);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/students/me/skills/math-g1-add-001/progress`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!active) {
          return;
        }

        if (response.status === 404) {
          setAddTwoNumbersPoints(null);
          return;
        }

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          setAddTwoNumbersPoints(null);
          return;
        }

        setAddTwoNumbersPoints(payload.data.currentPoints ?? null);
      } catch (error) {
        if (active) {
          setAddTwoNumbersPoints(null);
        }
      }
    }

    loadSkillPoints();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, authToken]);

  const stacked = width < 900;
  const columns = stacked ? 1 : selectedGradeCode === '1' ? 4 : 3;
  const sectionColumns = useMemo(() => splitIntoColumns(gradePayload.sections || [], columns), [gradePayload, columns]);

  return (
    <View style={styles.screen}>
      <View style={styles.topBannerPlaceholder}>
        <Text style={styles.placeholderTitle}>Top Banner Placeholder</Text>
        <Text style={styles.placeholderText}>Brand/logo, promo, and account widgets will go here.</Text>
        <Text style={styles.signedInText}>Signed in as: {displayName || 'Guest'}</Text>
      </View>

      <View style={styles.topMenuPlaceholder}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.placeholderText}>Top Menu Placeholder</Text>
      </View>

      <View style={[styles.contentShell, stacked && styles.contentShellStacked]}>
        <View style={[styles.leftRail, stacked && styles.leftRailStacked]}>
          <Text style={styles.railHeading}>Grades</Text>
          <FlatList
            data={MATH_GRADES}
            keyExtractor={(item) => item.code}
            horizontal={stacked}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = item.code === selectedGradeCode;
              return (
                <Pressable
                  onPress={() => onSelectedGradeChange(item.code)}
                  style={[styles.gradeTab, active && styles.gradeTabActive]}
                >
                  <Text style={[styles.gradeTabCode, active && styles.gradeTabCodeActive]}>{item.code}</Text>
                </Pressable>
              );
            }}
          />
        </View>

        <View style={styles.rightPanel}>
          <Text style={styles.rightPanelTitle}>{gradePayload.title || `${selectedGrade.label} math`}</Text>
          <Text style={styles.rightPanelSubtitle}>Explore by topic. Total sections: {(gradePayload.sections || []).length}</Text>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#1b8ccc" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.sectionsWrap}>
              <View style={styles.sectionColumnsRow}>
                {sectionColumns.map((columnSections, colIndex) => (
                  <View key={`col-${colIndex}`} style={styles.sectionColumn}>
                    {columnSections.map((section) => (
                      <View key={section.id} style={styles.sectionCard}>
                        <Text style={styles.sectionHeader}>
                          {section.id}. {section.title}
                        </Text>
                        {section.skills.map((skill, skillIndex) => {
                          const canOpenExercise = selectedGradeCode === '1' && section.id === 'G' && skill === 'Add two numbers';
                          const skillLabel = canOpenExercise && addTwoNumbersPoints !== null
                            ? `${skill} (${addTwoNumbersPoints})`
                            : skill;

                          return (
                          <View key={`${section.id}-${skillIndex}`} style={styles.skillRow}>
                            <Text style={styles.skillIndex}>{`${skillIndex + 1}. `}</Text>
                            {canOpenExercise ? (
                              <Pressable onPress={onOpenSkillExercise}>
                                <Text style={[styles.skillItem, styles.skillLink]}>{skillLabel}</Text>
                              </Pressable>
                            ) : (
                              <Text style={styles.skillItem}>{skillLabel}</Text>
                            )}
                            <View style={styles.skillMarkerWrap}>
                              <Text style={styles.skillMarker}>i</Text>
                            </View>
                          </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f8ee',
  },
  topBannerPlaceholder: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2e4c3',
    backgroundColor: '#f4faee',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topMenuPlaceholder: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e7cd',
    backgroundColor: '#fafdf7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 12,
  },
  placeholderTitle: {
    color: '#3a7131',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  placeholderText: {
    color: '#5f7a56',
    fontSize: 12,
  },
  signedInText: {
    color: '#2c5a20',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  contentShell: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e8cc',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  contentShellStacked: {
    flexDirection: 'column',
  },
  leftRail: {
    width: 54,
    backgroundColor: '#f7fbf1',
    borderRightWidth: 1,
    borderRightColor: '#dbe8d1',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  leftRailStacked: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#d8ebca',
  },
  railHeading: {
    color: '#2c5a20',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  gradeTab: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4ea324',
    backgroundColor: '#5db72f',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeTabActive: {
    backgroundColor: '#1ba8e0',
    borderColor: '#0f8dbc',
  },
  gradeTabCode: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  gradeTabCodeActive: {
    color: '#ffffff',
  },
  rightPanel: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rightPanelTitle: {
    color: '#3b9f26',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '400',
    marginBottom: 4,
  },
  rightPanelSubtitle: {
    color: '#6f8666',
    marginBottom: 10,
    fontSize: 11,
  },
  loadingWrap: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionsWrap: {
    paddingBottom: 18,
  },
  sectionColumnsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  sectionColumn: {
    flex: 1,
    minWidth: 210,
  },
  sectionCard: {
    marginBottom: 10,
  },
  sectionHeader: {
    color: '#4b9f39',
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '500',
    marginBottom: 4,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  skillIndex: {
    width: 18,
    fontSize: 11,
    lineHeight: 16,
    color: '#5f7756',
  },
  skillItem: {
    color: '#435d3b',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  skillLink: {
    color: '#178dc6',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  skillMarkerWrap: {
    marginLeft: 4,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#bcd6af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillMarker: {
    fontSize: 8,
    lineHeight: 8,
    fontWeight: '700',
    color: '#7c9f70',
  },
});
