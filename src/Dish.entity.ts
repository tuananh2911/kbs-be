import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Dish{
    @PrimaryGeneratedColumn()
    id:string;

    @Column()
    TenMonAn:string
    @Column()
    ThanhPhan:string;
    @Column()
    ThoiGianNauTrungBinh:string;
    @Column()
    BuoiPhucVu:string;
    @Column()
    Calo:number;
}