import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Search, Filter, Calendar, ChevronDown, Check, X, CircleArrowDown as ArrowDownCircle, CircleArrowUp as ArrowUpCircle, DollarSign, Users } from 'lucide-react-native';
import { fetchTransactions, setStatusFilter, setSearchFilter, clearFilters } from '@/store/slices/transactionSlice';
import { RootState } from '@/store';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import Input from '@/components/Input';
import Card from '@/components/Card';
import { Transaction } from '@/types';

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { transactions, isLoading, filter } = useSelector(
    (state: RootState) => state.transaction
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'success' | 'failed'>(
    filter.status
  );

  // Load transactions
  useEffect(() => {
    dispatch(fetchTransactions() as any);
  }, [dispatch, filter]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTransactions() as any);
    setRefreshing(false);
  }, [dispatch]);

  // Handle search submit
  const handleSearchSubmit = () => {
    dispatch(setSearchFilter(searchValue));
  };

  // Handle status filter
  const handleStatusFilter = (status: 'all' | 'pending' | 'success' | 'failed') => {
    setSelectedStatus(status);
    dispatch(setStatusFilter(status));
    setShowFilters(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSearchValue('');
    dispatch(clearFilters());
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle size={24} color={Colors.success[500]} />;
      case 'withdrawal':
        return <ArrowUpCircle size={24} color={Colors.error[500]} />;
      case 'transfer':
        return <DollarSign size={24} color={Colors.primary[500]} />;
      case 'project_funding':
        return <Users size={24} color={Colors.secondary[500]} />;
      default:
        return <DollarSign size={24} color={Colors.neutral[500]} />;
    }
  };

  // Get status color based on status
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return Colors.success[500];
      case 'pending':
        return Colors.warning[500];
      case 'failed':
        return Colors.error[500];
      default:
        return Colors.neutral[500];
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type?: Transaction['type']) => {
  if (!type) return ''; // or return 'Unknown' or a fallback value
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Card variant="outlined" style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.iconContainer}>
          {getTransactionIcon(item.type)}
        </View>
        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>
              {formatTransactionType(item.type)}
            </Text>
            <Text
  style={[
    styles.transactionAmount,
    item.type === 'deposit'
      ? styles.positiveAmount
      : styles.negativeAmount,
  ]}
>
  {item.type === 'deposit' ? '+' : '-'} Rp{' '}
  {item.amount != null ? Number(item.amount).toLocaleString() : '0'}
</Text>
          </View>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>
  {(() => {
    const date = new Date(item.createdAt);
    return isNaN(date.getTime())
      ? 'Invalid date'
      : format(date, 'MMM dd, yyyy • HH:mm');
  })()}
</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.transactionDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  // Render empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your filters or check back later for new transactions.
      </Text>
      {(filter.search !== '' || filter.status !== 'all') && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render list header component
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search transactions..."
          value={searchValue}
          onChangeText={setSearchValue}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          leftIcon={<Search size={20} color={Colors.neutral[500]} />}
          rightIcon={
            searchValue ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchValue('');
                  if (filter.search) {
                    dispatch(setSearchFilter(''));
                  }
                }}
              >
                <X size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color={Colors.neutral[600]} />
          <Text style={styles.filterButtonText}>
            {filter.status === 'all' ? 'All' : filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}
          </Text>
          <ChevronDown size={16} color={Colors.neutral[600]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton}>
          <Calendar size={16} color={Colors.neutral[600]} />
          <Text style={styles.dateButtonText}>Date Range</Text>
        </TouchableOpacity>

        {(filter.search !== '' || filter.status !== 'all') && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
          >
            <X size={16} color={Colors.neutral[600]} />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filterDropdown}>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => handleStatusFilter('all')}
          >
            <Text style={styles.filterOptionText}>All</Text>
            {selectedStatus === 'all' && (
              <Check size={16} color={Colors.primary[500]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => handleStatusFilter('pending')}
          >
            <Text style={styles.filterOptionText}>Pending</Text>
            {selectedStatus === 'pending' && (
              <Check size={16} color={Colors.primary[500]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => handleStatusFilter('success')}
          >
            <Text style={styles.filterOptionText}>Success</Text>
            {selectedStatus === 'success' && (
              <Check size={16} color={Colors.primary[500]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => handleStatusFilter('failed')}
          >
            <Text style={styles.filterOptionText}>Failed</Text>
            {selectedStatus === 'failed' && (
              <Check size={16} color={Colors.primary[500]} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={!isLoading ? renderEmptyList : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerTitle: {
    ...Typography.headingMedium,
    color: Colors.neutral[900],
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  listHeader: {
    padding: Spacing.md,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  filterButtonText: {
    ...Typography.labelSmall,
    color: Colors.neutral[800],
    marginHorizontal: Spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  dateButtonText: {
    ...Typography.labelSmall,
    color: Colors.neutral[800],
    marginLeft: Spacing.xs,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  filterDropdown: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filterOptionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[800],
  },
  transactionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  transactionContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  transactionType: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
  },
  transactionAmount: {
    ...Typography.labelLarge,
  },
  positiveAmount: {
    color: Colors.success[600],
  },
  negativeAmount: {
    color: Colors.error[600],
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  transactionDate: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  transactionDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.headingSmall,
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  clearFiltersButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  },
  clearFiltersText: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
