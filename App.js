import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MathByGradeScreen from './src/screens/MathByGradeScreen';

const menuGroups = [
  {
    title: 'Math',
    items: ['Skills', 'Lessons', 'Videos'],
  },
  {
    title: 'Language Arts',
    items: ['Skills', 'Lessons', 'Videos'],
  },
  {
    title: 'SAT/ACT',
    items: ['Skills', 'Lessons', 'Videos'],
  },
];

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Platform.select({
    web: 'http://localhost:4000',
    default: 'http://localhost:4000',
  });

function CloudCard({ title, description, accent }) {
  return (
    <View style={[styles.cloudCard, accent === 'violet' && styles.cloudViolet]}>
      <Text style={[styles.cloudTitle, accent === 'violet' && styles.cloudTitleViolet]}>{title}</Text>
      <Text style={styles.cloudDescription}>{description}</Text>
      <View style={styles.cloudChevron}>
        <Text style={[styles.chevronText, accent === 'violet' && styles.chevronTextViolet]}>⌄</Text>
      </View>
    </View>
  );
}

function LearningMenu({ open, onToggle, onMathSkillsPress }) {
  return (
    <View style={styles.menuItemWrap}>
      <Pressable
        onPress={onToggle}
        style={({ hovered, pressed }) => [
          styles.menuItem,
          hovered && styles.menuItemHover,
          pressed && styles.menuItemPressed,
        ]}
      >
        <Text style={styles.menuItemText}>Learning</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {menuGroups.map((group) => (
            <View key={group.title} style={styles.dropdownGroup}>
              <Text style={styles.dropdownGroupTitle}>{group.title}</Text>
              <View style={styles.dropdownLinksRow}>
                {group.items.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      if (group.title === 'Math' && item === 'Skills') {
                        onMathSkillsPress();
                      }
                    }}
                    style={({ hovered }) => [styles.dropdownLink, hovered && styles.dropdownLinkHover]}
                  >
                    <Text style={styles.dropdownLinkText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [learningOpen, setLearningOpen] = useState(true);
  const [collectionResponse, setCollectionResponse] = useState('Not tested yet.');
  const [loadingCollections, setLoadingCollections] = useState(false);
  const topNav = useMemo(() => ['Assessment', 'Analytics', 'Takeoff', 'Inspiration'], []);

  if (currentScreen === 'mathByGrade') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MathByGradeScreen onBack={() => setCurrentScreen('home')} />
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  async function testCollectionsApi() {
    setLoadingCollections(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/collections?dbName=iHomeExcel`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Request failed');
      }

      setCollectionResponse(JSON.stringify(payload, null, 2));
    } catch (error) {
      setCollectionResponse(`Request failed: ${error.message}`);
    } finally {
      setLoadingCollections(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.brandMark}>
              <View style={styles.brandBlue} />
              <Text style={styles.brandText}>iHomeExcel</Text>
            </View>

            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                placeholder="Search topics, skills, and more"
                placeholderTextColor="#879d79"
                style={styles.searchInput}
              />
              <View style={styles.searchButton}>
                <Text style={styles.searchButtonText}>›</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={({ hovered, pressed }) => [styles.signInButton, hovered && styles.signInButtonHover, pressed && styles.signInButtonPressed]}>
                <Text style={styles.signInText}>Sign In</Text>
              </Pressable>
              <Pressable style={({ hovered, pressed }) => [styles.membershipButton, hovered && styles.membershipButtonHover, pressed && styles.membershipButtonPressed]}>
                <Text style={styles.membershipText}>Membership</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.navRow}>
            <LearningMenu
              open={learningOpen}
              onToggle={() => setLearningOpen((value) => !value)}
              onMathSkillsPress={() => setCurrentScreen('mathByGrade')}
            />
            {topNav.map((item) => (
              <Pressable key={item} style={({ hovered }) => [styles.menuItem, hovered && styles.menuItemHover]}>
                <Text style={styles.menuItemText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>iHomeExcel is personalized learning</Text>

          <View style={styles.heroCloudRow}>
            <CloudCard
              title="Comprehensive K-12 curriculum"
              description={'Math • Language arts • Science\nSocial studies • Spanish'}
            />
            <CloudCard
              title="Trusted by educators and parents"
              description={'Over 200 billion questions answered\nMore than 18 million students use iHomeExcel'}
              accent="violet"
            />
            <CloudCard
              title="Immersive learning experience"
              description={'Analytics • Recommendations\nReal-Time Diagnostic • Awards'}
            />
          </View>

          <Pressable style={({ hovered, pressed }) => [styles.ctaButton, hovered && styles.ctaButtonHover, pressed && styles.ctaButtonPressed]}>
            <Text style={styles.ctaText}>Become a member!</Text>
          </Pressable>

          <View style={styles.heroDecorLeft} />
          <View style={styles.heroDecorRight} />
          <View style={styles.heroHillLeft} />
          <View style={styles.heroHillRight} />
          <View style={styles.heroBalloon} />
          <View style={styles.heroPaperPlane} />
          <View style={styles.heroChildLeft} />
          <View style={styles.heroChildRight} />
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.featureCard}>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>ACT</Text>
              <Text style={styles.featureBadgeTextSecondary}>SAT</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>iHomeExcel for high school</Text>
              <Text style={styles.featureDescription}>iHomeExcel helps high schoolers create their own path to success.</Text>
              <Text style={styles.featureLink}>Take a look  ›</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureBadgeAlt}>
              <Text style={styles.featureBadgeText}>GED</Text>
              <Text style={styles.featureBadgeTextSecondary}>HiSET</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>iHomeExcel for independent learners</Text>
              <Text style={styles.featureDescription}>Yes, iHomeExcel is for adults, too!</Text>
              <Text style={styles.featureLink}>Take a look  ›</Text>
            </View>
          </View>
        </View>

        <View style={styles.apiPanel}>
          <Text style={styles.apiPanelTitle}>Server API Test</Text>
          <Text style={styles.apiPanelText}>GET {API_BASE_URL}/api/collections?dbName=iHomeExcel</Text>
          <Pressable
            onPress={testCollectionsApi}
            disabled={loadingCollections}
            style={({ hovered, pressed }) => [
              styles.apiButton,
              hovered && styles.apiButtonHover,
              pressed && styles.apiButtonPressed,
              loadingCollections && styles.apiButtonDisabled,
            ]}
          >
            {loadingCollections ? <ActivityIndicator color="#fff" /> : <Text style={styles.apiButtonText}>Run Collections Test</Text>}
          </Pressable>
          <Text style={styles.apiOutput}>{collectionResponse}</Text>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f2ed',
  },
  page: {
    backgroundColor: '#f4f2ed',
    minHeight: '100%',
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#63c30f',
    position: 'relative',
    zIndex: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  headerInner: {
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  brandMark: {
    width: 160,
    height: 40,
    backgroundColor: '#fff7d6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8c35b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandBlue: {
    width: 11,
    height: '100%',
    backgroundColor: '#40a8df',
    marginRight: 4,
  },
  brandText: {
    color: '#f7be1d',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  searchWrap: {
    flex: 1,
    minWidth: 250,
    maxWidth: 460,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchIcon: {
    color: '#8db584',
    fontSize: 22,
    marginTop: -2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#35502c',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  searchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#7c8d70',
    fontSize: 28,
    lineHeight: 24,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  signInButton: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1098d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonHover: {
    backgroundColor: '#0d86bd',
  },
  signInButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  signInText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  membershipButton: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#c3f09e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipButtonHover: {
    backgroundColor: '#b5e88f',
  },
  membershipButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  membershipText: {
    color: '#2c4f18',
    fontWeight: '800',
    fontSize: 16,
  },
  navRow: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 24,
    marginTop: 14,
    paddingHorizontal: 24,
    flexWrap: 'wrap',
  },
  menuItemWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  menuItemHover: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  menuItemPressed: {
    transform: [{ translateY: 1 }],
  },
  menuItemText: {
    color: '#fff7d4',
    fontSize: 17,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: -10,
    minWidth: 280,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#f9fff7',
    borderWidth: 1,
    borderColor: '#d7ebcf',
    zIndex: 1000,
  },
  dropdownGroup: {
    marginBottom: 12,
  },
  dropdownGroupTitle: {
    fontSize: 17,
    color: '#376023',
    fontWeight: '700',
    marginBottom: 8,
  },
  dropdownLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dropdownLink: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#eff8eb',
  },
  dropdownLinkHover: {
    backgroundColor: '#ddf2d4',
  },
  dropdownLinkText: {
    color: '#4c6f39',
    fontWeight: '600',
  },
  hero: {
    position: 'relative',
    zIndex: 0,
    overflow: 'hidden',
    minHeight: 450,
    paddingTop: 28,
    paddingBottom: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ccf7e5',
    ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(180deg, #d6f8d7 0%, #c8f5e5 100%)' } : null),
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'radial-gradient(circle at 50% 5%, rgba(255,255,255,0.4), transparent 35%), radial-gradient(circle at 10% 15%, rgba(255,255,255,0.28), transparent 18%), radial-gradient(circle at 90% 20%, rgba(255,255,255,0.2), transparent 16%)',
        }
      : null),
    pointerEvents: 'none',
  },
  heroTitle: {
    position: 'relative',
    zIndex: 2,
    color: '#2d85c5',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 28,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  heroCloudRow: {
    width: '100%',
    maxWidth: 1180,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 24,
    flexWrap: 'wrap',
  },
  cloudCard: {
    minWidth: 280,
    maxWidth: 360,
    flex: 1,
    borderRadius: 42,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9bdcc6',
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudViolet: {
    borderColor: '#d6c3e8',
  },
  cloudTitle: {
    color: '#58a6ce',
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  cloudTitleViolet: {
    color: '#7f5a95',
  },
  cloudDescription: {
    color: '#66756e',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  cloudChevron: {
    marginTop: 10,
  },
  chevronText: {
    color: '#38a8cd',
    fontSize: 26,
    fontWeight: '700',
  },
  chevronTextViolet: {
    color: '#9a6eb1',
  },
  ctaButton: {
    marginTop: 26,
    height: 42,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#64ba1e',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ctaButtonHover: {
    backgroundColor: '#57aa18',
  },
  ctaButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  heroDecorLeft: {
    position: 'absolute',
    left: 20,
    bottom: 36,
    width: 130,
    height: 190,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '-10deg' }],
  },
  heroDecorRight: {
    position: 'absolute',
    right: 26,
    bottom: 10,
    width: 126,
    height: 196,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    transform: [{ rotate: '12deg' }],
  },
  heroHillLeft: {
    position: 'absolute',
    left: -60,
    bottom: -50,
    width: 420,
    height: 180,
    borderTopLeftRadius: 420,
    borderTopRightRadius: 420,
    backgroundColor: '#55b84a',
    opacity: 0.92,
  },
  heroHillRight: {
    position: 'absolute',
    right: -90,
    bottom: -54,
    width: 430,
    height: 200,
    borderTopLeftRadius: 430,
    borderTopRightRadius: 430,
    backgroundColor: '#4a9f42',
    opacity: 0.95,
  },
  heroBalloon: {
    position: 'absolute',
    left: 38,
    top: 20,
    width: 86,
    height: 108,
    borderRadius: 43,
    backgroundColor: '#f5c241',
    borderWidth: 2,
    borderColor: '#c98d22',
  },
  heroPaperPlane: {
    position: 'absolute',
    right: 120,
    top: 70,
    width: 0,
    height: 0,
    borderLeftWidth: 32,
    borderRightWidth: 0,
    borderTopWidth: 18,
    borderBottomWidth: 18,
    borderLeftColor: '#ff8c4d',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '18deg' }],
  },
  heroChildLeft: {
    position: 'absolute',
    left: 110,
    bottom: 38,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff8a6a',
  },
  heroChildRight: {
    position: 'absolute',
    right: 86,
    bottom: 58,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fee26d',
  },
  sectionRow: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 26,
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  featureCard: {
    flex: 1,
    minWidth: 300,
    minHeight: 150,
    borderRadius: 28,
    backgroundColor: '#dff8c7',
    borderWidth: 1,
    borderColor: '#cbe8b5',
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureBadge: {
    width: 112,
    height: 94,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  featureBadgeAlt: {
    width: 112,
    height: 94,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }],
  },
  featureBadgeText: {
    color: '#41a6cf',
    fontSize: 26,
    fontWeight: '900',
  },
  featureBadgeTextSecondary: {
    marginTop: 2,
    color: '#4b83d1',
    fontSize: 18,
    fontWeight: '800',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#376023',
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 10,
    fontWeight: '500',
  },
  featureDescription: {
    color: '#607558',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 10,
  },
  featureLink: {
    color: '#4d8750',
    fontSize: 18,
    fontWeight: '700',
  },
  apiPanel: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9e7c9',
    backgroundColor: '#f6fff1',
  },
  apiPanelTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#3b6a2c',
    marginBottom: 8,
  },
  apiPanelText: {
    fontSize: 15,
    color: '#567049',
    marginBottom: 14,
  },
  apiButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1098d6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  apiButtonHover: {
    backgroundColor: '#0d86bd',
  },
  apiButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  apiButtonDisabled: {
    opacity: 0.7,
  },
  apiButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  apiOutput: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: '#344f2f',
    fontFamily: Platform.select({ web: 'monospace', default: undefined }),
  },
});
