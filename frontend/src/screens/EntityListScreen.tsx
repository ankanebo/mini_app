// frontend/src/screens/EntityListScreen.tsx
import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  GET_CALENDAR_STATS,
  GET_ELECTRONICS_BY_SATELLITE,
  GET_MATERIALS,
  GET_SATELLITES,
  UPDATE_ELECTRONICS_PRICE,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EntityList'>;

const EntityListScreen: React.FC<Props> = ({ route }) => {
  const { entity, sort, role } = route.params;
  const isAdmin = role === 'admin';

  const [selectedSatelliteId, setSelectedSatelliteId] =
    useState<string | null>(null);

  // состояние модалки изменения цены
  const [editItem, setEditItem] = useState<{
    id: string;
    model: string;
    price: number;
  } | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');

  const [updateElectronicsPrice, { loading: updatingPrice }] = useMutation<any>(
    UPDATE_ELECTRONICS_PRICE,
    {
      onError: (err) => {
        Alert.alert('Ошибка', err.message);
      },
    },
  );

  // ===================== МАТЕРИАЛЫ ==========================================
  if (entity === 'materials') {
    const { data, loading, error } = useQuery<any>(GET_MATERIALS, {
      variables: { orderByAmount: sort ?? null },
    });

    return (
      <ScreenWrapper title="Материалы" loading={loading} error={error}>
        <FlatList
          data={data?.materials ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.typeOfMaterial}</Text>
              <Text style={styles.rowSubtitle}>
                Количество: {item.amount} {item.unit}
              </Text>
            </View>
          )}
        />
      </ScreenWrapper>
    );
  }

  // ===================== СПУТНИКИ ===========================================
  if (entity === 'satellites') {
    const { data, loading, error } = useQuery<any>(GET_SATELLITES);

    return (
      <ScreenWrapper title="Спутники" loading={loading} error={error}>
        <FlatList
          data={data?.satellites ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSubtitle}>Тип: {item.type}</Text>
            </View>
          )}
        />
      </ScreenWrapper>
    );
  }

  // ===================== ЭЛЕКТРОНИКА ПО СПУТНИКУ ============================
  if (entity === 'electronics') {
    const { data: satsData } = useQuery<any>(GET_SATELLITES);

    const {
      data,
      loading,
      error,
      refetch: refetchElectronics,
    } = useQuery<any>(GET_ELECTRONICS_BY_SATELLITE, {
      variables: { satelliteId: selectedSatelliteId },
      skip: !selectedSatelliteId,
    });

    const handleRowPress = (item: {
      id: string;
      model: string;
      price: number;
    }) => {
      // только админ может открывать модалку
      if (!isAdmin) {
        return;
      }

      setEditItem(item);
      setEditPrice(String(item.price));
    };

    const handleSavePrice = async () => {
      if (!editItem) return;

      const numericPrice = Number(editPrice.replace(',', '.'));

      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        Alert.alert(
          'Некорректное значение',
          'Введите положительное число для цены.',
        );
        return;
      }

      try {
        await updateElectronicsPrice({
          variables: {
            id: editItem.id,
            price: numericPrice,
          },
        });
        await refetchElectronics();
        setEditItem(null);
      } catch {
        // onError уже показал Alert
      }
    };

    return (
      <>
        <ScreenWrapper
          title="Электроника по спутнику"
          loading={loading && !!selectedSatelliteId}
          error={error}
        >
          <Text style={styles.sectionTitle}>Выбери спутник:</Text>
          <FlatList
            horizontal
            data={satsData?.satellites ?? []}
            keyExtractor={(item) => String(item.id)}
            style={{ marginBottom: 12 }}
            renderItem={({ item }) => {
              const active = selectedSatelliteId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedSatelliteId(item.id)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#0b1120' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          {selectedSatelliteId && data && (
            <>
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Агрегирующие показатели</Text>
                <Text style={styles.blockText}>
                  Суммарная стоимость:{' '}
                  {data.electronicsTotalCost.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Средняя стоимость: {data.electronicsAvgCost.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Минимум: {data.electronicsMinMaxCost.minCost?.toFixed(2)} (
                  {data.electronicsMinMaxCost.minModel})
                </Text>
                <Text style={styles.blockText}>
                  Максимум: {data.electronicsMinMaxCost.maxCost?.toFixed(2)} (
                  {data.electronicsMinMaxCost.maxModel})
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Позиции электроники</Text>
              <FlatList
                data={data.electronics}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    // если не админ – нажатие не обрабатываем
                    onPress={
                      isAdmin
                        ? () =>
                            handleRowPress({
                              id: String(item.id),
                              model: item.model,
                              price: item.price,
                            })
                        : undefined
                    }
                    style={styles.row}
                  >
                    <Text style={styles.rowTitle}>{item.model}</Text>
                    <Text style={styles.rowSubtitle}>
                      Тип: {item.type} · Цена: {item.price} у.е.
                      {isAdmin && (
                        <Text style={{ color: colors.textSecondary }}>
                          {' '}
                          (нажми, чтобы изменить цену)
                        </Text>
                      )}
                    </Text>
                  </Pressable>
                )}
              />
            </>
          )}

          {!selectedSatelliteId && (
            <Text style={styles.helperText}>
              Сначала выбери спутник, чтобы увидеть электронику и отчёты.
            </Text>
          )}
        </ScreenWrapper>

        {/* Модалка изменения цены — показываем только админу */}
        <Modal
          visible={isAdmin && !!editItem}
          transparent
          animationType="fade"
          onRequestClose={() => setEditItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Изменить цену</Text>
              {editItem && (
                <Text style={styles.modalSubtitle}>{editItem.model}</Text>
              )}
              <TextInput
                style={styles.input}
                value={editPrice}
                onChangeText={(text: string) => setEditPrice(text)}
                keyboardType="numeric"
                placeholder="Новая цена"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setEditItem(null)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSavePrice}
                  disabled={updatingPrice}
                >
                  <Text style={styles.modalButtonSaveText}>
                    {updatingPrice ? 'Сохранение…' : 'Сохранить'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // ===================== КАЛЕНДАРНЫЙ ПЛАН ====================================
  if (entity === 'calendarStats') {
    const { data: satsData } = useQuery<any>(GET_SATELLITES);
    const { data, loading, error } = useQuery<any>(GET_CALENDAR_STATS, {
      variables: { satelliteId: selectedSatelliteId },
      skip: !selectedSatelliteId,
    });

    return (
      <ScreenWrapper
        title="Календарный план"
        loading={loading && !!selectedSatelliteId}
        error={error}
      >
        <Text style={styles.sectionTitle}>Выбери спутник:</Text>
        <FlatList
          horizontal
          data={satsData?.satellites ?? []}
          keyExtractor={(item) => String(item.id)}
          style={{ marginBottom: 12 }}
          renderItem={({ item }) => {
            const active = selectedSatelliteId === item.id;
            return (
              <Pressable
                onPress={() => setSelectedSatelliteId(item.id)}
                style={[
                  styles.chip,
                  active && { backgroundColor: colors.accentSoft },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: '#0b1120' },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />

        {selectedSatelliteId && data && (
          <>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Время этапов</Text>
              <Text style={styles.blockText}>
                Среднее: {data.calendarStageStats.avgDuration.toFixed(1)} ч
              </Text>
              <Text style={styles.blockText}>
                Максимум: {data.calendarStageStats.maxDuration.toFixed(1)} ч
              </Text>
              <Text style={styles.blockText}>
                Минимум: {data.calendarStageStats.minDuration.toFixed(1)} ч
              </Text>
              <Text style={styles.blockText}>
                Общая длительность спутника:{' '}
                {data.calendarStageStats.totalDuration.toFixed(1)} ч
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Этапы</Text>
            <FlatList
              data={data.calendarStages}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.rowTitle}>{item.nameOfStage}</Text>
                  <Text style={styles.rowSubtitle}>
                    Длительность: {item.duration} ч
                  </Text>
                </View>
              )}
            />
          </>
        )}

        {!selectedSatelliteId && (
          <Text style={styles.helperText}>
            Выбери спутник, чтобы увидеть календарный план и статистику.
          </Text>
        )}
      </ScreenWrapper>
    );
  }

  return null;
};

// ====================== WRAPPER ==============================================

type WrapperProps = {
  title: string;
  loading: boolean;
  error?: any;
  children: React.ReactNode;
};

const ScreenWrapper: React.FC<WrapperProps> = ({
  title,
  loading,
  error,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>{title}</Text>
      {loading && (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
      )}
      {error && (
        <Text style={styles.error}>Ошибка: {String(error.message)}</Text>
      )}
      {!loading && !error ? children : null}
    </View>
  );
};

// ====================== STYLES ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  mainTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  error: {
    color: colors.danger,
    marginTop: 8,
  },
  helperText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  block: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  // ---- Modal styles ----
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    color: colors.textSecondary,
  },
  modalButtonSaveText: {
    color: '#0b1120',
    fontWeight: '600',
  },
});

export default EntityListScreen;
