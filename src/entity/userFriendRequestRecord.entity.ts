import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendRequestRecordStatusType, ResponseStatusType } from './type';
@Entity({
  name: 'tb_user_friends_record',
})
export class UserFriendRequestRecord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  senderId: string; ///发送方的id
  @Column({ nullable: true })
  receiverId: string; ///接收方的id
  @CreateDateColumn()
  createdDate: Date; ///创建的时间
  @CreateDateColumn()
  updatedDate: Date; ///更新的时间
  @Column({ type: 'varchar', length: 50, nullable: true })
  senderDesc: string; ///请求描述
  @Column({ nullable: true })
  senderRemark: string; ///发送方对接收方的备注
  @Column({ type: 'varchar', length: 50, nullable: true })
  denialReason: string; ///拒绝原因
  @Column({
    type: 'enum',
    enum: ResponseStatusType,
    default: ResponseStatusType.Handling,
  })
  responseStatus: ResponseStatusType; ///接收者处理这个请求的状态
  @Column({
    type: 'enum',
    enum: FriendRequestRecordStatusType,
    default: FriendRequestRecordStatusType.NotDeleted,
  })
  deleteStatus: FriendRequestRecordStatusType; ///两者对这个记录是否删除

  friendInfo?: {
    id: string;
    nickname: string;
    username: string;
    avatar: string;
  };
}
