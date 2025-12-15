// Экран: список спутников + выбор категории (календарь/электроника/характеристики/документация)
import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
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
  View,
} from 'react-native';

import {
  DELETE_CALENDAR_STAGE,
  DELETE_ELECTRONICS,
  DELETE_SATELLITE_OPCHAR,
  DELETE_TECH_SPEC,
  GET_CALENDAR_STATS,
  GET_ELECTRONICS_BY_SATELLITE,
  GET_SATELLITES,
  GET_TECH_SPECS_AND_OPCHAR,
  UPDATE_CALENDAR_STAGE,
  UPDATE_ELECTRONICS_PRICE,
  UPDATE_SATELLITE_OPCHAR,
  UPDATE_TECH_SPEC,
  UPDATE_SATELLITE,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SatelliteList'>;

type Category = 'calendar' | 'electronics' | 'opchar' | 'docs';

const categories: { key: Category; label: string }[] = [
  { key: 'calendar', label: 'Календарный план' },
  { key: 'electronics', label: 'Электроника' },
  { key: 'opchar', label: 'Операционные характеристики' },
  { key: 'docs', label: 'Техническая документация' },
];

const SatelliteListScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;
  const isAdmin = role === 'admin';

  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // состояние редактирования электроники
  const [editItem, setEditItem] = useState<null | {
    id: string;
    model: string;
    type: string;
    location: string;
    price: number;
  }>(null);
  const [editPrice, setEditPrice] = useState('');
  const [deleteElectronicsTarget, setDeleteElectronicsTarget] = useState<{
    id: string;
    model: string;
  } | null>(null);

  // состояние редактирования календаря
  const [editStageId, setEditStageId] = useState('');
  const [editStageName, setEditStageName] = useState('');
  const [editStageTime, setEditStageTime] = useState('');
  const [editStageDuration, setEditStageDuration] = useState('');
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [deleteStageTarget, setDeleteStageTarget] = useState<string | null>(null);

  // оп. характеристики
  const [editOpItem, setEditOpItem] = useState<null | {
    id: string;
    parameterName: string;
    value: number;
    unit: string;
  }>(null);
  const [editOpName, setEditOpName] = useState('');
  const [editOpValue, setEditOpValue] = useState('');
  const [editOpUnit, setEditOpUnit] = useState('');
  const [deleteOpTarget, setDeleteOpTarget] = useState<string | null>(null);

  // документация
  const [editDocItem, setEditDocItem] = useState<null | { id: string; description: string | null }>(
    null,
  );
  const [editDocText, setEditDocText] = useState('');
  const [deleteDocTarget, setDeleteDocTarget] = useState<string | null>(null);

  // спутник
  const [editSatName, setEditSatName] = useState('');
  const [editSatType, setEditSatType] = useState('');

  const satellitesQuery = useQuery<any>(GET_SATELLITES);

  const calendarQuery = useQuery<any>(GET_CALENDAR_STATS, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId || activeCategory !== 'calendar',
  });

  const electronicsQuery = useQuery<any>(GET_ELECTRONICS_BY_SATELLITE, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId || activeCategory !== 'electronics',
  });

  const techQuery = useQuery<any>(GET_TECH_SPECS_AND_OPCHAR, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId || (activeCategory !== 'opchar' && activeCategory !== 'docs'),
  });

  // mutations
  const [updatePrice, { loading: updatingPrice }] = useMutation(UPDATE_ELECTRONICS_PRICE, {
    refetchQueries: selectedSatelliteId
      ? [
          {
            query: GET_ELECTRONICS_BY_SATELLITE,
            variables: { satelliteId: selectedSatelliteId },
          },
        ]
      : [],
  });

  const [deleteElectronics, { loading: deletingElectronics }] = useMutation(DELETE_ELECTRONICS, {
    refetchQueries: selectedSatelliteId
      ? [
          {
            query: GET_ELECTRONICS_BY_SATELLITE,
            variables: { satelliteId: selectedSatelliteId },
          },
        ]
      : [],
  });

  const [updateStage, { loading: updatingStage }] = useMutation(UPDATE_CALENDAR_STAGE, {
    refetchQueries: selectedSatelliteId
      ? [
          {
            query: GET_CALENDAR_STATS,
            variables: { satelliteId: selectedSatelliteId },
          },
        ]
      : [],
  });

  const [deleteStage, { loading: deletingStage }] = useMutation(DELETE_CALENDAR_STAGE, {
    refetchQueries: selectedSatelliteId
      ? [
          {
            query: GET_CALENDAR_STATS,
            variables: { satelliteId: selectedSatelliteId },
          },
        ]
      : [],
  });

  const [updateSatellite, { loading: updatingSatellite }] = useMutation(UPDATE_SATELLITE, {
    refetchQueries: [{ query: GET_SATELLITES }],
  });

  const [updateOpChar, { loading: updatingOpChar }] = useMutation(UPDATE_SATELLITE_OPCHAR, {
    refetchQueries: selectedSatelliteId
      ? [
          { query: GET_TECH_SPECS_AND_OPCHAR, variables: { satelliteId: selectedSatelliteId } },
        ]
      : [],
  });

  const [deleteOpChar, { loading: deletingOpChar }] = useMutation(DELETE_SATELLITE_OPCHAR, {
    refetchQueries: selectedSatelliteId
      ? [
          { query: GET_TECH_SPECS_AND_OPCHAR, variables: { satelliteId: selectedSatelliteId } },
        ]
      : [],
  });

  const [updateTechSpec, { loading: updatingDoc }] = useMutation(UPDATE_TECH_SPEC, {
    refetchQueries: selectedSatelliteId
      ? [
          { query: GET_TECH_SPECS_AND_OPCHAR, variables: { satelliteId: selectedSatelliteId } },
        ]
      : [],
  });

  const [deleteTechSpec, { loading: deletingDoc }] = useMutation(DELETE_TECH_SPEC, {
    refetchQueries: selectedSatelliteId
      ? [
          { query: GET_TECH_SPECS_AND_OPCHAR, variables: { satelliteId: selectedSatelliteId } },
        ]
      : [],
  });

  const anyLoading =
    satellitesQuery.loading ||
    calendarQuery.loading ||
    electronicsQuery.loading ||
    techQuery.loading;

  const formattedDate = (value: any) => {
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

  const handleRowPress = (item: any) => {
    setEditItem({
      id: String(item.id),
      model: item.model,
      type: item.type,
      location: item.location,
      price: item.price,
    });
    setEditPrice(String(item.price));
  };

  const closeEditModal = () => {
    setEditItem(null);
    setEditPrice('');
  };

  const handleSavePrice = async () => {
    if (!editItem) return;
    const priceNum = Number(editPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert('Ошибка', 'Цена должна быть неотрицательным числом.');
      return;
    }
    try {
      await updatePrice({
        variables: { id: editItem.id, price: priceNum },
      });
      closeEditModal();
      Alert.alert('Готово', 'Цена обновлена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось сохранить');
    }
  };

  const handleDeleteElectronics = async () => {
    if (!deleteElectronicsTarget) return;
    try {
      await deleteElectronics({ variables: { id: deleteElectronicsTarget.id } });
      setDeleteElectronicsTarget(null);
      Alert.alert('Удалено', 'Запись электроники удалена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить');
    }
  };

  const openStageModal = (stage: any) => {
    setEditStageId(String(stage.id));
    setEditStageName(stage.nameOfStage);
    setEditStageTime(formattedDate(stage.timeOfFrame));
    setEditStageDuration(String(stage.duration));
    setStageModalVisible(true);
  };

  const handleUpdateStage = async () => {
    if (!selectedSatelliteId) {
      Alert.alert('Ошибка', 'Сначала выбери спутник.');
      return;
    }
    if (!editStageId.trim()) {
      Alert.alert('Ошибка', 'Укажи ID этапа.');
      return;
    }
    if (!editStageName.trim() || !editStageTime.trim()) {
      Alert.alert('Ошибка', 'Заполни название и дату.');
      return;
    }
    const durationDays = Number(editStageDuration);
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      Alert.alert('Ошибка', 'Длительность должна быть положительной.');
      return;
    }
    try {
      await updateStage({
        variables: {
          id: editStageId.trim(),
          nameOfStage: editStageName.trim(),
          timeOfFrame: editStageTime.trim(),
          duration: Math.round(durationDays),
        },
      });
      setStageModalVisible(false);
      setEditStageId('');
      setEditStageName('');
      setEditStageTime('');
      setEditStageDuration('');
      Alert.alert('Готово', 'Этап обновлён.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить этап');
    }
  };

  const handleUpdateSatellite = async () => {
    if (!selectedSatelliteId) return;
    if (!editSatName.trim() || !editSatType.trim()) {
      Alert.alert('Ошибка', 'Заполни имя и тип спутника.');
      return;
    }
    try {
      await updateSatellite({
        variables: {
          id: selectedSatelliteId,
          name: editSatName.trim(),
          type: editSatType.trim(),
        },
      });
      Alert.alert('Готово', 'Спутник обновлён.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить спутник');
    }
  };

  const openOpModal = (item: any) => {
    setEditOpItem({
      id: String(item.id),
      parameterName: item.parameterName,
      value: item.value,
      unit: item.unit,
    });
    setEditOpName(item.parameterName);
    setEditOpValue(String(item.value));
    setEditOpUnit(item.unit);
  };

  const handleUpdateOp = async () => {
    if (!editOpItem) return;
    if (!editOpName.trim() || !editOpUnit.trim()) {
      Alert.alert('Ошибка', 'Заполни название и единицу.');
      return;
    }
    const val = Number(editOpValue);
    if (!Number.isFinite(val)) {
      Alert.alert('Ошибка', 'Значение должно быть числом.');
      return;
    }
    try {
      await updateOpChar({
        variables: {
          id: editOpItem.id,
          parameterName: editOpName.trim(),
          value: val,
          unit: editOpUnit.trim(),
        },
      });
      setEditOpItem(null);
      setEditOpName('');
      setEditOpValue('');
      setEditOpUnit('');
      Alert.alert('Готово', 'Характеристика обновлена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить');
    }
  };

  const confirmDeleteOp = async () => {
    if (!deleteOpTarget) return;
    try {
      await deleteOpChar({ variables: { id: deleteOpTarget } });
      setDeleteOpTarget(null);
      Alert.alert('Удалено', 'Характеристика удалена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить');
    }
  };

  const openDocModal = (doc: any) => {
    setEditDocItem({ id: String(doc.id), description: doc.description });
    setEditDocText(doc.description ?? '');
  };

  const handleUpdateDoc = async () => {
    if (!editDocItem) return;
    try {
      await updateTechSpec({
        variables: { id: editDocItem.id, description: editDocText },
      });
      setEditDocItem(null);
      setEditDocText('');
      Alert.alert('Готово', 'Документ обновлён.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить документ');
    }
  };

  const confirmDeleteDoc = async () => {
    if (!deleteDocTarget) return;
    try {
      await deleteTechSpec({ variables: { id: deleteDocTarget } });
      setDeleteDocTarget(null);
      Alert.alert('Удалено', 'Документ удалён.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить документ');
    }
  };

  const confirmDeleteStage = async () => {
    if (!deleteStageTarget) return;
    try {
      await deleteStage({ variables: { id: deleteStageTarget } });
      setDeleteStageTarget(null);
      Alert.alert('Удалено', 'Этап удалён.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить этап');
    }
  };

  const header = useMemo(
    () => (
      <>
        <Text style={styles.title}>Список спутников</Text>
        <Text style={styles.subtitle}>
          Выбери спутник вверху, затем нужную характеристику ниже. Для календаря и электроники доступно редактирование/удаление.
        </Text>
      </>
    ),
    [],
  );

  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {header}

        {anyLoading && (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />
        )}

        <Text style={styles.sectionTitle}>Спутники</Text>
        <FlatList
          horizontal
          data={satellitesQuery.data?.satellites ?? []}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const active = selectedSatelliteId === item.id;
            return (
              <Pressable
                onPress={() => {
                  setSelectedSatelliteId(item.id);
                  setActiveCategory(null);
                  setEditSatName(item.name);
                  setEditSatType(item.type);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  active && { backgroundColor: colors.accentSoft },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.chipText, active && { color: '#041013' }]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />

        {selectedSatelliteId && isAdmin && (
          <View style={styles.editSatBlock}>
            <Text style={styles.sectionTitle}>Редактировать спутник</Text>
            <TextInput
              style={styles.input}
              placeholder="Название спутника"
              placeholderTextColor={colors.textSecondary}
              value={editSatName}
              onChangeText={setEditSatName}
            />
            <TextInput
              style={styles.input}
              placeholder="Тип спутника"
              placeholderTextColor={colors.textSecondary}
              value={editSatType}
              onChangeText={setEditSatType}
            />
            <Pressable
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleUpdateSatellite}
              disabled={updatingSatellite}
            >
              <Text style={styles.modalButtonSaveText}>
                {updatingSatellite ? 'Сохраняем…' : 'Сохранить'}
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>Характеристики</Text>
        <View style={styles.catRow}>
          {categories.map((cat) => {
            const active = activeCategory === cat.key;
            const disabled = !selectedSatelliteId;
            return (
              <Pressable
                key={cat.key}
                onPress={() => !disabled && setActiveCategory(cat.key)}
                style={[
                  styles.categoryButton,
                  active && { borderColor: colors.accent, backgroundColor: colors.cardStrong },
                  disabled && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.categoryText}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {!selectedSatelliteId && (
          <Text style={styles.helperText}>
            Сначала выбери спутник, чтобы открыть список характеристик.
          </Text>
        )}

        {/* Контент по выбранной категории */}
        {selectedSatelliteId && activeCategory === 'electronics' && (
          <>
            <Text style={styles.sectionTitle}>Электроника</Text>
            {electronicsQuery.data && (
              <View style={styles.block}>
                <Text style={styles.blockText}>
                  Суммарная стоимость: {electronicsQuery.data.electronicsTotalCost?.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Средняя стоимость: {electronicsQuery.data.electronicsAvgCost?.toFixed(2)}
                </Text>
                <Text style={styles.blockText}>
                  Минимум: {electronicsQuery.data.electronicsMinMaxCost?.minCost?.toFixed(2)} (
                  {electronicsQuery.data.electronicsMinMaxCost?.minModel})
                </Text>
                <Text style={styles.blockText}>
                  Максимум: {electronicsQuery.data.electronicsMinMaxCost?.maxCost?.toFixed(2)} (
                  {electronicsQuery.data.electronicsMinMaxCost?.maxModel})
                </Text>
              </View>
            )}
            {electronicsQuery.data?.electronics?.length ? (
              electronicsQuery.data.electronics.map((item: any) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{item.model}</Text>
                  <Text style={styles.rowSubtitle}>
                    Тип: {item.type} · Локация: {item.location}
                  </Text>
                  <Text style={styles.rowSubtitle}>Цена: {item.price} у.е.</Text>
                  {isAdmin && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonSave,
                          styles.actionButton,
                          styles.actionButtonEdit,
                        ]}
                        onPress={() => handleRowPress(item)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonCancel,
                          styles.actionButton,
                          styles.actionButtonDelete,
                        ]}
                        onPress={() =>
                          setDeleteElectronicsTarget({ id: String(item.id), model: item.model })
                        }
                        hitSlop={8}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>Электроника не указана.</Text>
            )}
          </>
        )}

        {selectedSatelliteId && activeCategory === 'calendar' && (
          <>
            <Text style={styles.sectionTitle}>Календарный план</Text>
            {calendarQuery.data?.calendarStageStats && (
              <View style={styles.block}>
                <Text style={styles.blockText}>
                  Среднее: {calendarQuery.data.calendarStageStats.avgDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Макс: {calendarQuery.data.calendarStageStats.maxDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Мин: {calendarQuery.data.calendarStageStats.minDuration.toFixed(1)} дн
                </Text>
                <Text style={styles.blockText}>
                  Сумма: {calendarQuery.data.calendarStageStats.totalDuration.toFixed(1)} дн
                </Text>
              </View>
            )}
            {calendarQuery.data?.calendarStages?.length ? (
              calendarQuery.data.calendarStages.map((stage: any) => (
                <View key={stage.id} style={styles.row}>
                  <Text style={styles.rowTitle}>
                    {stage.stageOrder}. {stage.nameOfStage}
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    Дата: {formattedDate(stage.timeOfFrame)}
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    Длительность: {stage.duration} дн
                  </Text>
                  {isAdmin && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonSave,
                          styles.actionButton,
                          styles.actionButtonEdit,
                        ]}
                        onPress={() => openStageModal(stage)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonCancel,
                          styles.actionButton,
                          styles.actionButtonDelete,
                        ]}
                        onPress={() => setDeleteStageTarget(String(stage.id))}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>Этапы не заданы.</Text>
            )}
          </>
        )}

        {selectedSatelliteId && activeCategory === 'opchar' && (
          <>
            <Text style={styles.sectionTitle}>Операционные характеристики</Text>
            {techQuery.data?.satelliteOpCharacteristics?.length ? (
              techQuery.data.satelliteOpCharacteristics.map((item: any) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{item.parameterName}</Text>
                  <Text style={styles.rowSubtitle}>
                    {item.value} {item.unit}
                  </Text>
                  {isAdmin && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonSave,
                          styles.actionButton,
                          styles.actionButtonEdit,
                        ]}
                        onPress={() => openOpModal(item)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonCancel,
                          styles.actionButton,
                          styles.actionButtonDelete,
                        ]}
                        onPress={() => setDeleteOpTarget(String(item.id))}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>Нет характеристик.</Text>
            )}
          </>
        )}

        {selectedSatelliteId && activeCategory === 'docs' && (
          <>
            <Text style={styles.sectionTitle}>Техническая документация</Text>
            {techQuery.data?.technicalSpecifications?.length ? (
              techQuery.data.technicalSpecifications.map((doc: any) => (
                <View key={doc.id} style={styles.row}>
                  <Text style={styles.rowTitle}>Документ #{doc.id}</Text>
                  <Text style={styles.rowSubtitle}>
                    {doc.description || 'Описание отсутствует'}
                  </Text>
                  {isAdmin && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonSave,
                          styles.actionButton,
                          styles.actionButtonEdit,
                        ]}
                        onPress={() => openDocModal(doc)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.modalButton,
                          styles.modalButtonCancel,
                          styles.actionButton,
                          styles.actionButtonDelete,
                        ]}
                        onPress={() => setDeleteDocTarget(String(doc.id))}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>Документов нет.</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Модалка редактирования электроники */}
      <Modal
        visible={isAdmin && !!editItem}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать электронику</Text>
            {editItem && (
              <Text style={styles.modalSubtitle}>
                {editItem.model} · ID: {editItem.id}
              </Text>
            )}
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
              placeholder="Новая цена"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeEditModal}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSavePrice}
                disabled={updatingPrice}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingPrice ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка редактирования оп. характеристик */}
      <Modal
        visible={isAdmin && !!editOpItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать характеристику</Text>
            <TextInput
              style={styles.input}
              placeholder="Параметр"
              placeholderTextColor={colors.textSecondary}
              value={editOpName}
              onChangeText={setEditOpName}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={editOpValue}
              onChangeText={setEditOpValue}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={editOpUnit}
              onChangeText={setEditOpUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditOpItem(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateOp}
                disabled={updatingOpChar}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingOpChar ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления оп. характеристики */}
      <Modal
        visible={!!deleteOpTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteOpTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить характеристику?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteOpTarget(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteOp}
                disabled={deletingOpChar}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingOpChar ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка редактирования документа */}
      <Modal
        visible={isAdmin && !!editDocItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditDocItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать документ</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={editDocText}
              onChangeText={setEditDocText}
              multiline
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditDocItem(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateDoc}
                disabled={updatingDoc}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingDoc ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления документа */}
      <Modal
        visible={!!deleteDocTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteDocTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить документ?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteDocTarget(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteDoc}
                disabled={deletingDoc}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingDoc ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка удаления электроники */}
      <Modal
        visible={!!deleteElectronicsTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteElectronicsTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить запись?</Text>
            {deleteElectronicsTarget && (
              <Text style={styles.modalSubtitle}>{deleteElectronicsTarget.model}</Text>
            )}
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteElectronicsTarget(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
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

      {/* Модалка редактирования этапа */}
      <Modal
        visible={isAdmin && stageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStageModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать этап</Text>
            <TextInput
              style={styles.input}
              placeholder="ID этапа"
              placeholderTextColor={colors.textSecondary}
              value={editStageId}
              onChangeText={setEditStageId}
            />
            <TextInput
              style={styles.input}
              placeholder="Название этапа"
              placeholderTextColor={colors.textSecondary}
              value={editStageName}
              onChangeText={setEditStageName}
            />
            <TextInput
              style={styles.input}
              placeholder="Дата (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              value={editStageTime}
              onChangeText={setEditStageTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Длительность, дн"
              placeholderTextColor={colors.textSecondary}
              value={editStageDuration}
              onChangeText={setEditStageDuration}
              keyboardType="numeric"
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
                  {updatingStage ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления этапа */}
      <Modal
        visible={!!deleteStageTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteStageTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить этап?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteStageTarget(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteStage}
                disabled={deletingStage}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingStage ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minWidth: '45%',
  },
  categoryText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  helperText: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonEdit: {
    marginRight: 6,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  actionButtonDelete: {
    marginLeft: 6,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  actionText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionDeleteText: {
    color: '#0f0f0f',
    fontWeight: '800',
  },
  block: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  blockText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonCancel: {
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
  },
  modalButtonSave: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalButtonDelete: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  modalButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  modalButtonSaveText: {
    color: '#041013',
    fontWeight: '800',
  },
  modalButtonDeleteText: {
    color: '#0f0f0f',
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  editSatBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
});

export default SatelliteListScreen;
