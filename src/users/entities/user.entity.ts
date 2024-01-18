import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log('다음 id 사용자가 입력 되었다', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('다음 id 사용자가 업데이트 되었다', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('다음 id 사용자가 삭제 되었다', this.id);
  }
}
