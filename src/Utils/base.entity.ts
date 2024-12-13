import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export default abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @CreateDateColumn({ type: 'timestamp', precision: 0 })
  _createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 0 })
  _updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', precision: 0 })
  _deletedAt: Date;
}