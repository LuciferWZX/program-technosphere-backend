import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Authority, LoginDevice, Sex } from './type';
import { IsEmail, IsPhoneNumber, Length } from 'class-validator';
@Entity({
  name: 'tb_user',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    default:
      'https://img2.baidu.com/it/u=3064904053,3191769934&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1669395600&t=e37c1279968e38084b5c2fde1b5dc939',
  })
  avatar: string;
  @IsEmail()
  @Column({ unique: true })
  email: string;
  @IsPhoneNumber('CN', { message: '请输入正确的手机号码' })
  @Column({ unique: true })
  phone: string;
  @Length(1, 18)
  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;
  @Length(1, 28)
  @Column({ type: 'varchar', length: 20, unique: true })
  username: string;
  @Length(6, 20)
  @Column({ select: false }) //将密码过滤掉
  password: string;
  @Column({ select: false }) //将pin码过滤掉
  pin: string;
  @CreateDateColumn()
  createdDate: Date;
  @CreateDateColumn()
  updatedDate: Date;
  @Column({ type: 'enum', enum: Authority, default: Authority.user })
  authority: Authority;
  @Column({ type: 'enum', enum: Sex, default: Sex.TwoDimensional })
  sex: Sex;
  @Column({ type: 'boolean', default: false })
  banned: boolean;
  device: LoginDevice;
  token: string;
}
