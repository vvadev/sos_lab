import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Department } from './department.entity';
import { Applicant } from './applicant.entity';

// Институт (Institute)
// • id: Уникальный идентификатор (UUID)
// • name: Название института
// • address: Адрес

@Entity()
export class Institute extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Department, department => department.institute)
  departments: Department[];

  @OneToMany(() => Applicant, applicant => applicant.institute)
  applicants: Applicant[];
}
