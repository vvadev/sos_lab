import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Dormitory } from './dormitory.entity';

// Корпус (Building)
// • id: Уникальный идентификатор (UUID)
// • name: Название корпуса
// • address: Адрес

@Entity()
export class Building extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Dormitory, dormitory => dormitory.building)
  dormitories: Dormitory[];
}
