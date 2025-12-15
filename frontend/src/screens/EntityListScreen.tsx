// frontend/src/screens/EntityListScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GET_CALENDAR_STATS,
  GET_ELECTRONICS_BY_SATELLITE,
  GET_MATERIALS_FULL,
  GET_SATELLITES,
  GET_STANDS,
  GET_STAND_RESOURCES,
  UPDATE_ELECTRONICS_PRICE,
  UPDATE_CALENDAR_STAGE,
  DELETE_CALENDAR_STAGE,
  DELETE_ELECTRONICS,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EntityList'>;

const EntityListScreen: React.FC<Props> = ({ route }) => {
  const { entity, sort, role } = route.params;
  const isAdmin = role === 'admin';
  const isMaterials = entity === 'materialsFull';
  const isElectronics = entity === 'electronics';
  const isCalendar = entity === 'calendarStats';
  const isStand = entity === 'standTests';

  const [selectedSatelliteId, setSelectedSatelliteId] =
    useState<string | null>(null);
  const [standSatelliteId, setStandSatelliteId] =
    useState<string | null>(null);
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [editStageId, setEditStageId] = useState('');
  const [editStageName, setEditStageName] = useState('');
  const [editStageTime, setEditStageTime] = useState('');
  const [editStageDuration, setEditStageDuration] = useState('');
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);
  const [deleteStageTarget, setDeleteStageTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Queries (декларируем один раз)
  const satellitesQuery = useQuery<any>(GET_SATELLITES);
  const materialsFullQuery = useQuery<any>(GET_MATERIALS_FULL, {
    variables: { orderByAmount: sort ?? null },
    skip: !isMaterials,
  });
  const electronicsQuery = useQuery<any>(GET_ELECTRONICS_BY_SATELLITE, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !isElectronics || !selectedSatelliteId,
  });
  const calendarStatsQuery = useQuery<any>(GET_CALENDAR_STATS, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !isCalendar || !selectedSatelliteId,
  });
  const standsQuery = useQuery<any>(GET_STANDS, {
    variables: { satelliteId: standSatelliteId },
    skip: !isStand,
  });
  const standResourcesQuery = useQuery<any>(GET_STAND_RESOURCES, {
    variables: { standId: selectedStandId },
    skip: !isStand || !selectedStandId,
  });

  const formatDate = (value: any) => {
    if (value === null || value === undefined) return '—';
    const raw = typeof value === 'string' ? value.trim() : value;
    let date: Date | null = null;

    if (typeof raw === 'number' || typeof raw === 'bigint') {
      date = new Date(Number(raw));
    } else if (typeof raw === 'string') {
      if (/^\d+$/.test(raw)) {
        date = new Date(Number(raw));
      } else {
        date = new Date(raw);
      }
    }

    if (!date || Number.isNaN(date.getTime())) {
      return typeof raw === 'string' && raw ? raw : '—';
    }

    return date.toISOString().split('T')[0];
  };

  // состояние модалки изменения цены
  const [editItem, setEditItem] = useState<{
    id: string;
    model: string;
    type: string;
    location: string;
    price: number;
  } | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editModel, setEditModel] = useState<string>('');
  const [editType, setEditType] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [deleteElectronicsTarget, setDeleteElectronicsTarget] = useState<{
    id: string;
    model: string;
  } | null>(null);

  const [updateElectronicsPrice, { loading: updatingPrice }] = useMutation<any>(
    UPDATE_ELECTRONICS_PRICE,
    {
      onError: (err) => {
        Alert.alert('Ошибка', err.message);
      },
    },
  );

  const [updateStage, { loading: updatingStage }] = useMutation(
    UPDATE_CALENDAR_STAGE,
    {
      refetchQueries: () =>
        selectedSatelliteId
          ? [
              {
                query: GET_CALENDAR_STATS,
                variables: { satelliteId: selectedSatelliteId },
              },
            ]
          : [],
      onError: (err) => Alert.alert('Ошибка', err.message),
    },
  );

  const [deleteStage] = useMutation(
    DELETE_CALENDAR_STAGE,
    {
      refetchQueries: () =>
        selectedSatelliteId
          ? [
              {
                query: GET_CALENDAR_STATS,
                variables: { satelliteId: selectedSatelliteId },
              },
            ]
          : [],
    },
  );

  const [deleteElectronics, { loading: deletingElectronics }] = useMutation(
    DELETE_ELECTRONICS,
    {
      refetchQueries: () =>
        selectedSatelliteId
          ? [
              {
                query: GET_ELECTRONICS_BY_SATELLITE,
                variables: { satelliteId: selectedSatelliteId },
              },
            ]
          : [],
    },
  );

  // ===================== МАТЕРИАЛЫ + ХАРАКТЕРИСТИКИ =========================
  if (entity === 'materialsFull') {
    return (
      <ScreenWrapper
        title="Материалы и характеристики"
        loading={materialsFullQuery.loading}
        error={materialsFullQuery.error}
      >
        <ScrollView contentContainerStyle={styles.listContent}>
          {(materialsFullQuery.data?.materialsFull ?? []).map((item: any) => (
            <View key={item.material.id} style={styles.row}>
              <Text style={styles.rowTitle}>{item.material.typeOfMaterial}</Text>
              <Text style={styles.rowSubtitle}>
                Количество: {item.material.amount} {item.material.unit}
              </Text>

              <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                Функциональные
              </Text>
              {item.functional.length ? (
                item.functional.map((fc: any) => (
                  <Text key={fc.id} style={styles.rowSubtitle}>
                    {fc.description}: {fc.value} {fc.unit}
                  </Text>
                ))
              ) : (
                <Text style={styles.helperText}>
                  Нет функциональных характеристик.
                </Text>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                Операционные (по стендам)
              </Text>
              {item.operational.length ? (
                item.operational.map((oc: any) => (
                  <Text key={oc.id} style={styles.rowSubtitle}>
                    {oc.description ?? 'Параметр'}: {oc.value} {oc.unit} · Стенд:{' '}
                    {oc.stand.nameOfStand} ({oc.stand.typeOfStand})
                  </Text>
                ))
              ) : (
                <Text style={styles.helperText}>
                  Нет операционных характеристик.
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // ===================== СПУТНИКИ ===========================================
  if (entity === 'satellites') {
    return (
      <ScreenWrapper
        title="Спутники"
        loading={satellitesQuery.loading}
        error={satellitesQuery.error}
      >
        <FlatList
          data={satellitesQuery.data?.satellites ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    const handleDeleteElectronics = async () => {
      if (!deleteElectronicsTarget) return;
      try {
        await deleteElectronics({
          variables: { id: deleteElectronicsTarget.id },
        });
        await electronicsQuery.refetch();
      } catch (e: any) {
        Alert.alert('Ошибка', e?.message ?? 'Не удалось удалить электронику');
      } finally {
        setDeleteElectronicsTarget(null);
      }
    };

    const closeEditElectronicsModal = () => {
      setEditItem(null);
      setEditModel('');
      setEditType('');
      setEditLocation('');
      setEditPrice('');
    };

    const handleRowPress = (item: {
      id: string;
      model: string;
      type: string;
      location: string;
      price: number;
    }) => {
      // только админ может открывать модалку
      if (!isAdmin) {
        return;
      }

      setEditItem(item);
      setEditPrice(String(item.price));
      setEditModel(item.model);
      setEditType(item.type);
      setEditLocation(item.location);
    };

    const handleSavePrice = async () => {
      if (!editItem) return;

      const numericPrice = Number(editPrice.replace(',', '.'));

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        Alert.alert(
          'Некорректное значение',
          'Цена не может быть отрицательной (в БД триггер).',
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
        await electronicsQuery.refetch();
        closeEditElectronicsModal();
      } catch {
        // onError уже показал Alert
      }
    };

    return (
      <>
        <ScreenWrapper
          title="Электроника по спутнику"
          loading={electronicsQuery.loading && !!selectedSatelliteId}
          error={electronicsQuery.error}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Выбери спутник:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={satellitesQuery.data?.satellites ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedSatelliteId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedSatelliteId(item.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && { backgroundColor: colors.accentSoft },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#041013' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          {selectedSatelliteId && electronicsQuery.data && (
            <>
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Агрегирующие показатели</Text>
                <Text style={styles.blockText}>
                  Суммарная стоимость:{' '}
                  {electronicsQuery.data.electronicsTotalCost.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Средняя стоимость: {electronicsQuery.data.electronicsAvgCost.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Минимум: {electronicsQuery.data.electronicsMinMaxCost.minCost?.toFixed(2)} (
                  {electronicsQuery.data.electronicsMinMaxCost.minModel})
                </Text>
                <Text style={styles.blockText}>
                  Максимум: {electronicsQuery.data.electronicsMinMaxCost.maxCost?.toFixed(2)} (
                  {electronicsQuery.data.electronicsMinMaxCost.maxModel})
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Позиции электроники</Text>
              <View style={styles.listContent}>
                {electronicsQuery.data.electronics.map((item: any) => (
                  <View key={item.id} style={styles.row}>
                    <Text style={styles.rowTitle}>{item.model}</Text>
                    <Text style={styles.rowSubtitle}>
                      Тип: {item.type} · Локация: {item.location}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      Цена: {item.price} у.е.
                    </Text>
                    {isAdmin && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[
                            styles.modalButton,
                            styles.modalButtonSave,
                            styles.actionButton,
                            styles.actionButtonEdit,
                          ]}
                          onPress={() =>
                            handleRowPress({
                              id: String(item.id),
                              model: item.model,
                              type: item.type,
                              location: item.location,
                              price: item.price,
                            })
                          }
                        >
                          <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[
                            styles.modalButton,
                            styles.modalButtonCancel,
                            styles.actionButton,
                            styles.actionButtonDelete,
                          ]}
                          onPress={() =>
                            setDeleteElectronicsTarget({
                              id: String(item.id),
                              model: item.model,
                            })
                          }
                          hitSlop={8}
                        >
                          <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {!selectedSatelliteId && (
            <Text style={styles.helperText}>
              Сначала выбери спутник, чтобы увидеть электронику и отчёты.
            </Text>
          )}
        </ScrollView>
      </ScreenWrapper>

      {/* Модалка редактирования электроники — показываем только админу */}
      <Modal
        visible={isAdmin && !!editItem}
        transparent
        animationType="fade"
        onRequestClose={closeEditElectronicsModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать электронику</Text>
            {editItem && (
              <Text style={styles.modalSubtitle}>
                ID: {editItem.id} · {editModel || editItem.model}
              </Text>
            )}
            <TextInput
              style={styles.input}
              value={editModel}
              onChangeText={setEditModel}
              placeholder="Модель"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={editType}
              onChangeText={setEditType}
              placeholder="Тип"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Локация"
              placeholderTextColor={colors.textSecondary}
            />
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
                onPress={closeEditElectronicsModal}
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

      {/* Модалка подтверждения удаления электроники */}
      <Modal
        visible={!!deleteElectronicsTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteElectronicsTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить позицию</Text>
            {deleteElectronicsTarget && (
              <Text style={styles.modalSubtitle}>{deleteElectronicsTarget.model}</Text>
            )}
            <Text style={styles.blockText}>
              Это действие необратимо. Удалить запись электроники?
            </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setDeleteElectronicsTarget(null)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.modalButtonSave,
                    styles.actionButtonDelete,
                  ]}
                  onPress={handleDeleteElectronics}
                  disabled={deletingElectronics}
                >
                  <Text style={styles.modalButtonDeleteText}>
                    {deletingElectronics ? 'Удаляем…' : 'Удалить'}
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
    const refetch = calendarStatsQuery.refetch;

    const handleUpdateStage = async () => {
      if (!selectedSatelliteId) {
        Alert.alert('Ошибка', 'Сначала выбери спутник.');
        return;
      }
      if (!editStageId.trim()) {
        Alert.alert('Ошибка', 'Укажи ID этапа для обновления.');
        return;
      }
      if (!editStageName.trim() || !editStageTime.trim()) {
        Alert.alert('Ошибка', 'Заполни название этапа и дату/время.');
        return;
      }
      const durationDays = Number(editStageDuration);
      if (!Number.isFinite(durationDays) || durationDays <= 0) {
        Alert.alert('Ошибка', 'Длительность должна быть положительным числом.');
        return;
      }
      try {
        await updateStage({
          variables: {
            id: editStageId.trim(),
            nameOfStage: editStageName.trim(),
            timeOfFrame: editStageTime.trim(),
            duration: Math.round(durationDays), // сервер ожидает дни
          },
        });
        await refetch();
        setEditStageId('');
        setEditStageName('');
        setEditStageTime('');
        setEditStageDuration('');
        setStageModalVisible(false);
        Alert.alert('Готово', 'Этап обновлен.');
      } catch (e: any) {
        Alert.alert('Ошибка', e.message ?? 'Не удалось обновить этап');
      }
    };

    return (
      <ScreenWrapper
        title="Календарный план"
        loading={calendarStatsQuery.loading && !!selectedSatelliteId}
        error={calendarStatsQuery.error}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Выбери спутник:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={satellitesQuery.data?.satellites ?? []}
            keyExtractor={(item) => String(item.id)}
            style={{ marginBottom: 12 }}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedSatelliteId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedSatelliteId(item.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && { backgroundColor: colors.accentSoft },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#041013' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          {selectedSatelliteId && calendarStatsQuery.data && (
            <>
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Время этапов</Text>
                <Text style={styles.blockText}>
                  Среднее: {calendarStatsQuery.data.calendarStageStats.avgDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Максимум: {calendarStatsQuery.data.calendarStageStats.maxDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Минимум: {calendarStatsQuery.data.calendarStageStats.minDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Общая длительность спутника:{' '}
                  {calendarStatsQuery.data.calendarStageStats.totalDuration.toFixed(1)} дн
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Этапы</Text>
              <View style={styles.listContent}>
                {calendarStatsQuery.data.calendarStages.map((item: any) => (
                  <View key={item.id} style={styles.row}>
                    <Text style={styles.rowTitle}>
                      {item.stageOrder}. {item.nameOfStage}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      Длительность: {item.duration.toFixed(1)} дн
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      Дата: {formatDate(item.timeOfFrame)}
                    </Text>
                    <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[
                        styles.modalButton,
                        styles.modalButtonSave,
                        styles.actionButton,
                        styles.actionButtonEdit,
                      ]}
                      onPress={() => {
                        setEditStageId(String(item.id));
                        setEditStageName(item.nameOfStage);
                        setEditStageTime(formatDate(item.timeOfFrame));
                        setEditStageDuration(String(item.duration));
                        setStageModalVisible(true);
                      }}
                    >
                      <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[
                        styles.modalButton,
                        styles.modalButtonCancel,
                        styles.actionButton,
                        styles.actionButtonDelete,
                      ]}
                      onPress={() =>
                        setDeleteStageTarget({
                          id: String(item.id),
                          name: item.nameOfStage,
                        })
                      }
                      disabled={deletingStageId === String(item.id)}
                      hitSlop={8}
                    >
                      <Text style={styles.modalButtonDeleteText}>
                        {deletingStageId === String(item.id) ? '...' : 'Удалить'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            </>
          )}

          {!selectedSatelliteId && (
            <Text style={styles.helperText}>
              Выбери спутник, чтобы увидеть календарный план и статистику.
            </Text>
          )}
        </ScrollView>

        {/* Модалка обновления этапа */}
        <Modal
          visible={stageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStageModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Обновить этап</Text>
              <Text style={styles.modalSubtitle}>
                {editStageName || 'Название этапа'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Новое название этапа"
                placeholderTextColor={colors.textSecondary}
                value={editStageName}
                onChangeText={setEditStageName}
              />
              <TextInput
                style={styles.input}
                placeholder="Новая дата (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={editStageTime}
                onChangeText={setEditStageTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Новая длительность, дн"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={editStageDuration}
                onChangeText={setEditStageDuration}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setStageModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleUpdateStage}
                  disabled={updatingStage}
                >
                  <Text style={styles.modalButtonSaveText}>
                    {updatingStage ? 'Сохранение…' : 'Сохранить'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Модалка подтверждения удаления этапа */}
        <Modal
          visible={!!deleteStageTarget}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteStageTarget(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Удалить этап</Text>
              {deleteStageTarget && (
                <Text style={styles.modalSubtitle}>{deleteStageTarget.name}</Text>
              )}
              <Text style={styles.blockText}>
                Это действие необратимо. Точно удалить этап?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setDeleteStageTarget(null)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.modalButtonSave,
                    styles.actionButtonDelete,
                  ]}
                  onPress={async () => {
                    if (!deleteStageTarget) return;
                    try {
                      setDeletingStageId(deleteStageTarget.id);
                      await deleteStage({
                        variables: { id: deleteStageTarget.id },
                      });
                      await refetch();
                    } catch (e: any) {
                      Alert.alert('Ошибка', e?.message ?? 'Не удалось удалить этап');
                    } finally {
                      setDeletingStageId(null);
                      setDeleteStageTarget(null);
                    }
                  }}
                  disabled={!!deletingStageId}
                >
                  <Text style={styles.modalButtonDeleteText}>
                    {deletingStageId ? 'Удаляем…' : 'Удалить'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenWrapper>
    );
  }

  // ===================== СТЕНДЫ, СЕНСОРЫ, ИСПЫТАНИЯ =========================
  if (entity === 'standTests') {
    const satellitesData = satellitesQuery.data;
    const standsData = standsQuery.data;
    const resourcesLoading = standResourcesQuery.loading;
    const resourcesError = standResourcesQuery.error;
    const standResources = standResourcesQuery.data;
    const refetchStandResources = standResourcesQuery.refetch;

    return (
      <ScreenWrapper
        title="Стенды, сенсоры и испытания"
        loading={standsQuery.loading}
        error={standsQuery.error}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Выбери спутник:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={satellitesData?.satellites ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = standSatelliteId === String(item.id);
              return (
                <Pressable
                  onPress={() => {
                    const id = String(item.id);
                    setStandSatelliteId(id);
                    setSelectedStandId(null);
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    active && { backgroundColor: colors.accentSoft },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#041013' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Text style={styles.sectionTitle}>Выбери стенд:</Text>
          <View style={styles.listContent}>
            {(standsData?.stands ?? []).map((stand: any) => {
              const active = selectedStandId === String(stand.id);
              return (
                <Pressable
                  key={stand.id}
                  onPress={() => {
                    const id = String(stand.id);
                    if (active) {
                      setSelectedStandId(null);
                      return;
                    }
                    setSelectedStandId(id);
                    refetchStandResources({ standId: id });
                  }}
                  style={[
                    styles.row,
                    active && { borderColor: colors.accent, shadowOpacity: 0.16 },
                  ]}
                >
                  <Text style={styles.rowTitle}>{stand.nameOfStand}</Text>
                  <Text style={styles.rowSubtitle}>Тип: {stand.typeOfStand}</Text>
                  <Text style={styles.rowSubtitle}>
                    ID: {stand.id}{' '}
                    {standSatelliteId && (
                      <Text style={{ color: colors.textSecondary }}>
                        · Спутник:{' '}
                        {
                          satellitesData?.satellites?.find(
                            (s: any) => String(s.id) === standSatelliteId,
                          )?.name
                        }
                      </Text>
                    )}
                  </Text>

                  {active && (
                    <View style={{ marginTop: 10 }}>
                      {resourcesLoading && (
                        <ActivityIndicator
                          color={colors.accent}
                          style={{ marginVertical: 8 }}
                        />
                      )}
                      {resourcesError && (
                        <Text style={styles.error}>
                          Ошибка загрузки стенда: {String(resourcesError.message)}
                        </Text>
                      )}

                      {!resourcesLoading && !resourcesError && standResources && (
                        <>
                          <Text style={styles.blockTitle}>Требования к оборудованию</Text>
                          {standResources.hardwareRequirements?.length ? (
                            standResources.hardwareRequirements.map((req: any) => (
                              <Text key={req.id} style={styles.blockText}>
                                • {req.value} {req.unit} (ID {req.id})
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.helperText}>Нет требований.</Text>
                          )}

                          <Text style={[styles.blockTitle, { marginTop: 8 }]}>Сенсоры</Text>
                          {standResources.sensors?.length ? (
                            standResources.sensors.map((sensor: any) => (
                              <Text key={sensor.id} style={styles.blockText}>
                                • {sensor.description} @ {sensor.location} —{' '}
                                {sensor.value ?? '—'} {sensor.unit ?? ''}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.helperText}>Нет сенсоров.</Text>
                          )}

                          <Text style={[styles.blockTitle, { marginTop: 8 }]}>
                            Физические данные тестов
                          </Text>
                          {standResources.physicalTestData?.length ? (
                            standResources.physicalTestData.map((p: any) => (
                              <Text key={p.id} style={styles.blockText}>
                                • {p.description}: {p.value} {p.unit}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.helperText}>Нет данных испытаний.</Text>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
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
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <View style={styles.surface}>
        <Text style={styles.mainTitle}>{title}</Text>
        {loading && (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
        )}
        {error && (
          <Text style={styles.error}>Ошибка: {String(error.message)}</Text>
        )}
        {!loading && !error ? children : null}
      </View>
      <View style={styles.backgroundGlow} />
    </LinearGradient>
  );
};

// ====================== STYLES ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  surface: {
    flex: 1,
    padding: 16,
    paddingTop: 18,
    margin: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backgroundGlow: {
    position: 'absolute',
    right: -90,
    top: 120,
    width: 240,
    height: 240,
    backgroundColor: colors.glow,
    opacity: 0.45,
    borderRadius: 999,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  mainTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  error: {
    color: colors.danger,
    marginTop: 8,
    backgroundColor: 'rgba(255,107,107,0.08)',
    padding: 10,
    borderRadius: 10,
  },
  helperText: {
    color: colors.textSecondary,
    marginTop: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  chipRow: {
    paddingRight: 6,
    marginBottom: 8,
  },
  block: {
    backgroundColor: colors.cardStrong,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  blockTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 12,
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  formBlock: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#041013',
    fontWeight: '700',
  },

  // ---- Modal styles ----
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'rgba(4,7,16,0.9)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
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
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalButtonText: {
    color: colors.textSecondary,
  },
  modalButtonSaveText: {
    color: '#041013',
    fontWeight: '700',
  },
  modalButtonDeleteText: {
    color: '#0b0b0b',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonEdit: {
    marginRight: 6,
  },
  actionButtonDelete: {
    backgroundColor: colors.danger,
    borderWidth: 0,
    marginLeft: 6,
  },
});

export default EntityListScreen;
