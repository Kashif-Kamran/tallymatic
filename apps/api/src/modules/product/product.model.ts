import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Status } from '@shared';

import { Category } from '../category';
import { Organization } from '../organization/organization.model';
import { ProductCategory } from '../product-category';

@Table({
  timestamps: true,
  tableName: 'products',
})
export class Product extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  organizationId: string;

  @BelongsTo(() => Organization)
  organization: Organization;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  storeId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  basePrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  costPrice: number;

  @Column({
    type: DataType.ENUM({ values: Object.values(Status) }),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  status: Status;

  @BelongsToMany(() => Category, () => ProductCategory)
  categories: Category[];
}
