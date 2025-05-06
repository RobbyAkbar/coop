import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  PiggyBank,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { RootState } from '@/store';
import { fetchDashboardData } from '@/store/slices/appSlice';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const { balance, featuredArticles, activeProjects, isLoading } = useSelector(
    (state: RootState) => state.app
  );
  const scale = useSharedValue(1);
  const [refreshing, setRefreshing] = React.useState(false);

  // Balance card animation
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Load dashboard data
  const loadData = useCallback(() => {
    dispatch(fetchDashboardData() as any);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Animate balance card
    scale.value = withSpring(0.96, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 300);
    
    await dispatch(fetchDashboardData() as any);
    setRefreshing(false);
  }, [dispatch, scale]);

  // Handle quick action press
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'savings':
        router.push('/savings');
        break;
      case 'projects':
        // Navigate to projects screen
        break;
      case 'agenda':
        // Navigate to agenda screen
        break;
      case 'investments':
        // Navigate to investments screen
        break;
      default:
        break;
    }
  };

  // Render article item
  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.articleCard}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.articleImage}
        contentFit="cover"
        transition={500}
      />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articleExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>
        <View style={styles.articleMeta}>
          <Text style={styles.articleDate}>
            {format(new Date(item.publishedAt), 'MMM dd, yyyy')}
          </Text>
          <Text style={styles.articleAuthor}>{item.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.user_metadata.full_name}!</Text>
          <Text style={styles.date}>
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </Text>
        </View>

        {/* Balance Card */}
        <Animated.View style={[styles.balanceCardContainer, animatedStyles]}>
          <Card
            variant="elevated"
            padding="large"
            borderRadius="large"
            elevation="large"
            backgroundColor={Colors.primary[500]}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              Rp {balance?.total?.toLocaleString() || '0'}
            </Text>
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Available</Text>
                <Text style={styles.balanceDetailValue}>
                  Rp {balance?.available?.toLocaleString() || '0'}
                </Text>
              </View>
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Pending</Text>
                <Text style={styles.balanceDetailValue}>
                  Rp {balance?.pending?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>
            <View style={styles.balanceActions}>
              <Button
                title="Add Savings"
                size="small"
                variant="outline"
                style={styles.balanceActionButton}
                onPress={() => handleQuickAction('savings')}
              />
              <Button
                title="View Details"
                size="small"
                variant="outline"
                style={styles.balanceActionButton}
                onPress={() => handleQuickAction('investments')}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => handleQuickAction('savings')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary[50] }]}>
                <PiggyBank size={24} color={Colors.primary[500]} />
              </View>
              <Text style={styles.quickActionText}>Savings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => handleQuickAction('projects')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary[50] }]}>
                <TrendingUp size={24} color={Colors.secondary[500]} />
              </View>
              <Text style={styles.quickActionText}>Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => handleQuickAction('agenda')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.accent[50] }]}>
                <Calendar size={24} color={Colors.accent[500]} />
              </View>
              <Text style={styles.quickActionText}>Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => handleQuickAction('investments')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.success[50] }]}>
                <Users size={24} color={Colors.success[500]} />
              </View>
              <Text style={styles.quickActionText}>Members</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Articles */}
        <View style={styles.articlesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Articles</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {featuredArticles && featuredArticles.length > 0 ? (
            <FlatList
              data={featuredArticles}
              renderItem={renderArticleItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.articlesList}
            />
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentText}>
                No articles available at the moment.
              </Text>
            </View>
          )}
        </View>

        {/* Active Projects */}
        <View style={styles.projectsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Projects</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {activeProjects && activeProjects.length > 0 ? (
            <View style={styles.projectsList}>
              {activeProjects.slice(0, 2).map((project) => (
                <TouchableOpacity key={project.id} style={styles.projectCard}>
                  <Image
                    source={{ uri: project.imageUrl }}
                    style={styles.projectImage}
                    contentFit="cover"
                    transition={500}
                  />
                  <View style={styles.projectContent}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {project.title}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(
                                (project.currentAmount / project.goalAmount) * 100,
                                100
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.progressDetails}>
                        <Text style={styles.progressText}>
                          {((project.currentAmount / project.goalAmount) * 100).toFixed(1)}%
                        </Text>
                        <Text style={styles.goalText}>
                          Rp {project.currentAmount.toLocaleString()} / {project.goalAmount.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentText}>
                No active projects at the moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.headingLarge,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
  },
  balanceCardContainer: {
    marginVertical: Spacing.md,
  },
  balanceCard: {
    backgroundColor: Colors.primary[500],
  },
  balanceLabel: {
    ...Typography.labelMedium,
    color: Colors.primary[100],
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    ...Typography.displayMedium,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  balanceDetailItem: {
    flex: 1,
  },
  balanceDetailLabel: {
    ...Typography.labelSmall,
    color: Colors.primary[200],
    marginBottom: Spacing.xs,
  },
  balanceDetailValue: {
    ...Typography.labelLarge,
    color: Colors.white,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceActionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    borderColor: Colors.white,
  },
  quickActionsContainer: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headingSmall,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickActionItem: {
    width: '25%',
    padding: Spacing.xs,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionText: {
    ...Typography.labelSmall,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  articlesContainer: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...Typography.labelMedium,
    color: Colors.primary[500],
  },
  articlesList: {
    paddingRight: Spacing.lg,
  },
  articleCard: {
    width: 280,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    ...Shadow.medium,
  },
  articleImage: {
    width: '100%',
    height: 140,
  },
  articleContent: {
    padding: Spacing.md,
  },
  articleTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  articleExcerpt: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleDate: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  articleAuthor: {
    ...Typography.labelSmall,
    color: Colors.secondary[600],
  },
  projectsContainer: {
    marginTop: Spacing.xl,
  },
  projectsList: {
    gap: Spacing.md,
  },
  projectCard: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    ...Shadow.medium,
  },
  projectImage: {
    width: '100%',
    height: 160,
  },
  projectContent: {
    padding: Spacing.md,
  },
  projectTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success[500],
    borderRadius: BorderRadius.full,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    ...Typography.labelMedium,
    color: Colors.success[600],
  },
  goalText: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  noContentContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  noContentText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});
