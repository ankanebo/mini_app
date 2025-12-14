// backend/src/schema.ts
import { gql } from 'apollo-server';
import { Context } from './context';

export const typeDefs = gql`
  enum SortOrder {
    asc
    desc
  }

  type Satellite {
    id: ID!
    name: String!
    type: String!
    electronics: [Electronics!]!
    calendar: [CalendarStage!]!
    technicalSpecs: [TechnicalSpecification!]!
    opCharacteristics: [SatelliteOperationalCharacteristic!]!
  }

  type Electronics {
    id: ID!
    model: String!
    type: String!
    location: String!
    price: Float!
  }

  type Material {
    id: ID!
    typeOfMaterial: String!
    amount: Float!
    unit: String!
  }

  type MaterialFunctionalCharacteristic {
    id: ID!
    unit: String!
    value: Float!
    description: String!
  }

  type MaterialOperationalCharacteristic {
    id: ID!
    unit: String!
    value: Float!
    description: String
    stand: Stand!
  }

  type MaterialFull {
    material: Material!
    functional: [MaterialFunctionalCharacteristic!]!
    operational: [MaterialOperationalCharacteristic!]!
  }

  type Stand {
    id: ID!
    nameOfStand: String!
    typeOfStand: String!
  }

  type Sensor {
    id: ID!
    location: String!
    value: Float
    unit: String
    description: String!
    stand: Stand!
  }

  type HardwareRequirement {
    id: ID!
    unit: String!
    value: Float!
    stand: Stand!
  }

  type PhysicalTestData {
    id: ID!
    value: Float!
    unit: String!
    description: String!
    stand: Stand!
  }

  type CalendarStage {
    id: ID!
    nameOfStage: String!
    timeOfFrame: String!
    duration: Int!
    stageOrder: Int!
  }

  type ElectronicsMinMax {
    minCost: Float
    minModel: String
    maxCost: Float
    maxModel: String
  }

  type CalendarStageStats {
    avgDuration: Float
    maxDuration: Float
    minDuration: Float
    totalDuration: Float
  }

  type TechnicalSpecification {
    id: ID!
    description: String
  }

  type SatelliteOperationalCharacteristic {
    id: ID!
    value: Float!
    unit: String!
    parameterName: String!
  }

  type Query {
    # базовое
    satellites: [Satellite!]!

    # материалы
    materials(orderByAmount: SortOrder): [Material!]!
    materialsFull(orderByAmount: SortOrder): [MaterialFull!]!

    # тех. документация и оп. характеристики спутника
    technicalSpecifications(satelliteId: ID!): [TechnicalSpecification!]!
    satelliteOpCharacteristics(satelliteId: ID!): [SatelliteOperationalCharacteristic!]!

    # электроника + агрегаты
    electronics(satelliteId: ID!): [Electronics!]!
    electronicsTotalCost(satelliteId: ID!): Float!
    electronicsAvgCost(satelliteId: ID!): Float!
    electronicsMinMaxCost(satelliteId: ID!): ElectronicsMinMax!

    # календарный план + агрегаты
    calendarStages(satelliteId: ID!): [CalendarStage!]!
    calendarStageStats(satelliteId: ID!): CalendarStageStats!

    # стенды, сенсоры, требования, испытания
    stands(satelliteId: ID): [Stand!]!
    sensors(standId: ID, satelliteId: ID): [Sensor!]!
    hardwareRequirements(standId: ID, satelliteId: ID): [HardwareRequirement!]!
    physicalTestData(standId: ID!): [PhysicalTestData!]!

    # операционные характеристики материалов
    materialOperationalCharacteristics(
      standId: ID
      materialId: ID
    ): [MaterialOperationalCharacteristic!]!
  }

  type Mutation {
    # Админ: спутники
    addSatellite(name: String!, type: String!): Satellite!

    # Админ: оп. характеристики спутника
    addSatelliteOpCharacteristic(
      satelliteId: ID!
      parameterName: String!
      value: Float!
      unit: String!
    ): SatelliteOperationalCharacteristic!

    # Админ: электроника
    addElectronics(
      satelliteId: ID!
      model: String!
      type: String!
      location: String!
      price: Float!
    ): Electronics!
    deleteElectronics(id: ID!): Boolean!

    # Обновление цены электроники
    updateElectronicsPrice(id: ID!, price: Float!): Electronics!

    # Админ: календарный план
    addCalendarStage(
      satelliteId: ID!
      nameOfStage: String!
      timeOfFrame: String!
      duration: Int!
    ): CalendarStage!
    updateCalendarStage(
      id: ID!
      nameOfStage: String!
      timeOfFrame: String!
      duration: Int!
    ): CalendarStage!
    deleteCalendarStage(id: ID!): Boolean!

    # Инженер: материалы
    addMaterial(
      typeOfMaterial: String!
      amount: Float!
      unit: String!
    ): Material!
    deleteMaterial(id: ID!): Boolean!

    # Инженер: стенды
    addStand(
      satelliteId: ID!
      nameOfStand: String!
      typeOfStand: String!
    ): Stand!
    deleteStand(id: ID!): Boolean!

    # Инженер: сенсоры
    addSensor(
      standId: ID!
      location: String!
      value: Float
      unit: String
      description: String!
    ): Sensor!
    deleteSensor(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    satellites: (_: any, __: any, { prisma }: Context) =>
      prisma.satelliteBody.findMany(),

    materials: (
      _: any,
      args: { orderByAmount?: 'asc' | 'desc' },
      { prisma }: Context
    ) =>
      prisma.material.findMany({
        orderBy: args.orderByAmount
          ? { amount: args.orderByAmount }
          : undefined,
      }),

    technicalSpecifications: (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) =>
      prisma.technicalSpecification.findMany({
        where: { satelliteBodyId: Number(args.satelliteId) },
      }),

    satelliteOpCharacteristics: (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) =>
      prisma.operationalCharacteristicsOfSatellite.findMany({
        where: { satelliteBodyId: Number(args.satelliteId) },
      }),

    materialsFull: async (
      _: any,
      args: { orderByAmount?: 'asc' | 'desc' },
      { prisma }: Context
    ) => {
      const mats = await prisma.material.findMany({
        orderBy: args.orderByAmount
          ? { amount: args.orderByAmount }
          : undefined,
        include: {
          functionalCharacteristics: true,
          opCharacteristics: { include: { stand: true } },
        },
      });

      return mats.map((m) => ({
        material: {
          id: m.id,
          typeOfMaterial: m.typeOfMaterial,
          amount: m.amount,
          unit: m.unit,
        },
        functional: m.functionalCharacteristics,
        operational: m.opCharacteristics.map((oc) => ({
          id: oc.id,
          unit: oc.unit,
          value: oc.value,
          description: oc.description,
          stand: oc.stand,
        })),
      }));
    },

    electronics: (_: any, args: { satelliteId: string }, { prisma }: Context) =>
      prisma.electronics.findMany({
        where: { satelliteBodyId: Number(args.satelliteId) },
      }),

    electronicsTotalCost: async (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) => {
      const res = await prisma.electronics.aggregate({
        where: { satelliteBodyId: Number(args.satelliteId) },
        _sum: { price: true },
      });
      return res._sum.price ?? 0;
    },

    electronicsAvgCost: async (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) => {
      const res = await prisma.electronics.aggregate({
        where: { satelliteBodyId: Number(args.satelliteId) },
        _avg: { price: true },
      });
      return res._avg.price ?? 0;
    },

    electronicsMinMaxCost: async (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) => {
      const satId = Number(args.satelliteId);
      const min = await prisma.electronics.findFirst({
        where: { satelliteBodyId: satId },
        orderBy: { price: 'asc' },
      });
      const max = await prisma.electronics.findFirst({
        where: { satelliteBodyId: satId },
        orderBy: { price: 'desc' },
      });
      return {
        minCost: min?.price ?? null,
        minModel: min?.model ?? null,
        maxCost: max?.price ?? null,
        maxModel: max?.model ?? null,
      };
    },

    calendarStages: async (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) => {
      const satId = Number(args.satelliteId);
      const rows = await prisma.$queryRaw<
        Array<{
          id: number;
          nameOfStage: string;
          timeOfFrame: Date;
          duration: number;
          stageOrder: bigint | number;
        }>
      >`
        SELECT
          id,
          name_of_stage AS nameOfStage,
          time_of_frame AS timeOfFrame,
          length AS duration,
          ROW_NUMBER() OVER (PARTITION BY technical_specification_satellite_body_id ORDER BY time_of_frame) AS stageOrder
        FROM calendar_plan
        WHERE technical_specification_satellite_body_id = ${satId}
        ORDER BY time_of_frame;
      `;

      return rows.map((row) => ({
        id: row.id,
        nameOfStage: row.nameOfStage,
        timeOfFrame: row.timeOfFrame,
        duration: row.duration,
        stageOrder: Number(row.stageOrder),
      }));
    },

    calendarStageStats: async (
      _: any,
      args: { satelliteId: string },
      { prisma }: Context
    ) => {
      const res = await prisma.calendarPlan.aggregate({
        where: { satelliteBodyId: Number(args.satelliteId) },
        _avg: { duration: true },
        _min: { duration: true },
        _max: { duration: true },
        _sum: { duration: true },
      });
      return {
        avgDuration: res._avg.duration ?? 0,
        maxDuration: res._max.duration ?? 0,
        minDuration: res._min.duration ?? 0,
        totalDuration: res._sum.duration ?? 0,
      };
    },

    stands: (_: any, args: { satelliteId?: string }, { prisma }: Context) =>
      prisma.stand.findMany({
        where: args.satelliteId
          ? { satelliteBodyId: Number(args.satelliteId) }
          : undefined,
      }),

    sensors: (
      _: any,
      args: { standId?: string; satelliteId?: string },
      { prisma }: Context
    ) => {
      if (args.standId) {
        return prisma.sensor.findMany({
          where: { standId: Number(args.standId) },
        });
      }
      if (args.satelliteId) {
        return prisma.sensor.findMany({
          where: {
            stand: { satelliteBodyId: Number(args.satelliteId) },
          },
        });
      }
      return prisma.sensor.findMany();
    },

    hardwareRequirements: (
      _: any,
      args: { standId?: string; satelliteId?: string },
      { prisma }: Context
    ) =>
      prisma.hardwareRequirement.findMany({
        where: {
          standId: args.standId ? Number(args.standId) : undefined,
          stand: args.satelliteId
            ? { satelliteBodyId: Number(args.satelliteId) }
            : undefined,
        },
      }),

    physicalTestData: (
      _: any,
      args: { standId: string },
      { prisma }: Context
    ) =>
      prisma.physicalDataForTesting.findMany({
        where: { standId: Number(args.standId) },
      }),

    materialOperationalCharacteristics: (
      _: any,
      args: { standId?: string; materialId?: string },
      { prisma }: Context
    ) =>
      prisma.operationalCharacteristicsOfMaterials.findMany({
        where: {
          standId: args.standId ? Number(args.standId) : undefined,
          materialId: args.materialId ? Number(args.materialId) : undefined,
        },
        include: { stand: true },
      }),
  },

  Mutation: {
    addSatellite: (
      _: any,
      args: { name: string; type: string },
      { prisma }: Context
    ) =>
      prisma.satelliteBody.create({
        data: {
          name: args.name,
          type: args.type,
        },
      }),

    addSatelliteOpCharacteristic: (
      _: any,
      args: {
        satelliteId: string;
        parameterName: string;
        value: number;
        unit: string;
      },
      { prisma }: Context
    ) =>
      prisma.operationalCharacteristicsOfSatellite.create({
        data: {
          satelliteBodyId: Number(args.satelliteId),
          parameterName: args.parameterName,
          value: args.value,
          unit: args.unit,
        },
      }),

    addElectronics: (
      _: any,
      args: {
        satelliteId: string;
        model: string;
        type: string;
        location: string;
        price: number;
      },
      { prisma }: Context
    ) =>
      prisma.electronics.create({
        data: {
          model: args.model,
          type: args.type,
          location: args.location,
          price: args.price,
          satelliteBodyId: Number(args.satelliteId),
        },
      }),

    deleteElectronics: async (
      _: any,
      args: { id: string },
      { prisma }: Context
    ) => {
      await prisma.electronics.delete({ where: { id: Number(args.id) } });
      return true;
    },

    updateElectronicsPrice: async (
      _: any,
      args: { id: string; price: number },
      { prisma }: Context
    ) => {
      if (args.price < 0) {
        throw new Error('Цена электроники не может быть отрицательной');
      }
      return prisma.electronics.update({
        where: { id: Number(args.id) },
        data: { price: args.price },
      });
    },

    addCalendarStage: async (
      _: any,
      args: {
        satelliteId: string;
        nameOfStage: string;
        timeOfFrame: string;
        duration: number;
      },
      { prisma }: Context
    ) => {
      const satId = Number(args.satelliteId);
      const techSpec = await prisma.technicalSpecification.findFirst({
        where: { satelliteBodyId: satId },
      });
      if (!techSpec) {
        throw new Error('Для этого спутника нет technical_specification');
      }
      const created = await prisma.calendarPlan.create({
        data: {
          nameOfStage: args.nameOfStage,
          timeOfFrame: new Date(args.timeOfFrame),
          duration: args.duration,
          techSpecId: techSpec.id,
          satelliteBodyId: satId,
        },
      });
      const orderRow = await prisma.$queryRaw<
        Array<{ rowNum: bigint | number }>
      >`
        SELECT rowNum FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY technical_specification_satellite_body_id ORDER BY time_of_frame) as rowNum
          FROM calendar_plan
          WHERE technical_specification_satellite_body_id = ${satId}
        ) ranked WHERE id = ${created.id}
      `;
      const stageOrder = orderRow[0]?.rowNum ?? 1;
      return { ...created, stageOrder: Number(stageOrder) };
    },

    updateCalendarStage: async (
      _: any,
      args: {
        id: string;
        nameOfStage: string;
        timeOfFrame: string;
        duration: number;
      },
      { prisma }: Context
    ) => {
      const updated = await prisma.calendarPlan.update({
        where: { id: Number(args.id) },
        data: {
          nameOfStage: args.nameOfStage,
          timeOfFrame: new Date(args.timeOfFrame),
          duration: args.duration,
        },
      });
      const orderRow = await prisma.$queryRaw<
        Array<{ rowNum: bigint | number }>
      >`
        SELECT rowNum FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY technical_specification_satellite_body_id ORDER BY time_of_frame) as rowNum
          FROM calendar_plan
          WHERE technical_specification_satellite_body_id = ${updated.satelliteBodyId}
        ) ranked WHERE id = ${updated.id}
      `;
      const stageOrder = orderRow[0]?.rowNum ?? 1;
      return { ...updated, stageOrder: Number(stageOrder) };
    },

    deleteCalendarStage: async (
      _: any,
      args: { id: string },
      { prisma }: Context
    ) => {
      await prisma.calendarPlan.delete({ where: { id: Number(args.id) } });
      return true;
    },

    addMaterial: (
      _: any,
      args: { typeOfMaterial: string; amount: number; unit: string },
      { prisma }: Context
    ) =>
      prisma.material.create({
        data: {
          typeOfMaterial: args.typeOfMaterial,
          amount: args.amount,
          unit: args.unit,
        },
      }),

    deleteMaterial: async (
      _: any,
      args: { id: string },
      { prisma }: Context
    ) => {
      await prisma.material.delete({ where: { id: Number(args.id) } });
      return true;
    },

    addStand: async (
      _: any,
      args: {
        satelliteId: string;
        nameOfStand: string;
        typeOfStand: string;
      },
      { prisma }: Context
    ) => {
      const satId = Number(args.satelliteId);
      const techSpec = await prisma.technicalSpecification.findFirst({
        where: { satelliteBodyId: satId },
      });
      if (!techSpec) {
        throw new Error('Для этого спутника нет technical_specification');
      }
      return prisma.stand.create({
        data: {
          nameOfStand: args.nameOfStand,
          typeOfStand: args.typeOfStand,
          techSpecId: techSpec.id,
          satelliteBodyId: satId,
        },
      });
    },

    deleteStand: async (
      _: any,
      args: { id: string },
      { prisma }: Context
    ) => {
      await prisma.stand.delete({ where: { id: Number(args.id) } });
      return true;
    },

    addSensor: (
      _: any,
      args: {
        standId: string;
        location: string;
        value?: number;
        unit?: string;
        description: string;
      },
      { prisma }: Context
    ) =>
      prisma.sensor.create({
        data: {
          standId: Number(args.standId),
          location: args.location,
          value: args.value ?? null,
          unit: args.unit ?? null,
          description: args.description,
        },
      }),

    deleteSensor: async (
      _: any,
      args: { id: string },
      { prisma }: Context
    ) => {
      await prisma.sensor.delete({ where: { id: Number(args.id) } });
      return true;
    },
  },

  Satellite: {
    electronics: (parent: any, _: any, { prisma }: Context) =>
      prisma.electronics.findMany({
        where: { satelliteBodyId: parent.id },
      }),
    calendar: (parent: any, _: any, { prisma }: Context) =>
      prisma.calendarPlan.findMany({
        where: { satelliteBodyId: parent.id },
      }),
    technicalSpecs: (parent: any, _: any, { prisma }: Context) =>
      prisma.technicalSpecification.findMany({
        where: { satelliteBodyId: parent.id },
      }),
    opCharacteristics: (parent: any, _: any, { prisma }: Context) =>
      prisma.operationalCharacteristicsOfSatellite.findMany({
        where: { satelliteBodyId: parent.id },
      }),
  },

  Sensor: {
    stand: (parent: any, _: any, { prisma }: Context) =>
      prisma.stand.findUnique({ where: { id: parent.standId } }),
  },

  HardwareRequirement: {
    stand: (parent: any, _: any, { prisma }: Context) =>
      prisma.stand.findUnique({ where: { id: parent.standId } }),
  },

  PhysicalTestData: {
    stand: (parent: any, _: any, { prisma }: Context) =>
      prisma.stand.findUnique({ where: { id: parent.standId } }),
  },

  MaterialOperationalCharacteristic: {},
};
