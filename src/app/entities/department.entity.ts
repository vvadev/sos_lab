import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BaseEntity } from 'typeorm';
import { Institute } from './institute.entity';
import { StudyDirection } from './study-direction.entity';

// Кафедра (Department)
// • id: Уникальный идентификатор (UUID)
// • name: Название кафедры
// • instituteId: Идентификатор института (связь с сущностью Institute)

@Entity()
export class Department extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  instituteId: string;

  @ManyToOne(() => Institute, institute => institute.departments)
  institute: Institute;

  @OneToMany(() => StudyDirection, studyDirection => studyDirection.department)
  studyDirections: StudyDirection[];
}
