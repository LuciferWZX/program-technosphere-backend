import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentType, Result } from './type';

//一对一单条消息
@Entity({
  name: 'tb_message',
})
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; //id
  @Column({ nullable: false })
  senderId: string; //发送者id
  @Column({ nullable: false })
  receiverId: string; //接收者id
  @Column({ type: 'text' })
  content: string; //内容
  @Column({ type: 'enum', enum: ContentType, default: ContentType.text })
  contentType: ContentType; //内容类型
  @CreateDateColumn()
  createdDate: Date; //创建日期
  @UpdateDateColumn()
  updatedDate: Date; //更新日期
  @Column({
    type: 'enum',
    enum: Result,
    default: Result.No,
  })
  senderDeleted: Result; //发送者是否删除该条消息
  @Column({
    type: 'enum',
    enum: Result,
    default: Result.No,
  })
  receiverDeleted: Result; //接收者是否删除该条消息
  @Column({
    type: 'enum',
    enum: Result,
    default: Result.No,
  })
  revoke: Result; //是否撤销
  @Column({
    type: 'enum',
    enum: Result,
    default: Result.No,
  })
  isRead: Result; //已读/未读
}
