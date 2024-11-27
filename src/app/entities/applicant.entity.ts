import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { StudyDirection } from './study-direction.entity';
import { Institute } from './institute.entity';

// Абитуриент (Applicant)
// • id: Уникальный идентификатор (UUID)
// • firstName: Имя
// • lastName: Фамилия
// • email: Электронная почта
// • phone: Телефон
// • studyDirectionId: Идентификатор направления подготовки (связь с сущностью StudyDirection)
// • instituteId: Идентификатор института (связь с сущностью Institute)

@Entity()
export class Applicant extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  studyDirectionId: string;

  @Column()
  instituteId: string;

  @ManyToOne(() => StudyDirection, studyDirection => studyDirection.applicants)
  studyDirection: StudyDirection;

  @ManyToOne(() => Institute, institute => institute.applicants)
  institute: Institute;

}
