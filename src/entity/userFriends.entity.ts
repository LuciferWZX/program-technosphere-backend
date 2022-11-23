import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'tb_user_friends',
})
export class UserFriendsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false })
  fRecordId: string; ///是通过哪条记录添加的
  @Column({ nullable: false })
  senderId: string; ///发送方的id
  @Column()
  senderRemark: string; ///发送方对接收方的备注
  @Column({ nullable: false })
  receiverId: string; ///接收方的id
  @Column()
  receiverRemark: string; ///接收方对发送方的备注
  @CreateDateColumn()
  createdDate: Date; ///创建的时间
  @CreateDateColumn()
  updatedDate: Date; ///更新的时间
  @Column({ nullable: true })
  deletedId: string; ///主动删除好友的id
}
