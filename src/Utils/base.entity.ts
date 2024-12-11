import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export default abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @CreateDateColumn()
  _createdAt: Date;

  @UpdateDateColumn()
  _updatedAt: Date;

  @DeleteDateColumn()
  _deletedAt: Date;
}