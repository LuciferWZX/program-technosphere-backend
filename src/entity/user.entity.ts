import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Authority, Sex } from './type';
import { IsEmail, Length } from 'class-validator';
@Entity({
  name: 'tb_user',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsEmail()
  @Column({ unique: true })
  email: string;
  @Length(1, 18)
  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;
  @Length(1, 28)
  @Column({ type: 'varchar', length: 20, unique: true })
  username: string;
  @Length(6, 20)
  @Column({ select: false }) //将密码过滤掉
  password: string;
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
}
