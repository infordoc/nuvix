import { Entity, Column, Index, OneToMany } from "typeorm";
import BaseEntity from "../base.entity";
import { TargetEntity } from "./target.entity";

@Entity({ name: 'providers', schema: 'messages' })
export class ProviderEntity extends BaseEntity {
    @Index()
    @Column({ type: 'varchar', length: 128, nullable: false })
    name: string;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: false })
    provider: string;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: false })
    type: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    enabled: boolean;

    @Column({ type: 'varchar', length: 16384, nullable: false })
    credentials: string;

    @Column({ type: 'varchar', length: 16384, nullable: true, default: '' })
    options: string;

    @OneToMany(() => TargetEntity, target => target.provider, { cascade: true })
    targets: TargetEntity[];
}