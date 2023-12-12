import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  tenMonAn: string;
  @Column()
  thanhPhan: string;
  @Column()
  thoiGianNauTrungBinh: string;
  @Column()
  buoiPhucVu: string;
  @Column()
  calo: number;
}
