import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DELETE_STAND,
  DELETE_HARDWARE_REQUIREMENT,
  DELETE_PHYSICAL_TEST_DATA,
  DELETE_SENSOR,
  GET_STAND_RESOURCES,
  GET_STANDS,
  ADD_STAND,
  ADD_SENSOR,
  ADD_HARDWARE_REQUIREMENT,
  ADD_PHYSICAL_TEST_DATA,
  ADD_OPERATIONAL_CHAR,
  GET_MATERIALS,
  UPDATE_HARDWARE_REQUIREMENT,
  UPDATE_PHYSICAL_TEST_DATA,
  UPDATE_SENSOR,
  UPDATE_STAND,
  GET_SATELLITES,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EngineerStands'>;

const EngineerStandsScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;
  const canEdit = role === 'engineer';

  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mode, setMode] = useState<'sensors' | 'requirements'>('sensors');

  const [editEntity, setEditEntity] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);
  const [showAddStand, setShowAddStand] = useState(false);
  const [newStandName, setNewStandName] = useState('');
  const [newStandType, setNewStandType] = useState('');

  const [showAddSensor, setShowAddSensor] = useState(false);
  const [newSensorLoc, setNewSensorLoc] = useState('');
  const [newSensorVal, setNewSensorVal] = useState('');
  const [newSensorUnit, setNewSensorUnit] = useState('');
  const [newSensorDesc, setNewSensorDesc] = useState('');

  const [showAddHr, setShowAddHr] = useState(false);
  const [newHrVal, setNewHrVal] = useState('');
  const [newHrUnit, setNewHrUnit] = useState('');

  const [showAddPtd, setShowAddPtd] = useState(false);
  const [newPtdDesc, setNewPtdDesc] = useState('');
  const [newPtdVal, setNewPtdVal] = useState('');
  const [newPtdUnit, setNewPtdUnit] = useState('');
  const [selectedMaterialForReq, setSelectedMaterialForReq] = useState<string | null>(null);

  const satellitesQuery = useQuery<any>(GET_SATELLITES);
  const materialsQuery = useQuery<any>(GET_MATERIALS);

  const standsQuery = useQuery<any>(GET_STANDS, {
    variables: { satelliteId: selectedSatelliteId },
    skip: !selectedSatelliteId,
  });

  const resourcesQuery = useQuery<any>(GET_STAND_RESOURCES, {
    variables: { standId: selectedStandId },
    skip: !selectedStandId,
  });

  const [updateStand, { loading: updatingStand }] = useMutation(UPDATE_STAND, {
    refetchQueries: selectedSatelliteId
      ? [{ query: GET_STANDS, variables: { satelliteId: selectedSatelliteId } }]
      : [],
  });
  const [deleteStand, { loading: deletingStand }] = useMutation(DELETE_STAND, {
    refetchQueries: selectedSatelliteId
      ? [{ query: GET_STANDS, variables: { satelliteId: selectedSatelliteId } }]
      : [],
  });

  const [updateSensor, { loading: updatingSensor }] = useMutation(UPDATE_SENSOR, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [deleteSensor, { loading: deletingSensor }] = useMutation(DELETE_SENSOR, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });

  const [updateHr, { loading: updatingHr }] = useMutation(UPDATE_HARDWARE_REQUIREMENT, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [deleteHr, { loading: deletingHr }] = useMutation(DELETE_HARDWARE_REQUIREMENT, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });

  const [updatePtd, { loading: updatingPtd }] = useMutation(UPDATE_PHYSICAL_TEST_DATA, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [deletePtd, { loading: deletingPtd }] = useMutation(DELETE_PHYSICAL_TEST_DATA, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });

  const [addStand, { loading: addingStand }] = useMutation(ADD_STAND, {
    refetchQueries: selectedSatelliteId
      ? [{ query: GET_STANDS, variables: { satelliteId: selectedSatelliteId } }]
      : [],
  });
  const [addSensor, { loading: addingSensor }] = useMutation(ADD_SENSOR, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [addHr, { loading: addingHr }] = useMutation(ADD_HARDWARE_REQUIREMENT, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [addPtd, { loading: addingPtd }] = useMutation(ADD_PHYSICAL_TEST_DATA, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });
  const [addOperationalChar, { loading: addingOpChar }] = useMutation(ADD_OPERATIONAL_CHAR, {
    refetchQueries: selectedStandId
      ? [{ query: GET_STAND_RESOURCES, variables: { standId: selectedStandId } }]
      : [],
  });

  useEffect(() => {
    if (selectedSatelliteId && standsQuery.data?.stands?.length) {
      const first = standsQuery.data.stands[0];
      setSelectedStandId(String(first.id));
      setEditName(first.nameOfStand);
      setEditType(first.typeOfStand);
    } else {
      setSelectedStandId(null);
      setEditName('');
      setEditType('');
    }
  }, [standsQuery.data, selectedSatelliteId]);

  useEffect(() => {
    if (!selectedMaterialForReq && materialsQuery.data?.materials?.length) {
      setSelectedMaterialForReq(String(materialsQuery.data.materials[0].id));
    }
  }, [materialsQuery.data, selectedMaterialForReq]);

  const currentStand = useMemo(() => {
    return standsQuery.data?.stands?.find(
      (s: any) => String(s.id) === String(selectedStandId),
    );
  }, [standsQuery.data, selectedStandId]);

  const openEdit = () => {
    if (!currentStand) return;
    setEditName(currentStand.nameOfStand);
    setEditType(currentStand.typeOfStand);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedStandId) return;
    if (!editName.trim() || !editType.trim()) {
      Alert.alert('Ошибка', 'Заполни название и тип стенда.');
      return;
    }
    try {
      await updateStand({
        variables: {
          id: selectedStandId,
          nameOfStand: editName.trim(),
          typeOfStand: editType.trim(),
        },
      });
      setShowEditModal(false);
      Alert.alert('Готово', 'Стенд обновлен.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить стенд');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStand({ variables: { id: deleteId } });
      setDeleteId(null);
      setSelectedStandId(null);
      Alert.alert('Удалено', 'Стенд удален.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить стенд');
    }
  };

  const openEditEntity = (item: any, kind: 'sensor' | 'hr' | 'ptd') => {
    setEditEntity({ ...item, kind });
    setEditValue(item.value ? String(item.value) : '');
    setEditUnit(item.unit || '');
    setEditDesc(item.description || '');
    setEditLocation(item.location || '');
  };

  const saveEntity = async () => {
    if (!editEntity) return;
    const valNum = Number(editValue);
    if (!Number.isFinite(valNum)) {
      Alert.alert('Ошибка', 'Значение должно быть числом.');
      return;
    }
    try {
      if (editEntity.kind === 'sensor') {
        await updateSensor({
          variables: {
            id: editEntity.id,
            location: editLocation,
            value: valNum,
            unit: editUnit,
            description: editDesc,
          },
        });
      } else if (editEntity.kind === 'hr') {
        await updateHr({
          variables: { id: editEntity.id, value: valNum, unit: editUnit },
        });
      } else {
        await updatePtd({
          variables: {
            id: editEntity.id,
            description: editDesc,
            value: valNum,
            unit: editUnit,
          },
        });
      }
      setEditEntity(null);
      setEditValue('');
      setEditUnit('');
      setEditDesc('');
      setEditLocation('');
      Alert.alert('Готово', 'Запись обновлена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить');
    }
  };

  const confirmDeleteEntity = async () => {
    if (!deleteEntityId || !editEntity) return;
    try {
      if (editEntity.kind === 'sensor') {
        await deleteSensor({ variables: { id: deleteEntityId } });
      } else if (editEntity.kind === 'hr') {
        await deleteHr({ variables: { id: deleteEntityId } });
      } else {
        await deletePtd({ variables: { id: deleteEntityId } });
      }
      setDeleteEntityId(null);
      setEditEntity(null);
      Alert.alert('Удалено', 'Запись удалена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить');
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Стенды (инженер)</Text>
        <Text style={styles.subtitle}>
          Выбери стенд, смотри датчики/требования/испытания. Для инженера доступно редактирование и удаление стенда.
        </Text>

        <Text style={styles.sectionTitle}>Спутники</Text>
        <View style={styles.chipRow}>
          {satellitesQuery.data?.satellites?.map((sat: any) => {
            const active = String(sat.id) === String(selectedSatelliteId);
            return (
              <Pressable
                key={sat.id}
                onPress={() => {
                  setSelectedSatelliteId(String(sat.id));
                  setSelectedStandId(null);
                  setMode('sensors');
                }}
                style={[styles.chip, active && { backgroundColor: colors.accentSoft }]}
              >
                <Text style={[styles.chipText, active && { color: '#041013' }]}>{sat.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedSatelliteId && (
          <>
            <Text style={styles.sectionTitle}>Стенды</Text>
            <View style={styles.chipRow}>
              {standsQuery.data?.stands?.map((st: any) => {
                const active = String(st.id) === String(selectedStandId);
                return (
                  <Pressable
                    key={st.id}
                    onPress={() => {
                      setSelectedStandId(String(st.id));
                      setEditName(st.nameOfStand);
                      setEditType(st.typeOfStand);
                    }}
                    style={[styles.chip, active && { backgroundColor: colors.accentSoft }]}
                  >
                    <Text style={[styles.chipText, active && { color: '#041013' }]}>
                      {st.nameOfStand}
                    </Text>
                  </Pressable>
                );
              })}
              {canEdit && (
                <Pressable
                  style={[styles.chip, { borderStyle: 'dashed' }]}
                  onPress={() => setShowAddStand(true)}
                >
                  <Text style={[styles.chipText, { color: colors.accent }]}>+ Добавить</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {currentStand && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>{currentStand.nameOfStand}</Text>
            <Text style={styles.blockText}>Тип: {currentStand.typeOfStand}</Text>
            <Text style={styles.blockText}>Спутник ID: {currentStand.satelliteBodyId}</Text>
            {canEdit && (
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSave, styles.actionButton, styles.actionButtonEdit]}
                  onPress={openEdit}
                >
                  <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel, styles.actionButton, styles.actionButtonDelete]}
                  onPress={() => setDeleteId(String(currentStand.id))}
                >
                  <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {currentStand && (
          <>
            <Text style={styles.sectionTitle}>Данные стенда</Text>
            <View style={styles.catRow}>
              {(['sensors', 'requirements'] as const).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[styles.categoryButton, active && { borderColor: colors.accent, backgroundColor: colors.cardStrong }]}
                  >
                    <Text style={styles.categoryText}>
                      {m === 'sensors' ? 'Датчики' : 'Требования'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'sensors' && resourcesQuery.data && (
              resourcesQuery.data.sensors?.length ? (
                resourcesQuery.data.sensors.map((s: any) => (
                  <View key={s.id} style={styles.row}>
                    <Text style={styles.rowTitle}>{s.description}</Text>
                    <Text style={styles.rowSubtitle}>Локация: {s.location}</Text>
                    <Text style={styles.rowSubtitle}>
                      Значение: {s.value} {s.unit}
                    </Text>
                    {canEdit && (
                      <View style={styles.actionRow}>
                        <Pressable
                          style={[styles.modalButton, styles.modalButtonSave, styles.actionButton, styles.actionButtonEdit]}
                          onPress={() => openEditEntity({ ...s, kind: 'sensor' }, 'sensor')}
                        >
                          <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                        </Pressable>
                        <Pressable
                        style={[styles.modalButton, styles.modalButtonDelete, styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => {
                          setEditEntity({ ...s, kind: 'sensor' });
                          setDeleteEntityId(String(s.id));
                        }}
                      >
                          <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.helperText}>Датчиков нет.</Text>
              )
            )}
            {mode === 'sensors' && canEdit && selectedStandId && (
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, { marginTop: 6 }]}
                onPress={() => setShowAddSensor(true)}
              >
                <Text style={styles.modalButtonSaveText}>Добавить датчик</Text>
              </Pressable>
            )}

            {mode === 'requirements' && resourcesQuery.data && (
              resourcesQuery.data.hardwareRequirements?.length ? (
                resourcesQuery.data.hardwareRequirements.map((hr: any) => (
                  <View key={hr.id} style={styles.row}>
                    <Text style={styles.rowTitle}>Требование #{hr.id}</Text>
                    <Text style={styles.rowSubtitle}>
                      Значение: {hr.value} {hr.unit}
                    </Text>
                    {canEdit && (
                      <View style={styles.actionRow}>
                        <Pressable
                          style={[styles.modalButton, styles.modalButtonSave, styles.actionButton, styles.actionButtonEdit]}
                          onPress={() => openEditEntity({ ...hr, kind: 'hr' }, 'hr')}
                        >
                          <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.modalButton, styles.modalButtonDelete, styles.actionButton, styles.actionButtonDelete]}
                          onPress={() => {
                            setEditEntity({ ...hr, kind: 'hr' });
                            setDeleteEntityId(String(hr.id));
                          }}
                        >
                          <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.helperText}>Требований нет.</Text>
              )
            )}
            {mode === 'requirements' && canEdit && selectedStandId && currentStand && (
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, { marginTop: 6 }]}
                onPress={() => setShowAddHr(true)}
              >
                <Text style={styles.modalButtonSaveText}>
                  {currentStand.typeOfStand === 'processing'
                    ? 'Добавить требование и оп. хар-ку материала'
                    : currentStand.typeOfStand === 'testing'
                    ? 'Добавить требование и данные испытаний'
                    : 'Добавить требование'}
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {/* Модалка редактирования стенда */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать стенд</Text>
            <TextInput
              style={styles.input}
              placeholder="Название стенда"
              placeholderTextColor={colors.textSecondary}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Тип стенда"
              placeholderTextColor={colors.textSecondary}
              value={editType}
              onChangeText={setEditType}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSave}
                disabled={updatingStand}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingStand ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления стенда */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить стенд?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteId(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
                disabled={deletingStand}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingStand ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление стенда */}
      <Modal
        visible={showAddStand}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddStand(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить стенд</Text>
            <TextInput
              style={styles.input}
              placeholder="Название стенда"
              placeholderTextColor={colors.textSecondary}
              value={newStandName}
              onChangeText={setNewStandName}
            />
            <TextInput
              style={styles.input}
              placeholder="Тип стенда"
              placeholderTextColor={colors.textSecondary}
              value={newStandType}
              onChangeText={setNewStandType}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddStand(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedSatelliteId) {
                    Alert.alert('Ошибка', 'Сначала выбери спутник.');
                    return;
                  }
                  if (!newStandName.trim() || !newStandType.trim()) {
                    Alert.alert('Ошибка', 'Заполни имя и тип стенда.');
                    return;
                  }
                  try {
                    await addStand({
                      variables: {
                        satelliteId: selectedSatelliteId,
                        nameOfStand: newStandName.trim(),
                        typeOfStand: newStandType.trim(),
                      },
                    });
                    setShowAddStand(false);
                    setNewStandName('');
                    setNewStandType('');
                    Alert.alert('Готово', 'Стенд добавлен.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить стенд');
                  }
                }}
                disabled={addingStand}
              >
                <Text style={styles.modalButtonSaveText}>
                  {addingStand ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление датчика */}
      <Modal
        visible={showAddSensor}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddSensor(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить датчик</Text>
            <TextInput
              style={styles.input}
              placeholder="Локация"
              placeholderTextColor={colors.textSecondary}
              value={newSensorLoc}
              onChangeText={setNewSensorLoc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={newSensorVal}
              onChangeText={setNewSensorVal}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newSensorUnit}
              onChangeText={setNewSensorUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={newSensorDesc}
              onChangeText={setNewSensorDesc}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddSensor(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedStandId) {
                    Alert.alert('Ошибка', 'Сначала выбери стенд.');
                    return;
                  }
                  const valNum = newSensorVal ? Number(newSensorVal) : null;
                  if (!newSensorLoc.trim() || !newSensorDesc.trim()) {
                    Alert.alert('Ошибка', 'Заполни локацию и описание.');
                    return;
                  }
                  if (newSensorVal && !Number.isFinite(valNum)) {
                    Alert.alert('Ошибка', 'Значение должно быть числом.');
                    return;
                  }
                  try {
                    await addSensor({
                      variables: {
                        standId: selectedStandId,
                        location: newSensorLoc.trim(),
                        description: newSensorDesc.trim(),
                        value: valNum,
                        unit: newSensorUnit || null,
                      },
                    });
                    setShowAddSensor(false);
                    setNewSensorLoc('');
                    setNewSensorVal('');
                    setNewSensorUnit('');
                    setNewSensorDesc('');
                    Alert.alert('Готово', 'Датчик добавлен.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить датчик');
                  }
                }}
                disabled={addingSensor}
              >
                <Text style={styles.modalButtonSaveText}>
                  {addingSensor ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление требования (+ оп. хар-ка / данные испытаний) */}
      <Modal
        visible={showAddHr}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddHr(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить требование</Text>
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={newHrVal}
              onChangeText={setNewHrVal}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newHrUnit}
              onChangeText={setNewHrUnit}
            />
            {currentStand?.typeOfStand === 'processing' && (
              <>
                <Text style={styles.sectionTitle}>Оп. хар-ка материала</Text>
                <View style={styles.chipRow}>
                  {materialsQuery.data?.materials?.map((mat: any) => {
                    const active = String(mat.id) === String(selectedMaterialForReq);
                    return (
                      <Pressable
                        key={mat.id}
                        onPress={() => setSelectedMaterialForReq(String(mat.id))}
                        style={[styles.chip, active && { backgroundColor: colors.accentSoft }]}
                      >
                        <Text style={[styles.chipText, active && { color: '#041013' }]}>
                          {mat.typeOfMaterial}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Описание"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdDesc}
                  onChangeText={setNewPtdDesc}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Значение"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdVal}
                  onChangeText={setNewPtdVal}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Единица"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdUnit}
                  onChangeText={setNewPtdUnit}
                />
              </>
            )}
            {currentStand?.typeOfStand === 'testing' && (
              <>
                <Text style={styles.sectionTitle}>Данные испытаний</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Описание"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdDesc}
                  onChangeText={setNewPtdDesc}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Значение"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdVal}
                  onChangeText={setNewPtdVal}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Единица"
                  placeholderTextColor={colors.textSecondary}
                  value={newPtdUnit}
                  onChangeText={setNewPtdUnit}
                />
              </>
            )}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddHr(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedStandId) {
                    Alert.alert('Ошибка', 'Сначала выбери стенд.');
                    return;
                  }
                  const valNum = Number(newHrVal);
                  if (!Number.isFinite(valNum) || !newHrUnit.trim()) {
                    Alert.alert('Ошибка', 'Заполни значение (число) и единицу.');
                    return;
                  }
                  try {
                    const hrResp = await addHr({
                      variables: {
                        standId: selectedStandId,
                        value: valNum,
                        unit: newHrUnit.trim(),
                      },
                    });
                    const newHrId = (hrResp as any).data?.addHardwareRequirement?.id;

                    // если стенд processing — сразу добавляем оп. хар-ку материала
                    if (currentStand?.typeOfStand === 'processing') {
                      const valOp = Number(newPtdVal);
                      if (
                        !selectedMaterialForReq ||
                        !Number.isFinite(valOp) ||
                        !newPtdUnit.trim()
                      ) {
                        Alert.alert('Ошибка', 'Выбери материал и заполни значение/единицу.');
                        return;
                      }
                      await addOperationalChar({
                        variables: {
                          materialId: selectedMaterialForReq,
                          standId: selectedStandId,
                          hardwareRequirementId: Number(newHrId),
                          description: newPtdDesc.trim(),
                          value: valOp,
                          unit: newPtdUnit.trim(),
                        },
                      });
                    }

                    // если стенд testing — добавляем физ. данные
                    if (currentStand?.typeOfStand === 'testing') {
                      const valTest = Number(newPtdVal);
                      if (!Number.isFinite(valTest) || !newPtdUnit.trim() || !newPtdDesc.trim()) {
                        Alert.alert('Ошибка', 'Заполни описание, значение и единицу для испытаний.');
                        return;
                      }
                      await addPtd({
                        variables: {
                          standId: selectedStandId,
                          hardwareRequirementId: Number(newHrId),
                          description: newPtdDesc.trim(),
                          value: valTest,
                          unit: newPtdUnit.trim(),
                        },
                      });
                    }

                    setShowAddHr(false);
                    setNewHrVal('');
                    setNewHrUnit('');
                    setNewPtdDesc('');
                    setNewPtdVal('');
                    setNewPtdUnit('');
                    setSelectedMaterialForReq(null);
                    Alert.alert('Готово', 'Записи добавлены.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить требование');
                  }
                }}
                disabled={addingHr || addingOpChar || addingPtd}
              >
                <Text style={styles.modalButtonSaveText}>
                  {addingHr || addingOpChar || addingPtd ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление физического испытания */}
      <Modal
        visible={showAddPtd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddPtd(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить испытание</Text>
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={newPtdDesc}
              onChangeText={setNewPtdDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={newPtdVal}
              onChangeText={setNewPtdVal}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newPtdUnit}
              onChangeText={setNewPtdUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddPtd(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedStandId) {
                    Alert.alert('Ошибка', 'Сначала выбери стенд.');
                    return;
                  }
                  const valNum = Number(newPtdVal);
                  if (!newPtdDesc.trim() || !newPtdUnit.trim() || !Number.isFinite(valNum)) {
                    Alert.alert('Ошибка', 'Заполни описание, значение (число) и единицу.');
                    return;
                  }
                  try {
                    await addPtd({
                      variables: {
                        standId: selectedStandId,
                        hardwareRequirementId: 0, // Требуется выбрать требование отдельно; для простоты ставим 0
                        description: newPtdDesc.trim(),
                        value: valNum,
                        unit: newPtdUnit.trim(),
                      },
                    });
                    setShowAddPtd(false);
                    setNewPtdDesc('');
                    setNewPtdVal('');
                    setNewPtdUnit('');
                    Alert.alert('Готово', 'Испытание добавлено.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить испытание');
                  }
                }}
                disabled={addingPtd}
              >
                <Text style={styles.modalButtonSaveText}>
                  {addingPtd ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Модалка редактирования сущности */}
      <Modal
        visible={!!editEntity}
        transparent
        animationType="fade"
        onRequestClose={() => setEditEntity(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать</Text>
            {editEntity?.kind === 'sensor' && (
              <TextInput
                style={styles.input}
                placeholder="Локация"
                placeholderTextColor={colors.textSecondary}
                value={editLocation}
                onChangeText={setEditLocation}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={editDesc}
              onChangeText={setEditDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={editUnit}
              onChangeText={setEditUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditEntity(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveEntity}
                disabled={updatingSensor || updatingHr || updatingPtd}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingSensor || updatingHr || updatingPtd ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления сущности */}
      <Modal
        visible={!!deleteEntityId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteEntityId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить запись?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteEntityId(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteEntity}
                disabled={deletingSensor || deletingHr || deletingPtd}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingSensor || deletingHr || deletingPtd ? 'Удаляем…' : 'Удалить'}
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
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: colors.textSecondary, marginBottom: 12 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.textPrimary, fontWeight: '700' },
  block: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  blockTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  blockText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  rowTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  rowSubtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  actionButtonEdit: { marginRight: 6 },
  actionButtonDelete: { marginLeft: 6 },
  helperText: { color: colors.textSecondary, marginBottom: 10 },
  catRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 10 },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  categoryText: { color: colors.textPrimary, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0e1a1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10252c',
  },
  modalTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },
  modalButtonCancel: { borderColor: colors.border, backgroundColor: colors.cardStrong },
  modalButtonSave: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalButtonDelete: { borderColor: colors.danger, backgroundColor: colors.danger },
  modalButtonText: { color: colors.textPrimary, fontWeight: '700' },
  modalButtonSaveText: { color: '#041013', fontWeight: '800' },
  modalButtonDeleteText: { color: '#0f0f0f', fontWeight: '800' },
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
});

export default EngineerStandsScreen;
