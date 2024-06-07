import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table
export default class UsersRevenue extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    userId: string;

    @Column(DataType.DOUBLE)
    revenue: number;
}