import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  calo: number;
  @Column()
  type: string;
  @Column()
  unit: string;
}
