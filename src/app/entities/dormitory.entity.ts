import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Building } from './building.entity';

// Общежитие (Dormitory)
// • id: Уникальный идентификатор (UUID)
// • name: Название общежития
// • capacity: Вместимость
// • buildingId: Идентификатор корпуса (связь с сущностью Building)

@Entity()
export class Dormitory extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column()
  buildingId: string;

  @ManyToOne(() => Building, building => building.dormitories)
  building: Building;
}
