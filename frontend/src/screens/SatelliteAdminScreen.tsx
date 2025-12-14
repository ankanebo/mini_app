// frontend/src/screens/SatelliteAdminScreen.tsx
import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    ADD_CALENDAR_STAGE,
    ADD_ELECTRONICS,
    ADD_SATELLITE,
    ADD_SATELLITE_OPCHAR,
    GET_CALENDAR_STATS,
    GET_ELECTRONICS_BY_SATELLITE,
    GET_SATELLITES,
    GET_TECH_SPECS_AND_OPCHAR,
    UPDATE_CALENDAR_STAGE,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SatelliteAdmin'>;

const SatelliteAdminScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;

  const [selectedSatelliteId, setSelectedSatelliteId] =
    useState<string | null>(null);

  // формы
  const [newSatName, setNewSatName] = useState('');
  const [newSatType, setNewSatType] = useState('');

  const [elModel, setElModel] = useState('');
  const [elType, setElType] = useState('');
  const [elLocation, setElLocation] = useState('');
  const [elPrice, setElPrice] = useState('');

  const [opParamName, setOpParamName] = useState('');
  const [opValue, setOpValue] = useState('');
  const [opUnit, setOpUnit] = useState('');

  const [stageName, setStageName] = useState('');
  const [stageTime, setStageTime] = useState('');
  const [stageDuration, setStageDuration] = useState('');
  const [editStageId, setEditStageId] = useState('');
  const [editStageName, setEditStageName] = useState('');
  const [editStageTime, setEditStageTime] = useState('');
  const [editStageDuration, setEditStageDuration] = useState('');

  const isAdmin = role === 'admin';

  // ====== Квери ======

  const {
    data: satellitesData,
    loading: satellitesLoading,
    error: satellitesError,
  } = useQuery<any>(GET_SATELLITES);

  const {
    data: techData,
    loading: techLoading,
    error: techError,
  } = useQuery<any>(GET_TECH_SPECS_AND_OPCHAR, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId,
  });

  const {
    data: calendarData,
    loading: calendarLoading,
    error: calendarError,
  } = useQuery<any>(GET_CALENDAR_STATS, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId,
  });

  const {
    data: electronicsData,
    loading: electronicsLoading,
    error: electronicsError,
  } = useQuery<any>(GET_ELECTRONICS_BY_SATELLITE, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId,
  });

  // ====== Мутации ======

  const [addSatellite, { loading: addingSatellite }] = useMutation(
    ADD_SATELLITE,
    {
      refetchQueries: [GET_SATELLITES],
    },
  );

  const [addElectronics, { loading: addingElectronics }] = useMutation(
    ADD_ELECTRONICS,
    {
      refetchQueries: selectedSatelliteId
        ? [
            {
              query: GET_ELECTRONICS_BY_SATELLITE,
              variables: { satelliteId: selectedSatelliteId },
            },
          ]
        : [],
    },
  );

  const [addOpChar, { loading: addingOpChar }] = useMutation(
    ADD_SATELLITE_OPCHAR,
    {
      refetchQueries: selectedSatelliteId
        ? [
            {
              query: GET_TECH_SPECS_AND_OPCHAR,
              variables: { satelliteId: selectedSatelliteId },
            },
          ]
        : [],
    },
  );

  const [addStage, { loading: addingStage }] = useMutation(
    ADD_CALENDAR_STAGE,
    {
      refetchQueries: selectedSatelliteId
        ? [
            {
              query: GET_CALENDAR_STATS,
              variables: { satelliteId: selectedSatelliteId },
            },
          ]
        : [],
    },
  );

  const [updateStage, { loading: updatingStage }] = useMutation(
    UPDATE_CALENDAR_STAGE,
    {
      refetchQueries: selectedSatelliteId
        ? [
            {
              query: GET_CALENDAR_STATS,
              variables: { satelliteId: selectedSatelliteId },
            },
          ]
        : [],
    },
  );

  // ====== Handlers ======

  const handleAddSatellite = async () => {
    if (!newSatName.trim() || !newSatType.trim()) {
      Alert.alert('Ошибка', 'Заполни имя и тип спутника.');
      return;
    }
    try {
      await addSatellite({
        variables: { name: newSatName.trim(), type: newSatType.trim() },
      });
      setNewSatName('');
      setNewSatType('');
      Alert.alert('Готово', 'Спутник добавлен.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось добавить спутник');
    }
  };

  const handleAddElectronics = async () => {
    if (!selectedSatelliteId) {
      Alert.alert('Ошибка', 'Сначала выбери спутник.');
      return;
    }
    if (!elModel.trim() || !elType.trim() || !elLocation.trim()) {
      Alert.alert('Ошибка', 'Заполни модель, тип и расположение.');
      return;
    }
    const priceNum = Number(elPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert('Ошибка', 'Цена должна быть неотрицательным числом.');
      return;
    }
    try {
      await addElectronics({
        variables: {
          satelliteId: selectedSatelliteId,
          model: elModel.trim(),
          type: elType.trim(),
          location: elLocation.trim(),
          price: priceNum,
        },
      });
      setElModel('');
      setElType('');
      setElLocation('');
      setElPrice('');
      Alert.alert('Готово', 'Электроника добавлена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось добавить электронику');
    }
  };

  const handleAddOpChar = async () => {
    if (!selectedSatelliteId) {
      Alert.alert('Ошибка', 'Сначала выбери спутник.');
      return;
    }
    if (!opParamName.trim() || !opUnit.trim()) {
      Alert.alert('Ошибка', 'Заполни название параметра и единицу измерения.');
      return;
    }
    const valueNum = Number(opValue);
    if (!Number.isFinite(valueNum)) {
      Alert.alert('Ошибка', 'Значение должно быть числом.');
      return;
    }
    try {
      await addOpChar({
        variables: {
          satelliteId: selectedSatelliteId,
          parameterName: opParamName.trim(),
          value: valueNum,
          unit: opUnit.trim(),
        },
      });
      setOpParamName('');
      setOpValue('');
      setOpUnit('');
      Alert.alert('Готово', 'Операционная характеристика добавлена.');
    } catch (e: any) {
      Alert.alert(
        'Ошибка',
        e.message ?? 'Не удалось добавить операционную характеристику',
      );
    }
  };

  const handleAddStage = async () => {
    if (!selectedSatelliteId) {
      Alert.alert('Ошибка', 'Сначала выбери спутник.');
      return;
    }
    if (!stageName.trim() || !stageTime.trim()) {
      Alert.alert('Ошибка', 'Заполни название этапа и дату/время.');
      return;
    }
    const durationNum = Number(stageDuration);
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      Alert.alert('Ошибка', 'Длительность должна быть положительным числом.');
      return;
    }
    try {
      await addStage({
        variables: {
          satelliteId: selectedSatelliteId,
          nameOfStage: stageName.trim(),
          timeOfFrame: stageTime.trim(), // ISO-строка, как в других местах
          duration: Math.round(durationNum),
        },
      });
      setStageName('');
      setStageTime('');
      setStageDuration('');
      Alert.alert('Готово', 'Этап календарного плана добавлен.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось добавить этап');
    }
  };

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
    const durationNum = Number(editStageDuration);
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      Alert.alert('Ошибка', 'Длительность должна быть положительным числом.');
      return;
    }
    try {
      await updateStage({
        variables: {
          id: editStageId.trim(),
          nameOfStage: editStageName.trim(),
          timeOfFrame: editStageTime.trim(),
          duration: Math.round(durationNum),
        },
      });
      setEditStageId('');
      setEditStageName('');
      setEditStageTime('');
      setEditStageDuration('');
      Alert.alert('Готово', 'Этап обновлен.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить этап');
    }
  };

  const anyLoading =
    satellitesLoading ||
    techLoading ||
    calendarLoading ||
    electronicsLoading;

  const anyError = satellitesError || techError || calendarError || electronicsError;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Управление спутниками</Text>

      {anyLoading && (
        <ActivityIndicator
          color={colors.accent}
          style={{ marginVertical: 12 }}
        />
      )}

      {anyError && (
        <Text style={styles.error}>
          Ошибка загрузки данных: {String(anyError.message)}
        </Text>
      )}

      {/* Выбор спутника */}
      <Text style={styles.sectionTitle}>Выбери спутник:</Text>
      <ScrollView
        horizontal
        style={{ marginBottom: 12 }}
        showsHorizontalScrollIndicator={false}
      >
        {satellitesData?.satellites?.map((sat: any) => {
          const active = selectedSatelliteId === sat.id;
          return (
            <Pressable
              key={sat.id}
              onPress={() => setSelectedSatelliteId(sat.id)}
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
                {sat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Информация о спутнике */}
      {selectedSatelliteId && (
        <>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>
              Техническая документация (technical_specification)
            </Text>
            {techData?.technicalSpecifications?.length ? (
              techData.technicalSpecifications.map((doc: any) => (
                <Text key={doc.id} style={styles.blockText}>
                  • {doc.description}
                </Text>
              ))
            ) : (
              <Text style={styles.blockText}>Нет документов.</Text>
            )}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>
              Операционные характеристики спутника
            </Text>
            {techData?.satelliteOpCharacteristics?.length ? (
              techData.satelliteOpCharacteristics.map((oc: any) => (
                <Text key={oc.id} style={styles.blockText}>
                  • {oc.parameterName}: {oc.value} {oc.unit}
                </Text>
              ))
            ) : (
              <Text style={styles.blockText}>Нет характеристик.</Text>
            )}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Календарный план</Text>
            {calendarData?.calendarStageStats && (
              <>
                <Text style={styles.blockText}>
                  Средняя длительность:{' '}
                  {calendarData.calendarStageStats.avgDuration.toFixed(1)} ч
                </Text>
                <Text style={styles.blockText}>
                  Максимум:{' '}
                  {calendarData.calendarStageStats.maxDuration.toFixed(1)} ч
                </Text>
                <Text style={styles.blockText}>
                  Минимум:{' '}
                  {calendarData.calendarStageStats.minDuration.toFixed(1)} ч
                </Text>
                <Text style={styles.blockText}>
                  Общая длительность:{' '}
                  {calendarData.calendarStageStats.totalDuration.toFixed(1)} ч
                </Text>
              </>
            )}
            {calendarData?.calendarStages?.length ? (
              calendarData.calendarStages.map((st: any) => (
                <Text key={st.id} style={styles.blockText}>
                  {st.stageOrder}. {st.nameOfStage} – {st.duration} ч (
                  {new Date(st.timeOfFrame).toLocaleString()})
                </Text>
              ))
            ) : (
              <Text style={styles.blockText}>Этапы не заданы.</Text>
            )}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Электроника спутника</Text>
            {electronicsData?.electronics?.length ? (
              electronicsData.electronics.map((el: any) => (
                <Text key={el.id} style={styles.blockText}>
                  • {el.model} ({el.type}) – {el.price} у.е. [{el.location}]
                </Text>
              ))
            ) : (
              <Text style={styles.blockText}>Электроника не указана.</Text>
            )}
          </View>
        </>
      )}

      {/* Формы доступны только админу */}
      {isAdmin && (
        <>
          <Text style={styles.sectionTitle}>Добавить спутник</Text>
          <View style={styles.formBlock}>
            <TextInput
              style={styles.input}
              placeholder="Название спутника"
              placeholderTextColor={colors.textSecondary}
              value={newSatName}
              onChangeText={setNewSatName}
            />
            <TextInput
              style={styles.input}
              placeholder="Тип спутника"
              placeholderTextColor={colors.textSecondary}
              value={newSatType}
              onChangeText={setNewSatType}
            />
            <Pressable
              style={styles.button}
              onPress={handleAddSatellite}
              disabled={addingSatellite}
            >
              <Text style={styles.buttonText}>
                {addingSatellite ? 'Добавляем...' : 'Добавить спутник'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Добавить электронику к выбранному спутнику
          </Text>
          <View style={styles.formBlock}>
            <TextInput
              style={styles.input}
              placeholder="Модель"
              placeholderTextColor={colors.textSecondary}
              value={elModel}
              onChangeText={setElModel}
            />
            <TextInput
              style={styles.input}
              placeholder="Тип"
              placeholderTextColor={colors.textSecondary}
              value={elType}
              onChangeText={setElType}
            />
            <TextInput
              style={styles.input}
              placeholder="Расположение (location)"
              placeholderTextColor={colors.textSecondary}
              value={elLocation}
              onChangeText={setElLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Цена"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={elPrice}
              onChangeText={setElPrice}
            />
            <Pressable
              style={styles.button}
              onPress={handleAddElectronics}
              disabled={addingElectronics}
            >
              <Text style={styles.buttonText}>
                {addingElectronics
                  ? 'Добавляем...'
                  : 'Добавить электронику'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Добавить операционную характеристику спутника
          </Text>
          <View style={styles.formBlock}>
            <TextInput
              style={styles.input}
              placeholder="Название параметра"
              placeholderTextColor={colors.textSecondary}
              value={opParamName}
              onChangeText={setOpParamName}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={opValue}
              onChangeText={setOpValue}
            />
            <TextInput
              style={styles.input}
              placeholder="Единица измерения"
              placeholderTextColor={colors.textSecondary}
              value={opUnit}
              onChangeText={setOpUnit}
            />
            <Pressable
              style={styles.button}
              onPress={handleAddOpChar}
              disabled={addingOpChar}
            >
              <Text style={styles.buttonText}>
                {addingOpChar
                  ? 'Добавляем...'
                  : 'Добавить характеристику'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Добавить этап в календарный план
          </Text>
          <View style={styles.formBlock}>
            <TextInput
              style={styles.input}
              placeholder="Название этапа"
              placeholderTextColor={colors.textSecondary}
              value={stageName}
              onChangeText={setStageName}
            />
            <TextInput
              style={styles.input}
              placeholder="Дата/время (ISO, напр. 2025-12-13T10:00:00)"
              placeholderTextColor={colors.textSecondary}
              value={stageTime}
              onChangeText={setStageTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Длительность, ч"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={stageDuration}
              onChangeText={setStageDuration}
            />
            <Pressable
              style={styles.button}
              onPress={handleAddStage}
              disabled={addingStage}
            >
              <Text style={styles.buttonText}>
                {addingStage ? 'Добавляем...' : 'Добавить этап'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Обновить этап календарного плана
          </Text>
          <View style={styles.formBlock}>
            <TextInput
              style={styles.input}
              placeholder="ID этапа"
              placeholderTextColor={colors.textSecondary}
              value={editStageId}
              onChangeText={setEditStageId}
            />
            <TextInput
              style={styles.input}
              placeholder="Новое название этапа"
              placeholderTextColor={colors.textSecondary}
              value={editStageName}
              onChangeText={setEditStageName}
            />
            <TextInput
              style={styles.input}
              placeholder="Новая дата/время (ISO)"
              placeholderTextColor={colors.textSecondary}
              value={editStageTime}
              onChangeText={setEditStageTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Новая длительность, ч"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={editStageDuration}
              onChangeText={setEditStageDuration}
            />
            <Pressable
              style={styles.button}
              onPress={handleUpdateStage}
              disabled={updatingStage}
            >
              <Text style={styles.buttonText}>
                {updatingStage ? 'Обновляем...' : 'Обновить этап'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
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
  formBlock: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.textPrimary,
    marginBottom: 8,
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '600',
  },
});

export default SatelliteAdminScreen;
