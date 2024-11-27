import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BaseEntity } from 'typeorm';
import { Department } from './department.entity';
import { Applicant } from './applicant.entity';

// Направление подготовки (StudyDirection)
// • id: Уникальный идентификатор (UUID)
// • name: Название направления
// • departmentId: Идентификатор кафедры (связь с сущностью Department)

@Entity()
export class StudyDirection  extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department, department => department.studyDirections)
  department: Department;

  @OneToMany(() => Applicant, applicant => applicant.studyDirection)
  applicants: Applicant[];
}
