import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LoginDevice, Sex } from './type';

@Entity({
  name: 'tb_login_record',
})
export class UserRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  userId: string;
  @Column()
  ip: string;
  @CreateDateColumn()
  loginDate: Date;
  @Column({ type: 'enum', enum: LoginDevice, default: LoginDevice.Web })
  device: LoginDevice;
}
